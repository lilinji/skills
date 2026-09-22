/* ==========================================================================
  丰度交互热图（相对丰度 · 行归一化 · 层次聚类）  ·  D3 v7
   流程：原始丰度 → 列和归一化求相对丰度% → 双阈值筛选 → 行归一化 →
         行(列)层次聚类 → 渲染
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------- 0. 数据 ---------------- */
  var RAW = window.HEATMAP_DATA;
  var META = RAW.meta || {};                  // 文案与口径（构建脚本注入）
  var DEFAULTS = RAW.defaults || {};           // 默认阈值
  var TITLE = META.title || '丰度热图';
  var ENTITY = META.entityShort || META.entity || '特征';
  var NO_NORM = !!META.noNormalize;            // 未做列和归一化：阈值按原始数值解释
  var HAS_ANN = META.hasAnnotation !== false;  // 是否有层级/分类注释列
  var VAL_LABEL = NO_NORM ? '丰度' : '相对丰度';
  var VAL_SUFFIX = NO_NORM ? '' : ' %';
  var UNIT_SUFFIX = NO_NORM ? '' : '%';
  function fname(suffix) { return String(TITLE).replace(/[\\\/:*?"<>|]/g, '_') + suffix; }
  var SAMPLES = RAW.samples;                 // [{n:'CK_1', g:'CK'}]
  var FEATURES = RAW.features;               // [{id, name, hier, top, v:[...]}]
  var GROUP_ORDER = RAW.groups;              // 有序分组名
  var TOP_COLORS = RAW.topColors || {};
  var M = SAMPLES.length;
  var N = FEATURES.length;
  /* 数值统一转 Number（防止数据源为字符串造成求和变成拼接） */
  FEATURES.forEach(function (f) {
    var arr = new Array(M);
    for (var k = 0; k < M; k++) arr[k] = +f.v[k] || 0;
    f.v = arr;
  });

  var SAMPLE_GROUP = SAMPLES.map(function (s) { return s.g; });
  var COLSUM = new Float64Array(M);
  /* REL[i][j]：第 i 个特征在第 j 个样本中的相对丰度 %（列和归一化；--no-normalize 时为原值） */
  var REL = FEATURES.map(function (f) { return new Array(M); });
  var GROUP_COLORS = {};
  (function () {
    var pal = d3.schemeTableau10.concat(d3.schemeSet3);
    GROUP_ORDER.forEach(function (g, i) { GROUP_COLORS[g] = pal[i % pal.length]; });
  })();

  (function () {
    var i, j, s;
    if (NO_NORM) {                                   /* 按原值使用 */
      for (j = 0; j < M; j++) COLSUM[j] = 1;
      for (i = 0; i < N; i++) for (j = 0; j < M; j++) REL[i][j] = FEATURES[i].v[j];
      return;
    }
    for (j = 0; j < M; j++) {
      s = 0;
      for (i = 0; i < N; i++) s += FEATURES[i].v[j];
      COLSUM[j] = s;
    }
    for (i = 0; i < N; i++) {
      for (j = 0; j < M; j++) {
        REL[i][j] = COLSUM[j] > 0 ? FEATURES[i].v[j] / COLSUM[j] * 100 : 0;
      }
    }
  })();

  /* 每个特征的汇总统计（筛选依据） */
  var STATS = REL.map(function (r) {
    var s = 0, mx = 0, mn = Infinity, prev = 0, k;
    for (k = 0; k < r.length; k++) {
      s += r[k];
      if (r[k] > mx) mx = r[k];
      if (r[k] < mn) mn = r[k];
      if (r[k] > 0) prev++;
    }
    return { mean: s / r.length, max: mx, min: mn === Infinity ? 0 : mn, prev: prev, sum: s };
  });

  /* ---------------- 1. 常量 ---------------- */
  var PALETTES = {
    rdbu: { label: '蓝-白-红', fn: function (t) { return d3.interpolateRdBu(1 - t); } },
    rdylbu: { label: '蓝-黄-红', fn: function (t) { return d3.interpolateRdYlBu(1 - t); } },
    rdbu2: { label: '红-白-蓝', fn: function (t) { return d3.interpolateRdBu(t); } },
    turbo: { label: 'turbo', fn: d3.interpolateTurbo },
    viridis: { label: 'viridis', fn: d3.interpolateViridis },
    plasma: { label: 'plasma', fn: d3.interpolatePlasma },
    ylgnbu: { label: 'YlGnBu', fn: d3.interpolateYlGnBu },
    magma: { label: 'magma', fn: d3.interpolateMagma },
    greys: { label: '灰阶', fn: d3.interpolateGreys }
  };
  var TRANSFORM_LABEL = {
    'row.zscore': '行 Z-score', 'row.center': '行中心化', 'row.minmax': '行 Min-Max',
    'log10': 'log10(x+1)', 'none': '不归一化'
  };
  var DIST_LABEL = { euclidean: '欧氏距离', correlation: '相关距离', cosine: '余弦距离', manhattan: '曼哈顿距离' };
  var LINKAGE_LABEL = { average: '平均连接', complete: '完全连接', single: '单连接', ward: 'Ward.D2' };
  var FMT = {
    f0: d3.format(',.0f'), f1: d3.format('.1f'), f2: d3.format('.2f'),
    f3: d3.format('.3f'), f4: d3.format('.4f')
  };
  var SVGNS = 'http://www.w3.org/2000/svg';

  /* ---------------- 2. 状态 ---------------- */
  var state = {
    abRule: 'mean',
    abThresh: DEFAULTS.abThresh !== undefined ? DEFAULTS.abThresh : (NO_NORM ? 0 : 1.0),
    fracN: 10,
    prevOn: DEFAULTS.prevOn !== false,
    prevN: DEFAULTS.prevN || 10,
    search: '', topN: DEFAULTS.topN || 0,
    transform: 'row.zscore', basis: 'rel', scheme: 'rdbu', sym: true, clip: 0,
    rowCluster: true, dist: 'euclidean', linkage: 'average', rowOrder: 'cluster',
    colMode: 'sample', colOrder: 'original',
    showRowDendro: true, showColDendro: false, showAnn: true, showStrip: HAS_ANN,
    showGrid: true, showValues: false, rowLabel: 'name', font: 11
  };
  var VIEW = null, gPan = null, zoomK = 1, selected = null, cellH = 12, cellW = 12;
  var CUR_FEATIDX = [], markSel = function () {}, rowLabelSel = null, hoverRow = null;

  /* ---------------- 3. 数学工具 ---------------- */
  function mean(a) { var s = 0, i; for (i = 0; i < a.length; i++) s += a[i]; return a.length ? s / a.length : 0; }
  function sd(a) {
    var m = mean(a), s = 0, i;
    for (i = 0; i < a.length; i++) { var d = a[i] - m; s += d * d; }
    return a.length > 1 ? Math.sqrt(s / (a.length - 1)) : 0;
  }
  function pearson(a, b) {
    var ma = mean(a), mb = mean(b), num = 0, da = 0, db = 0, i;
    for (i = 0; i < a.length; i++) {
      var x = a[i] - ma, y = b[i] - mb;
      num += x * y; da += x * x; db += y * y;
    }
    var den = Math.sqrt(da * db);
    return den > 0 ? num / den : 0;
  }
  var DIST = {
    euclidean: function (a, b) { var s = 0, i; for (i = 0; i < a.length; i++) { var d = a[i] - b[i]; s += d * d; } return Math.sqrt(s); },
    manhattan: function (a, b) { var s = 0, i; for (i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]); return s; },
    correlation: function (a, b) { return 1 - pearson(a, b); },
    cosine: function (a, b) {
      var num = 0, da = 0, db = 0, i;
      for (i = 0; i < a.length; i++) { num += a[i] * b[i]; da += a[i] * a[i]; db += b[i] * b[i]; }
      var den = Math.sqrt(da * db);
      return den > 0 ? 1 - num / den : 1;
    }
  };
  function clamp(x, lo, hi) { return x < lo ? lo : (x > hi ? hi : x); }

  /* ---------------- 4. 层次聚类（Lance–Williams 递推） ---------------- */
  function hclust(X, distName, linkage) {
    var n = X.length;
    if (n === 0) return { order: [], merges: [], maxH: 0, hOf: new Float64Array(0) };
    if (n === 1) return { order: [0], merges: [], maxH: 0, hOf: new Float64Array(1) };
    var dfn = DIST[distName] || DIST.euclidean;
    var cap = 2 * n;
    var D = new Float64Array(cap * cap);
    var live = new Uint8Array(cap);
    var count = new Float64Array(cap);
    var hOf = new Float64Array(cap);
    var i, j, k;
    for (i = 0; i < n; i++) { live[i] = 1; count[i] = 1; }
    for (i = 0; i < n; i++) {
      for (j = 0; j < i; j++) {
        var d0 = dfn(X[i], X[j]);
        D[i * cap + j] = d0; D[j * cap + i] = d0;
      }
    }
    var merges = [];
    var next = n;
    for (k = 0; k < n - 1; k++) {
      var bi = -1, bj = -1, bd = Infinity;
      for (i = 0; i < next; i++) {
        if (!live[i]) continue;
        for (j = 0; j < i; j++) {
          if (!live[j]) continue;
          var d = D[i * cap + j];
          if (d < bd) { bd = d; bi = i; bj = j; }
        }
      }
      if (bi < 0) break;
      var u = next++;
      var ni = count[bi], nj = count[bj], nu = ni + nj;
      live[u] = 1; count[u] = nu; hOf[u] = bd;
      live[bi] = 0; live[bj] = 0;
      merges.push({ a: bj, b: bi, u: u, h: bd, size: nu });
      for (var v = 0; v < u; v++) {
        if (!live[v]) continue;
        var div = D[bi * cap + v], djv = D[bj * cap + v], nv = count[v], nd;
        if (linkage === 'single') nd = Math.min(div, djv);
        else if (linkage === 'complete') nd = Math.max(div, djv);
        else if (linkage === 'ward') nd = Math.sqrt(Math.max(0,
          ((ni + nv) * div * div + (nj + nv) * djv * djv - nv * bd * bd) / (nu + nv)));
        else nd = (ni * div + nj * djv) / nu;          /* average / UPGMA */
        D[u * cap + v] = nd; D[v * cap + u] = nd;
      }
    }
    var children = {};
    merges.forEach(function (m) { children[m.u] = [m.a, m.b]; });
    var root = merges.length ? merges[merges.length - 1].u : 0;
    var order = [];
    (function dfs(id) {
      var ch = children[id];
      if (!ch) { order.push(id); return; }
      dfs(ch[0]); dfs(ch[1]);
    })(root);
    return { order: order, merges: merges, maxH: merges.length ? merges[merges.length - 1].h : 1, hOf: hOf };
  }

  /* 树状图几何：叶序 → 位置(0.5,1.5,…)，合并高度 → 距离轴 */
  function dendroGeom(res) {
    var n = res.order.length;
    var pos = new Float64Array(res.merges.length + n + 1);
    res.order.forEach(function (id, k) { pos[id] = k + 0.5; });
    var nodes = [];
    res.merges.forEach(function (m) {
      var yA = pos[m.a], yB = pos[m.b], yU = (yA + yB) / 2;
      pos[m.u] = yU;
      nodes.push({ yA: yA, yB: yB, yU: yU, hA: res.hOf[m.a], hB: res.hOf[m.b], hU: m.h });
    });
    return { nodes: nodes, maxH: res.maxH > 0 ? res.maxH : 1 };
  }

  /* ---------------- 5. 文本度量 ---------------- */
  var _ctx = document.createElement('canvas').getContext('2d');
  var FONT_STACK = '-apple-system, "PingFang SC", "Hiragino Sans GB", sans-serif';
  function textPx(str, font) {
    _ctx.font = font + 'px ' + FONT_STACK;
    return _ctx.measureText(str).width;
  }
  function truncate(str, maxPx, font) {
    if (maxPx <= 0) return '';
    if (textPx(str, font) <= maxPx) return str;
    var lo = 0, hi = str.length;
    while (lo < hi) {
      var mid = Math.ceil((lo + hi) / 2);
      if (textPx(str.slice(0, mid) + '…', font) <= maxPx) lo = mid; else hi = mid - 1;
    }
    return str.slice(0, Math.max(1, lo)) + '…';
  }

  /* ---------------- 6. 计算视图 ---------------- */
  function labelOf(f, mode) {
    if (mode === 'id') return f.id;
    if (mode === 'both') return f.id + ' ' + f.name;
    if (mode === 'none') return '';
    return f.name;
  }

  function buildView() {
    var i, j, k;

    /* 6.1 特征筛选 */
    var keep = [];
    for (i = 0; i < N; i++) {
      var st = STATS[i], passAb, passPrev;
      if (state.abRule === 'mean') passAb = st.mean >= state.abThresh;
      else if (state.abRule === 'max') passAb = st.max >= state.abThresh;
      else {
        var c = 0;
        for (k = 0; k < M; k++) if (REL[i][k] >= state.abThresh) c++;
        passAb = c >= state.fracN;
      }
      passPrev = !state.prevOn || st.prev >= state.prevN;
      if (passAb && passPrev) keep.push(i);
    }
    if (state.search) {
      var q = state.search.toLowerCase();
      keep = keep.filter(function (fi) {
        var f = FEATURES[fi];
        return (f.id + ' ' + f.name + ' ' + f.hier).toLowerCase().indexOf(q) >= 0;
      });
    }
    if (state.topN > 0) {
      keep.sort(function (a, b) { return STATS[b].mean - STATS[a].mean; });
      keep = keep.slice(0, state.topN);
    }

    /* 6.2 列定义 */
    var cols = [];
    if (state.colMode === 'group') {
      GROUP_ORDER.forEach(function (g) {
        var idxs = [];
        for (var jj = 0; jj < M; jj++) if (SAMPLE_GROUP[jj] === g) idxs.push(jj);
        if (idxs.length) cols.push({ label: g, group: g, color: GROUP_COLORS[g] || '#999', idxs: idxs, j: null });
      });
    } else {
      for (j = 0; j < M; j++) {
        cols.push({ label: SAMPLES[j].n, group: SAMPLES[j].g, color: GROUP_COLORS[SAMPLES[j].g] || '#999', j: j, idxs: [j] });
      }
    }
    if (state.colOrder === 'group') {
      cols.sort(function (a, b) { return GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group); });
    }

    /* 6.3 基础矩阵（相对丰度 % 或原始值；分组均值） */
    var X = keep.map(function (fi) {
      return cols.map(function (c) {
        if (c.j !== null) return state.basis === 'raw' ? FEATURES[fi].v[c.j] : REL[fi][c.j];
        var s = 0;
        for (var t = 0; t < c.idxs.length; t++) {
          s += state.basis === 'raw' ? FEATURES[fi].v[c.idxs[t]] : REL[fi][c.idxs[t]];
        }
        return s / c.idxs.length;
      });
    });

    /* 6.4 行归一化 */
    var Z = X.map(function (row) {
      var m, s, mn, mx, r, i2;
      if (state.transform === 'row.zscore') {
        m = mean(row); s = sd(row);
        return row.map(function (x) { return s > 0 ? (x - m) / s : 0; });
      }
      if (state.transform === 'row.center') {
        m = mean(row);
        return row.map(function (x) { return x - m; });
      }
      if (state.transform === 'row.minmax') {
        mn = Infinity; mx = -Infinity;
        for (i2 = 0; i2 < row.length; i2++) { if (row[i2] < mn) mn = row[i2]; if (row[i2] > mx) mx = row[i2]; }
        r = mx - mn;
        return row.map(function (x) { return r > 0 ? (x - mn) / r : 0.5; });
      }
      if (state.transform === 'log10') return row.map(function (x) { return Math.log(x + 1) / Math.LN10; });
      return row.slice();
    });

    /* 6.5 列聚类 */
    var colDendro = null;
    if (state.colOrder === 'cluster' && cols.length > 1) {
      var colVecs = cols.map(function (c2, ci) {
        return Z.map(function (row) { return row[ci]; });
      });
      var cres = hclust(colVecs, state.dist, state.linkage);
      colDendro = dendroGeom(cres);
      var perm = cres.order.slice();
      cols = perm.map(function (kk) { return cols[kk]; });
      Z = Z.map(function (row) { return perm.map(function (kk) { return row[kk]; }); });
      X = X.map(function (row) { return perm.map(function (kk) { return row[kk]; }); });
    }

    /* 6.6 行聚类 */
    var rowDendro = null, rowPerm = null;
    if (state.rowCluster && Z.length > 1) {
      var res = hclust(Z, state.dist, state.linkage);
      rowPerm = res.order.slice();
      rowDendro = dendroGeom(res);
    }

    /* 6.7 行排序 */
    if (state.rowOrder === 'original' || !rowPerm) rowPerm = d3.range(Z.length);
    else if (state.rowOrder === 'abundance') {
      rowPerm = d3.range(Z.length).sort(function (a, b) { return STATS[keep[b]].mean - STATS[keep[a]].mean; });
    } else if (state.rowOrder === 'name') {
      rowPerm = d3.range(Z.length).sort(function (a, b) { return d3.ascending(FEATURES[keep[a]].name, FEATURES[keep[b]].name); });
    } else if (state.rowOrder === 'hierarchy') {
      rowPerm = d3.range(Z.length).sort(function (a, b) {
        var fa = FEATURES[keep[a]], fb = FEATURES[keep[b]];
        return d3.ascending(fa.top || '', fb.top || '') || d3.ascending(fa.hier || '', fb.hier || '') ||
          d3.ascending(fa.name, fb.name);
      });
    }
    Z = rowPerm.map(function (kk) { return Z[kk]; });
    X = rowPerm.map(function (kk) { return X[kk]; });
    var featIdx = rowPerm.map(function (kk) { return keep[kk]; });

    /* 6.8 行元信息 */
    var rows = featIdx.map(function (fi, r) {
      var f = FEATURES[fi];
      return {
        fi: fi, r: r, id: f.id, name: f.name, hier: f.hier, top: f.top || '未分类',
        label: labelOf(f, state.rowLabel), stat: STATS[fi], z: Z[r]
      };
    });

    /* 6.9 配色区间 */
    var flat = [];
    for (i = 0; i < Z.length; i++) for (j = 0; j < Z[i].length; j++) flat.push(Z[i][j]);
    flat.sort(d3.ascending);
    var lo = flat.length ? flat[0] : 0, hi = flat.length ? flat[flat.length - 1] : 1;
    if (state.clip > 0 && flat.length > 20) {
      lo = d3.quantile(flat, state.clip / 100);
      hi = d3.quantile(flat, 1 - state.clip / 100);
    }
    if (state.sym) {
      var a = Math.max(Math.abs(lo), Math.abs(hi));
      lo = -a; hi = a;
    }
    if (!(hi > lo)) { lo -= 0.5; hi += 0.5; }
    var pal = (PALETTES[state.scheme] || PALETTES.rdbu).fn;
    var color = function (v) { return pal(clamp((v - lo) / (hi - lo), 0, 1)); };

    return {
      rows: rows, cols: cols, Z: Z, X: X, featIdx: featIdx,
      rowDendro: rowDendro, colDendro: colDendro,
      nrow: rows.length, ncol: cols.length,
      domain: { lo: lo, hi: hi }, color: color,
      kept: keep.length, total: N
    };
  }

  /* ---------------- 7. 渲染 ---------------- */
  var svg = d3.select('#heatmap');
  var tooltip = d3.select('#tooltip');

  var zoom = d3.zoom()
    .scaleExtent([0.3, 80])
    .on('zoom', function (ev) {
      if (gPan) gPan.attr('transform', ev.transform);
      zoomK = ev.transform.k;
      updateThinning();
      document.getElementById('zoomInfo').textContent =
        (zoomK > 1.02 || zoomK < 0.98) ? '缩放 ' + FMT.f2(zoomK) + '×' : '';
    });
  svg.call(zoom).on('dblclick.zoom', null);

  function resetView(animate) {
    var t = d3.zoomIdentity;
    if (animate) svg.transition().duration(240).call(zoom.transform, t);
    else svg.call(zoom.transform, t);
    zoomK = 1;
    updateThinning();
    document.getElementById('zoomInfo').textContent = '';
  }

  function updateThinning() {
    if (!gPan) return;
    var rh = cellH * zoomK, cw = cellW * zoomK;
    var rStep = rh < 9 ? Math.ceil(9 / rh) : 1;
    var cStep = cw < 8 ? Math.ceil(8 / cw) : 1;
    gPan.selectAll('text.row-label').attr('display', function (d) { return (d.r % rStep) ? 'none' : null; });
    gPan.selectAll('rect.strip').attr('display', function (d) { return (d.r % rStep) ? 'none' : null; });
    gPan.selectAll('text.col-label').attr('display', function (d, i) { return (i % cStep) ? 'none' : null; });
    gPan.selectAll('text.cell-value').attr('display', function () {
      return (cw > 26 && rh > 13) ? null : 'none';
    });
  }

  function drawAll() {
    var wrap = document.getElementById('chartWrap');
    var W = Math.max(340, wrap.clientWidth), H = Math.max(240, wrap.clientHeight);
    svg.selectAll('g').remove();
    svg.attr('viewBox', '0 0 ' + W + ' ' + H);
    tooltip.style('opacity', 0);

    var V = VIEW;
    if (!V || !V.nrow || !V.ncol) {
      gPan = null;
      markSel = function () {};
      svg.append('text').attr('x', W / 2).attr('y', H / 2)
        .attr('text-anchor', 'middle').attr('fill', '#8a97a8').attr('font-size', 13)
        .text('当前筛选条件下没有保留任何特征，请放宽阈值或清除检索条件');
      return;
    }

    var font = state.font;
    var nR = V.nrow, nC = V.ncol;
    var rows = V.rows, cols = V.cols;

    /* --- 版式尺寸 --- */
    var padL = 12, padT = 14, padB = 10, padR = 12;
    var rowLabels = state.rowLabel !== 'none';
    var maxLabelPx = 0;
    rows.forEach(function (d) { maxLabelPx = Math.max(maxLabelPx, textPx(d.label, font)); });
    var labelW = rowLabels ? clamp(Math.ceil(maxLabelPx) + 8, 44, 330) : 0;
    var stripW = state.showStrip ? 6 : 0;
    var dendroW = (state.showRowDendro && V.rowDendro) ? clamp(Math.round(W * 0.11), 56, 150) : 0;
    var colLenPx = 0;
    cols.forEach(function (c) { colLenPx = Math.max(colLenPx, textPx(c.label, Math.min(font, 12))); });
    var labelBandH = clamp(Math.ceil(colLenPx) + 8, 16, 110);
    var annH = state.showAnn ? 13 : 0;
    var colDendroH = (state.showColDendro && V.colDendro) ? clamp(Math.round(H * 0.11), 40, 110) : 0;
    var legendW = 86;

    var availW = W - padL - padR - dendroW - stripW - labelW - legendW;
    var availH = H - padT - padB - colDendroH - labelBandH - annH;
    cellW = Math.min(30, Math.max(1, availW / nC));
    cellH = Math.min(30, Math.max(1, availH / nR));
    var heatW = cellW * nC, heatH = cellH * nR;
    var x0 = padL + dendroW + stripW + labelW;
    var y0 = padT + colDendroH + labelBandH + annH;
    if (heatH + 2 < availH) y0 += (availH - heatH) / 2;
    if (heatW + 2 < availW) x0 += Math.min(20, (availW - heatW) / 2);

    /* --- 缩放层（保留当前 zoom 变换） --- */
    gPan = svg.append('g').attr('class', 'pan');
    var cur = d3.zoomTransform(svg.node());
    if (cur.k !== 1 || cur.x !== 0 || cur.y !== 0) gPan.attr('transform', cur);
    var g = gPan;

    /* --- 单元格 --- */
    var cells = [];
    for (var r = 0; r < nR; r++) {
      for (var c = 0; c < nC; c++) {
        var fi = V.featIdx[r], cc = cols[c];
        var rel, raw, t;
        if (cc.j !== null) { rel = REL[fi][cc.j]; raw = FEATURES[fi].v[cc.j]; }
        else {
          rel = 0; raw = 0;
          for (t = 0; t < cc.idxs.length; t++) { rel += REL[fi][cc.idxs[t]]; raw += FEATURES[fi].v[cc.idxs[t]]; }
          rel /= cc.idxs.length; raw /= cc.idxs.length;
        }
        cells.push({
          r: r, c: c, v: V.Z[r][c], x: V.X[r][c], fi: fi,
          name: rows[r].name, id: rows[r].id, hier: rows[r].hier,
          sample: cc.label, group: cc.group, rel: rel, raw: raw
        });
      }
    }

    var gCells = g.append('g').attr('class', 'cells').style('cursor', 'crosshair');
    gCells.selectAll('rect')
      .data(cells)
      .join('rect')
      .attr('class', 'cell')
      .attr('x', function (d) { return x0 + d.c * cellW; })
      .attr('y', function (d) { return y0 + d.r * cellH; })
      .attr('width', cellW + 0.4)
      .attr('height', cellH + 0.4)
      .attr('fill', function (d) { return V.color(d.v); });

    /* --- 网格线 --- */
    if (state.showGrid) {
      var gGrid = g.append('g').attr('pointer-events', 'none');
      if (cellH >= 3) {
        for (var rr = 0; rr <= nR; rr++) {
          gGrid.append('line')
            .attr('x1', x0).attr('x2', x0 + heatW)
            .attr('y1', y0 + rr * cellH).attr('y2', y0 + rr * cellH)
            .attr('stroke', '#ffffff').attr('stroke-opacity', cellH < 7 ? 0.22 : 0.45)
            .attr('stroke-width', 1).attr('shape-rendering', 'crispEdges');
        }
      }
      if (cellW >= 3) {
        for (var c2 = 0; c2 <= nC; c2++) {
          gGrid.append('line')
            .attr('y1', y0).attr('y2', y0 + heatH)
            .attr('x1', x0 + c2 * cellW).attr('x2', x0 + c2 * cellW)
            .attr('stroke', '#ffffff').attr('stroke-opacity', cellW < 7 ? 0.22 : 0.45)
            .attr('stroke-width', 1).attr('shape-rendering', 'crispEdges');
        }
      }
    }

    /* --- 单元格数值 --- */
    if (state.showValues) {
      g.append('g').attr('pointer-events', 'none').selectAll('text')
        .data(cells)
        .join('text')
        .attr('class', 'cell-value')
        .attr('x', function (d) { return x0 + (d.c + 0.5) * cellW; })
        .attr('y', function (d) { return y0 + (d.r + 0.5) * cellH; })
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
        .attr('font-size', Math.min(10, Math.max(7, cellH * 0.52)))
        .attr('font-family', 'ui-monospace, Menlo, monospace')
        .attr('fill', function (d) {
          var rgb = d3.rgb(V.color(d.v));
          return (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) > 150 ? '#243244' : '#ffffff';
        })
        .text(function (d) { return FMT.f2(d.v); });
    }

    /* --- 外框 + 悬停高亮 --- */
    g.append('rect').attr('x', x0).attr('y', y0).attr('width', heatW).attr('height', heatH)
      .attr('fill', 'none').attr('stroke', '#b9c6d8').attr('stroke-width', 1).attr('pointer-events', 'none');
    var hoverG = g.append('g').attr('pointer-events', 'none').attr('opacity', 0);
    var hRow = hoverG.append('rect').attr('fill', 'none').attr('stroke', '#1f2937').attr('stroke-width', 1.2).attr('stroke-opacity', .8);
    var hCol = hoverG.append('rect').attr('fill', 'none').attr('stroke', '#1f2937').attr('stroke-width', 1.2).attr('stroke-opacity', .8);
    var hCell = hoverG.append('rect').attr('fill', 'none').attr('stroke', '#111827').attr('stroke-width', 1.8);

    /* --- 行标签 + 层级色条 --- */
    hoverRow = null;
    if (rowLabels) {
      rowLabelSel = g.append('g').selectAll('text')
        .data(rows)
        .join('text')
        .attr('class', 'row-label')
        .attr('x', x0 - stripW - 6)
        .attr('y', function (d) { return y0 + (d.r + 0.5) * cellH; })
        .attr('text-anchor', 'end').attr('dominant-baseline', 'central')
        .attr('font-size', font).attr('fill', '#41506b').attr('font-family', FONT_STACK)
        .style('cursor', 'pointer')
        .text(function (d) { return truncate(d.label, labelW - 6, font); });
      rowLabelSel.append('title').text(function (d) { return d.id + ' ' + d.name + '\n' + d.top + ' / ' + (d.hier || '未分类'); });
    } else {
      rowLabelSel = null;
    }
    if (state.showStrip && HAS_ANN) {
      g.append('g').selectAll('rect')
        .data(rows)
        .join('rect')
        .attr('class', 'strip')
        .attr('x', x0 - stripW).attr('y', function (d) { return y0 + d.r * cellH; })
        .attr('width', stripW).attr('height', Math.max(1, cellH))
        .attr('fill', function (d) { return TOP_COLORS[d.top] || '#c2c9d4'; })
        .append('title').text(function (d) { return d.top; });
    }

    /* --- 行聚类树 --- */
    if (state.showRowDendro && V.rowDendro) {
      var gd = g.append('g').attr('pointer-events', 'none').attr('fill', 'none')
        .attr('stroke', '#7b8ea8').attr('stroke-width', 1).attr('shape-rendering', 'crispEdges');
      var xOf = function (h) { return padL + dendroW * (1 - h / V.rowDendro.maxH); };
      V.rowDendro.nodes.forEach(function (n) {
        var xu = xOf(n.hU).toFixed(2), xa = xOf(n.hA).toFixed(2), xb = xOf(n.hB).toFixed(2);
        var ya = (y0 + n.yA * cellH).toFixed(2), yb = (y0 + n.yB * cellH).toFixed(2);
        gd.append('path').attr('d', 'M' + xa + ',' + ya + 'H' + xu + 'M' + xb + ',' + yb + 'H' + xu + 'M' + xu + ',' + ya + 'V' + yb);
      });
    }

    /* --- 列聚类树 --- */
    if (state.showColDendro && V.colDendro) {
      var gdc = g.append('g').attr('pointer-events', 'none').attr('fill', 'none')
        .attr('stroke', '#7b8ea8').attr('stroke-width', 1).attr('shape-rendering', 'crispEdges');
      var yOf = function (h) { return padT + colDendroH * (1 - h / V.colDendro.maxH); };
      V.colDendro.nodes.forEach(function (n) {
        var yu = yOf(n.hU).toFixed(2), ya = yOf(n.hA).toFixed(2), yb = yOf(n.hB).toFixed(2);
        var xa = (x0 + n.yA * cellW).toFixed(2), xb = (x0 + n.yB * cellW).toFixed(2), xu = (x0 + n.yU * cellW).toFixed(2);
        gdc.append('path').attr('d', 'M' + xa + ',' + ya + 'V' + yu + 'M' + xb + ',' + yb + 'V' + yu + 'M' + xa + ',' + yu + 'H' + xb);
      });
    }

    /* --- 分组色条 + 列标签 --- */
    if (state.showAnn) {
      var gAnn = g.append('g').attr('class', 'ann').attr('pointer-events', 'none');
      gAnn.selectAll('rect').data(cols).join('rect')
        .attr('x', function (d, i) { return x0 + i * cellW; })
        .attr('y', y0 - annH)
        .attr('width', Math.max(1, cellW)).attr('height', annH)
        .attr('fill', function (d) { return d.color; });
      gAnn.append('rect').attr('x', x0).attr('y', y0 - annH).attr('width', heatW).attr('height', annH)
        .attr('fill', 'none').attr('stroke', '#ffffff').attr('stroke-width', 1);
      gAnn.append('text').attr('x', x0 - stripW - 6).attr('y', y0 - annH / 2)
        .attr('text-anchor', 'end').attr('dominant-baseline', 'central')
        .attr('font-size', Math.min(10, font)).attr('fill', '#8a97a8').text('分组');
    }
    g.append('g').selectAll('text')
      .data(cols)
      .join('text')
      .attr('class', 'col-label')
      .attr('transform', function (d, i) {
        return 'translate(' + (x0 + (i + 0.5) * cellW).toFixed(2) + ',' + (y0 - annH - 6) + ') rotate(-90)';
      })
      .attr('text-anchor', 'start').attr('dominant-baseline', 'middle')
      .attr('font-size', Math.min(font, 12)).attr('fill', '#41506b').attr('font-family', FONT_STACK)
      .text(function (d) { return d.label; })
      .append('title').text(function (d) { return d.label + '（' + d.group + '）'; });

    /* --- 色阶图例 --- */
    var legH = clamp(H * 0.4, 80, 190);
    var gLeg = svg.append('g').attr('transform', 'translate(' + (W - legendW + 8) + ',' + ((H - legH) / 2) + ')');
    var lgid = 'lg' + Math.random().toString(36).slice(2);
    var lg = gLeg.append('defs').append('linearGradient')
      .attr('id', lgid).attr('x1', '0').attr('y1', '1').attr('x2', '0').attr('y2', '0');
    for (var s2 = 0; s2 <= 20; s2++) {
      var tt = s2 / 20;
      lg.append('stop').attr('offset', (tt * 100) + '%')
        .attr('stop-color', V.color(V.domain.lo + tt * (V.domain.hi - V.domain.lo)));
    }
    gLeg.append('rect').attr('x', 4).attr('y', 0).attr('width', 13).attr('height', legH)
      .attr('fill', 'url(#' + lgid + ')').attr('stroke', '#cbd5e1').attr('stroke-width', 0.8);
    var yS = d3.scaleLinear().domain([V.domain.lo, V.domain.hi]).range([legH, 0]);
    var span = V.domain.hi - V.domain.lo;
    var ftick = span >= 20 ? d3.format(',.0f') : span >= 2 ? d3.format('.1f') : d3.format('.2f');
    gLeg.append('g').selectAll('text').data(yS.ticks(5)).join('text')
      .attr('x', 22).attr('y', function (d) { return yS(d); })
      .attr('dominant-baseline', 'central').attr('font-size', 10.5).attr('fill', '#5b6b82')
      .attr('font-family', 'ui-monospace, Menlo, monospace')
      .text(function (d) { return ftick(d); });
    gLeg.append('text').attr('x', 4).attr('y', -7).attr('font-size', 10.5).attr('fill', '#8a97a8')
      .text(TRANSFORM_LABEL[state.transform]);
    if (state.clip > 0) {
      gLeg.append('text').attr('x', 4).attr('y', legH + 14).attr('font-size', 10).attr('fill', '#b6c0cd')
        .text('已按 ' + state.clip + '% 分位裁剪');
    }

    /* --- 悬停 / 点击 --- */
    var wrapEl = wrap;
    function showTip(ev, d) {
      var col = d3.color(V.color(d.v));
      tooltip.html(
        '<div class="t-title">' + d.name + '</div>' +
        '<div class="t-hier">' + d.id + ' · ' + (d.hier || '未分类') + '</div>' +
        '<div class="t-grid">' +
        '<span>样本 / 列</span><span>' + d.sample + '</span>' +
        '<span>分组</span><span><i class="t-swatch" style="background:' + (d3.color(GROUP_COLORS[d.group] || '#999') || d3.color('#999')).formatHex() + '"></i>' + d.group + '</span>' +
        '<span>' + VAL_LABEL + '</span><span>' + (d.rel >= 10 ? FMT.f2(d.rel) : d.rel >= 1 ? FMT.f3(d.rel) : FMT.f4(d.rel)) + VAL_SUFFIX + '</span>' +
        '<span>原始丰度</span><span>' + FMT.f0(d.raw) + '</span>' +
        '<span>' + TRANSFORM_LABEL[state.transform] + '</span><span>' + FMT.f3(d.v) + '</span>' +
        '<span>色值</span><span>' + (col ? col.formatHex() : '') + '</span>' +
        '</div>'
      ).style('opacity', 1);
      var tw = tooltip.node().offsetWidth, th = tooltip.node().offsetHeight;
      var rect = wrapEl.getBoundingClientRect();
      var px = ev.clientX - rect.left, py = ev.clientY - rect.top;
      var tx = px + 14, ty = py + 14;
      if (tx + tw > wrapEl.clientWidth - 4) tx = Math.max(0, px - tw - 14);
      if (ty + th > wrapEl.clientHeight - 4) ty = Math.max(0, py - th - 14);
      tooltip.style('left', tx + 'px').style('top', ty + 'px');
    }
    function hideTip() { tooltip.style('opacity', 0); }

    gCells
      .on('mousemove', function (ev) {
        var d = ev.target && ev.target.__data__;
        if (!d || d.r === undefined) { hideTip(); hoverG.attr('opacity', 0); return; }
        showTip(ev, d);
        hoverG.attr('opacity', 1);
        hRow.attr('x', x0).attr('y', y0 + d.r * cellH).attr('width', heatW).attr('height', cellH);
        hCol.attr('x', x0 + d.c * cellW).attr('y', y0).attr('width', cellW).attr('height', heatH);
        hCell.attr('x', x0 + d.c * cellW).attr('y', y0 + d.r * cellH).attr('width', cellW).attr('height', cellH);
        if (rowLabelSel && d.r !== hoverRow) {
          if (hoverRow !== null) rowLabelSel.filter(function (dd) { return dd.r === hoverRow; }).attr('fill', '#41506b');
          rowLabelSel.filter(function (dd) { return dd.r === d.r; }).attr('fill', '#e07b39');
          hoverRow = d.r;
        }
      })
      .on('mouseleave', function () {
        hideTip(); hoverG.attr('opacity', 0);
        if (rowLabelSel && hoverRow !== null) rowLabelSel.attr('fill', '#41506b');
        hoverRow = null;
      })
      .on('click', function (ev) {
        var d = ev.target && ev.target.__data__;
        if (!d || d.fi === undefined) return;
        selected = d.fi;
        markSel(d.r);
        renderProfile(d.fi);
      });

    gPan.selectAll('text.row-label').on('click', function (ev, d) {
      selected = d.fi;
      markSel(d.r);
      renderProfile(d.fi);
    });

    /* --- 选中行高亮 --- */
    var selRect = g.append('rect').attr('pointer-events', 'none')
      .attr('fill', 'none').attr('stroke', '#e07b39').attr('stroke-width', 2).attr('display', 'none');
    markSel = function (rIdx) {
      if (rIdx === null || rIdx === undefined) { selRect.attr('display', 'none'); return; }
      selRect.attr('display', null)
        .attr('x', x0 - stripW - 1).attr('y', y0 + rIdx * cellH)
        .attr('width', heatW + stripW + 2).attr('height', Math.max(1.5, cellH));
    };
    if (selected !== null) {
      var sr = CUR_FEATIDX.indexOf(selected);
      if (sr >= 0) markSel(sr);
    }

    updateThinning();
  }

  /* ---------------- 8. 特征丰度曲线 ---------------- */
  function renderProfile(fi) {
    var f = FEATURES[fi], st = STATS[fi];
    if (!f) return;
    document.getElementById('detailBody').classList.add('on');
    var wrapEl = document.getElementById('profileWrap');
    var W = Math.max(240, wrapEl.clientWidth), H = Math.max(110, wrapEl.clientHeight);
    var ps = d3.select('#profile');
    ps.selectAll('*').remove();
    ps.attr('viewBox', '0 0 ' + W + ' ' + H);
    var m = { l: 54, r: 12, t: 14, b: 32 };
    var vals = REL[fi];
    var vmin = d3.min(vals) || 0, vmax = d3.max(vals) || 1;
    var rng = vmax - vmin;
    var pad = rng * 0.14 || vmax * 0.05 || 0.01;
    var yLo = 0, yHi = vmax + pad, zoomed = false;
    /* 组间差异远小于量级时自动放大 Y 轴（并标注），避免曲线被压成直线 */
    if (vmax > 0 && rng / vmax < 0.35) { yLo = Math.max(0, vmin - pad); yHi = vmax + pad; zoomed = true; }
    var span = yHi - yLo;
    var tickFmt = span >= 20 ? FMT.f0 : span >= 2 ? FMT.f1 : span >= 0.2 ? FMT.f2 : span >= 0.02 ? FMT.f3 : FMT.f4;
    var x = d3.scalePoint().domain(d3.range(M)).range([m.l, W - m.r]).padding(0.4);
    var y = d3.scaleLinear().domain([yLo, yHi]).range([H - m.b, m.t]);
    var g = ps.append('g');

    for (var j = 1; j < M; j++) {
      if (SAMPLE_GROUP[j] !== SAMPLE_GROUP[j - 1]) {
        var xm = (x(j) + x(j - 1)) / 2;
        g.append('line').attr('x1', xm).attr('x2', xm).attr('y1', m.t).attr('y2', H - m.b)
          .attr('stroke', '#eef2f7').attr('stroke-width', 1);
      }
    }
    g.append('path').attr('fill', 'none').attr('stroke', '#c7d2e0').attr('stroke-width', 1.2)
      .attr('d', d3.line().x(function (d, i) { return x(i); }).y(function (d) { return y(d); })(vals));
    g.selectAll('circle.pt').data(vals).join('circle').attr('class', 'pt')
      .attr('cx', function (d, i) { return x(i); })
      .attr('cy', function (d) { return y(d); })
      .attr('r', 2.6).attr('fill-opacity', 0.85)
      .attr('fill', function (d, i) { return GROUP_COLORS[SAMPLE_GROUP[i]] || '#888'; })
      .append('title').text(function (d, i) {
        return SAMPLES[i].n + '（' + SAMPLE_GROUP[i] + '）：' + (d >= 1 ? FMT.f3(d) : FMT.f4(d)) + VAL_SUFFIX;
      });
    var gm = [], gx = [];
    GROUP_ORDER.forEach(function (grp) {
      var idxs = [], k;
      for (k = 0; k < M; k++) if (SAMPLE_GROUP[k] === grp) idxs.push(k);
      if (!idxs.length) return;
      var s = 0;
      idxs.forEach(function (kk) { s += vals[kk]; });
      gm.push(s / idxs.length);
      gx.push(d3.mean(idxs, function (kk) { return x(kk); }));
    });
    g.append('path').attr('fill', 'none').attr('stroke', '#2f4f7a').attr('stroke-width', 2).attr('stroke-opacity', 0.75)
      .attr('d', d3.line().x(function (d, i) { return gx[i]; }).y(function (d) { return y(d); })(gm));
    g.selectAll('circle.gm').data(gm).join('circle').attr('class', 'gm')
      .attr('cx', function (d, i) { return gx[i]; }).attr('cy', function (d) { return y(d); })
      .attr('r', 3.4).attr('fill', '#ffffff').attr('stroke', '#2f4f7a').attr('stroke-width', 1.6);
    g.append('g').selectAll('text').data(y.ticks(4)).join('text')
      .attr('x', m.l - 7).attr('y', function (d) { return y(d); })
      .attr('text-anchor', 'end').attr('dominant-baseline', 'central')
      .attr('font-size', 10).attr('fill', '#8a97a8')
      .text(function (d) { return tickFmt(d) + VAL_SUFFIX; });
    if (zoomed) {
      g.append('text').attr('x', m.l - 4).attr('y', m.t - 3).attr('text-anchor', 'end')
        .attr('font-size', 9.5).attr('fill', '#b6c0cd')
        .text('Y 轴已放大（未从 0 起）');
    }
    GROUP_ORDER.forEach(function (grp) {
      var idxs = [], k;
      for (k = 0; k < M; k++) if (SAMPLE_GROUP[k] === grp) idxs.push(k);
      if (!idxs.length) return;
      g.append('text').attr('x', d3.mean(idxs, function (kk) { return x(kk); }))
        .attr('y', H - m.b + 13).attr('text-anchor', 'middle')
        .attr('font-size', 9.5).attr('fill', GROUP_COLORS[grp]).text(grp);
    });

    var order = GROUP_ORDER.map(function (grp) {
      var idxs = [], k;
      for (k = 0; k < M; k++) if (SAMPLE_GROUP[k] === grp) idxs.push(k);
      var s = 0;
      idxs.forEach(function (kk) { s += vals[kk]; });
      return { g: grp, v: s / (idxs.length || 1), n: idxs.length };
    }).filter(function (d) { return d.n; }).sort(function (a, b) { return b.v - a.v; });

    document.getElementById('detailInfo').innerHTML =
      '<div style="color:#1f2937;font-weight:650;line-height:1.5">' + f.name + '</div>' +
      '<div style="color:#8a97a8">' + f.id + ' · ' + (f.hier || '未分类') + '</div>' +
      '<div style="margin-top:5px">' +
      '<span class="k">平均' + VAL_LABEL + '</span> <b>' + FMT.f3(st.mean) + VAL_SUFFIX + '</b><br>' +
      '<span class="k">最高 / 最低</span> <b>' + FMT.f3(st.max) + ' / ' + FMT.f3(st.min) + VAL_SUFFIX + '</b><br>' +
      '<span class="k">检出样本</span> <b>' + st.prev + ' / ' + M + '</b><br>' +
      '<span class="k">各组均值 Top5</span><br>' +
      order.slice(0, 5).map(function (d) {
        return '&nbsp;<i style="display:inline-block;width:8px;height:8px;border-radius:2px;background:' + GROUP_COLORS[d.g] + '"></i> ' +
          d.g + ' <b>' + FMT.f3(d.v) + VAL_SUFFIX + '</b>';
      }).join('<br>') +
      '</div>';
    document.getElementById('detailSub').textContent = '浅色折线＝各样本（点色＝分组）；深色折线＝各分组均值';
  }

  /* ---------------- 9. 顶部信息条 ---------------- */
  function abRuleText() {
    var u = UNIT_SUFFIX;
    if (state.abRule === 'mean') return '平均 ≥ ' + state.abThresh + u;
    if (state.abRule === 'max') return '任一 ≥ ' + state.abThresh + u;
    return '至少 ' + state.fracN + ' 个样本 ≥ ' + state.abThresh + u;
  }
  function chip(label, val, hot) {
    return '<span class="chip' + (hot ? ' hot' : '') + '"><b>' + label + '</b>' + val + '</span>';
  }
  function updateTopBar() {
    var V = VIEW;
    document.getElementById('paramChips').innerHTML =
      chip('行聚类', (V.rowDendro ? LINKAGE_LABEL[state.linkage] + ' · ' + DIST_LABEL[state.dist] : '已关闭'), true) +
      chip('归一化', TRANSFORM_LABEL[state.transform], true) +
      chip(NO_NORM ? '丰度阈值' : '相对丰度阈值', abRuleText(), true) +
      chip('特征数量阈值', state.prevOn ? ('检出 ≥ ' + state.prevN + ' 个样本') : '未启用', true) +
      (state.topN ? chip('Top', state.topN + ' 条', true) : '') +
      (state.search ? chip('检索', state.search, true) : '') +
      chip('保留' + ENTITY, V.nrow + ' / ' + N + ' 条', false) +
      chip('列', (state.colMode === 'sample' ? V.ncol + ' 个样本' : V.ncol + ' 个分组均值'), false) +
      chip('色阶范围', (PALETTES[state.scheme] || PALETTES.rdbu).label + ' ' + d3.format('.3g')(V.domain.lo) + ' ~ ' + d3.format('.3g')(V.domain.hi), false);
    document.getElementById('filterCount').textContent = V.kept + ' / ' + N + ' 保留';
    document.getElementById('viewTitle').textContent =
      V.nrow + ' 条' + ENTITY + ' × ' + V.ncol + (state.colMode === 'sample' ? ' 个样本' : ' 个分组') + '（' + TRANSFORM_LABEL[state.transform] + '）';
    document.getElementById('dataSub').textContent =
      'D3.js 交互版 · ' + N + ' 条' + ENTITY + ' × ' + M + ' 个样本 · ' + GROUP_ORDER.length + ' 组';
    var counts = {};
    SAMPLE_GROUP.forEach(function (g) { counts[g] = (counts[g] || 0) + 1; });
    document.getElementById('groupLegend').innerHTML = GROUP_ORDER.map(function (g) {
      return '<span class="gchip"><i style="background:' + GROUP_COLORS[g] + '"></i>' + g +
        '<span style="color:#b6c0cd">×' + (counts[g] || 0) + '</span></span>';
    }).join('');
    document.getElementById('legendHint').textContent = GROUP_ORDER.length + ' 组 · 每组一色';
  }

  /* ---------------- 10. 总入口 ---------------- */
  function render(opts) {
    opts = opts || {};
    VIEW = buildView();
    CUR_FEATIDX = VIEW.featIdx;
    document.getElementById('helpBody').innerHTML = helpHTML();
    updateTopBar();
    drawAll();
    if (selected !== null) {
      if (CUR_FEATIDX.indexOf(selected) < 0) {
        /* 所选特征已不在当前筛选结果中：保留右侧曲线，不画行高亮 */
      } else {
        renderProfile(selected);
      }
    }
    if (opts.reset) resetView(false);
  }

  /* ---------------- 11. 读控件 ---------------- */
  function readState() {
    function val(id) { return document.getElementById(id).value; }
    function chk(id) { return document.getElementById(id).checked; }
    state.abRule = val('selAbRule');
    state.abThresh = parseFloat(val('inAbThresh')) || 0;
    state.fracN = Math.max(1, parseInt(val('inFracN'), 10) || 1);
    state.prevOn = chk('chkPrev');
    state.prevN = Math.max(1, parseInt(val('inPrevN'), 10) || 1);
    state.search = val('inSearch').trim();
    state.transform = val('selTransform');
    state.basis = val('selBasis');
    state.scheme = val('selScheme') || 'rdbu';
    state.sym = chk('chkSym');
    state.clip = clamp(parseFloat(val('inClip')) || 0, 0, 20);
    state.rowCluster = chk('chkRowCluster');
    state.dist = val('selDist');
    state.linkage = val('selLinkage');
    state.rowOrder = val('selRowOrder');
    state.colMode = val('selColMode');
    state.colOrder = val('selColOrder');
    state.showRowDendro = chk('chkRowDendro');
    state.showColDendro = chk('chkColDendro');
    state.showAnn = chk('chkAnn');
    state.showStrip = chk('chkStrip');
    state.showGrid = chk('chkGrid');
    state.showValues = chk('chkValues');
    state.rowLabel = val('selRowLabel');
    state.font = clamp(parseInt(val('inFont'), 10) || 11, 8, 18);
    document.getElementById('rowFracN').style.display = state.abRule === 'frac' ? '' : 'none';
    if (!state.rowCluster && state.rowOrder === 'cluster') {
      document.getElementById('selRowOrder').value = 'original';
      state.rowOrder = 'original';
    }
    if (state.colMode === 'group' && state.colOrder === 'cluster') { /* 允许：按分组均值聚类列 */ }
  }

  /* ---------------- 12. 事件 ---------------- */
  function on(id, ev, fn) {
    var el = document.getElementById(id);
    if (el) el.addEventListener(ev, fn);
  }
  function bindChange(id, reset, debounceMs) {
    var el = document.getElementById(id);
    if (!el) return;
    var timer = null;
    function run() { readState(); render({ reset: !!reset }); }
    el.addEventListener('change', run);
    if (el.tagName === 'INPUT') {
      /* 数字/文本输入：输入过程中防抖生效，不必等失焦 */
      var wait = debounceMs || 260;
      el.addEventListener('input', function () {
        clearTimeout(timer);
        timer = setTimeout(run, wait);
      });
    }
  }

  function initControls() {
    var sel = document.getElementById('selScheme');
    sel.innerHTML = Object.keys(PALETTES).map(function (k) {
      return '<option value="' + k + '">' + PALETTES[k].label + '</option>';
    }).join('');
    sel.value = state.scheme;

    ['selAbRule', 'inAbThresh', 'inFracN', 'inPrevN', 'chkPrev', 'selTransform', 'selBasis',
      'selScheme', 'chkSym', 'inClip', 'chkRowCluster', 'selDist', 'selLinkage', 'selRowOrder',
      'selColMode', 'selColOrder'].forEach(function (id) { bindChange(id, true); });
    ['chkRowDendro', 'chkColDendro', 'chkAnn', 'chkStrip', 'chkGrid', 'chkValues',
      'selRowLabel', 'inFont'].forEach(function (id) { bindChange(id, false); });
    bindChange('inSearch', true, 320);

    on('btnResetFilter', 'click', function () {
      document.getElementById('selAbRule').value = 'mean';
      document.getElementById('inAbThresh').value = '1';
      document.getElementById('inFracN').value = '10';
      document.getElementById('inPrevN').value = '10';
      document.getElementById('chkPrev').checked = true;
      document.getElementById('inSearch').value = '';
      state.topN = 0;
      state.search = '';
      readState();
      render({ reset: true });
    });
    on('btnTopN', 'click', function () {
      state.topN = state.topN === 30 ? 0 : 30;
      readState();
      render({ reset: true });
    });

    on('btnZoomIn', 'click', function () { svg.transition().duration(180).call(zoom.scaleBy, 1.4); });
    on('btnZoomOut', 'click', function () { svg.transition().duration(180).call(zoom.scaleBy, 1 / 1.4); });
    on('btnResetZoom', 'click', function () { resetView(true); });
    on('btnFit', 'click', function () { resetView(true); });

    on('btnSvg', 'click', exportSVG);
    on('btnPng', 'click', exportPNG);
    on('btnTsv', 'click', function () { exportTSV(false); });
    on('btnTsvRel', 'click', function () { exportTSV(true); });
    on('btnClearSel', 'click', function () {
      selected = null;
      d3.select('#profile').selectAll('*').remove();
      document.getElementById('detailBody').classList.remove('on');
      document.getElementById('detailInfo').innerHTML = '<div class="empty-hint">未选择' + ENTITY + '</div>';
      document.getElementById('detailSub').textContent = '点击热图中的任意一行查看该' + ENTITY + '在各样本/分组中的丰度曲线';
      markSel(null);
    });

    applyDataDefaults();
  }

  /* 按构建脚本注入的元信息初始化界面 */
  function applyDataDefaults() {
    document.getElementById('inAbThresh').value = String(state.abThresh);
    document.getElementById('inPrevN').value = String(state.prevN);
    document.getElementById('chkPrev').checked = state.prevOn;
    document.getElementById('pageTitle').textContent = TITLE;
    document.getElementById('selColMode').options[0].text = '各样本（' + M + ' 列）';
    document.getElementById('selColMode').options[1].text = '分组均值（' + GROUP_ORDER.length + ' 列）';
    document.getElementById('detailTitle').textContent = ENTITY + '丰度分布';
    document.title = TITLE + ' · D3 交互版';
    if (META.hierCol) {
      document.getElementById('lbStrip').textContent = '分类色条';
    }
    if (NO_NORM) {
      document.getElementById('lbAbRule').textContent = '丰度规则';
      document.getElementById('lbAbThresh').textContent = '丰度阈值';
      document.getElementById('unitAbThresh').textContent = '(原值)';
      document.getElementById('selBasis').value = 'raw';
      state.basis = 'raw';
      document.getElementById('selBasis').disabled = true;
      document.getElementById('btnTsvRel').textContent = '导出丰度矩阵 (TSV)';
      var o = document.getElementById('selAbRule').options;
      o[0].text = '平均丰度 ≥ 阈值';
      o[1].text = '任一（最大）样本 ≥ 阈值';
      o[2].text = '至少 N 个样本 ≥ 阈值';
    }
    if (!HAS_ANN) {
      var cb = document.getElementById('chkStrip');
      cb.checked = false;
      cb.disabled = true;
      state.showStrip = false;
      if (cb.parentNode) cb.parentNode.style.opacity = 0.45;
    }
  }

  /* ---------------- 13. 导出 ---------------- */
  function download(name, blob) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  function svgString() {
    var node = document.getElementById('heatmap').cloneNode(true);
    var vb = (node.getAttribute('viewBox') || '0 0 1200 800').split(/\s+/);
    var W = parseFloat(vb[2]) || 1200, H = parseFloat(vb[3]) || 800;
    node.setAttribute('xmlns', SVGNS);
    node.setAttribute('width', W);
    node.setAttribute('height', H);
    node.removeAttribute('style');
    node.removeAttribute('class');
    var bg = document.createElementNS(SVGNS, 'rect');
    bg.setAttribute('x', 0); bg.setAttribute('y', 0);
    bg.setAttribute('width', W); bg.setAttribute('height', H);
    bg.setAttribute('fill', '#ffffff');
    node.insertBefore(bg, node.firstChild);
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(node);
  }
  function exportSVG() {
    download(fname('_热图.svg'), new Blob([svgString()], { type: 'image/svg+xml;charset=utf-8' }));
  }
  function exportPNG() {
    var str = svgString();
    var vb = (document.getElementById('heatmap').getAttribute('viewBox') || '0 0 1200 800').split(/\s+/);
    var W = parseFloat(vb[2]) || 1200, H = parseFloat(vb[3]) || 800;
    var img = new Image();
    img.onload = function () {
      var scale = 2, cv = document.createElement('canvas');
      cv.width = Math.round(W * scale); cv.height = Math.round(H * scale);
      var ctx = cv.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.drawImage(img, 0, 0, cv.width, cv.height);
      cv.toBlob(function (b) {
        if (b) download(fname('_热图.png'), b);
        else alert('PNG 生成失败，请改用导出 SVG。');
      }, 'image/png');
    };
    img.onerror = function () { alert('PNG 导出失败，请改用导出 SVG（浏览器中可另存为 PDF）。'); };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(str);
  }
  function exportTSV(relRaw) {
    var V = VIEW, lines = [], head = (META.metaCols || ['Feature']).slice();
    if (META.topCol) head.push(META.topCol);
    V.cols.forEach(function (c) { head.push(c.label); });
    lines.push(head.join('\t'));
    V.rows.forEach(function (row, r) {
      var arr = [(row.id && row.id !== row.name ? row.id + ':' + row.name : row.name), row.hier || ''];
      if (META.topCol) arr.push(row.top);
      for (var c = 0; c < V.ncol; c++) {
        if (relRaw) {
          var cc = V.cols[c];
          if (cc.j !== null) arr.push(FMT.f4(REL[row.fi][cc.j]));
          else {
            var s = 0;
            for (var t = 0; t < cc.idxs.length; t++) s += REL[row.fi][cc.idxs[t]];
            arr.push(FMT.f4(s / cc.idxs.length));
          }
        } else {
          arr.push(FMT.f4(V.Z[r][c]));
        }
      }
      lines.push(arr.join('\t'));
    });
    var counts = {};
    GROUP_ORDER.forEach(function (g) {
      var n = 0;
      SAMPLE_GROUP.forEach(function (g2) { if (g2 === g) n++; });
      counts[g] = n;
    });
    var note = '# ' + (relRaw
      ? (NO_NORM ? '原始值（未做列和归一化）' : '相对丰度（%，按各样本列和归一）')
      : '归一化值：' + TRANSFORM_LABEL[state.transform] + '（基于' + (state.basis === 'raw' ? '原始值' : VAL_LABEL + '%') + '）') +
      '\n# 筛选：' + VAL_LABEL + ' ' + abRuleText() + '；' + (state.prevOn ? '检出 ≥ ' + state.prevN + ' 个样本' : '未做检出过滤') +
      (state.topN ? '；Top ' + state.topN : '') +
      '\n# 列分组：' + GROUP_ORDER.map(function (g) { return g + '×' + counts[g]; }).join(', ') +
      '\n# 行顺序与列顺序与当前屏幕一致';
    download(fname(relRaw ? (NO_NORM ? '_丰度矩阵.tsv' : '_相对丰度矩阵.tsv') : '_热图矩阵_归一化.tsv'),
      new Blob(['\ufeff' + note + '\n' + lines.join('\n')], { type: 'text/tab-separated-values;charset=utf-8' }));
  }

  /* ---------------- 14. 说明 ---------------- */
  function helpHTML() {
    var d = DEFAULTS;
    var qual = NO_NORM
      ? '本表在构建时用 <code>--no-normalize</code> 指定为<b>按原值使用</b>，未做列和归一化，两个阈值都按原始数值解释。'
      : '每个值先除以<b>本样本列和</b>×100 得到相对丰度百分比（本表 ' + M + ' 个样本的列和约 ' +
        d3.format(',.0f')(d3.min(COLSUM)) + '–' + d3.format(',.0f')(d3.max(COLSUM)) +
        '），下面两个阈值都基于它。该换算对已是相对丰度（和为 1 或 100）的表是幂等的。';
    return [
      '<p><b>① 数值口径</b><br>' + qual + '</p>',

      '<p><b>② 双阈值筛选（同时生效）</b></p>',
      '<ul><li><b>' + VAL_LABEL + '阈值 ' + d.abThresh + UNIT_SUFFIX + '</b>：默认口径"' + VAL_LABEL +
      ' 平均 ≥ ' + d.abThresh + UNIT_SUFFIX + '"（跨全部 ' + M + ' 个样本的均值）；可改为"任一（最大）样本 ≥ 阈值"或"至少 N 个样本 ≥ 阈值"。</li>',
      '<li><b>特征数量阈值 ' + d.prevN + '</b>：默认口径"至少在 ' + d.prevN + ' 个样本中检出"（' + VAL_LABEL +
      ' &gt; 0），即检出率过滤；不需要可取消勾选。</li></ul>',
      '<p>当前 ' + N + ' 条' + ENTITY + ' → 保留 <b>' + (VIEW ? VIEW.nrow : 0) +
      '</b> 条（顶部参数条实时显示）；阈值改动后聚类、配色、Top 排序全部实时重算。</p>',

      '<p><b>③ 归一化方式 row</b><br>对保留矩阵逐行做 Z-score：<code>z = (x − 行均值) / 行标准差</code>（n−1）。因此颜色表示"该' +
      ENTITY + '在自身 ' + (VIEW ? VIEW.ncol : 0) + ' 列中的相对高低"，行间可比模式、不可比绝对量级。可选行中心化、行 Min-Max、log10。</p>',

      '<p><b>④ 行聚类</b><br>对归一化后的行向量做层次聚类，默认欧氏距离 + 平均连接 UPGMA（Lance–Williams 递推）。左侧树状图横轴＝合并距离，纵向顺序＝热图行序。可选相关距离 1−r / 余弦 / 曼哈顿，完全连接 / 单连接 / Ward.D2（Ward 仅对欧氏距离有统计意义）。</p>',

      '<p><b>⑤ 交互</b><br>滚轮缩放、拖拽平移、悬停读数（' + VAL_LABEL + ' / 原始值 / 归一化值）、点击行查看该' +
      ENTITY + '的丰度曲线；行标签与列标签随缩放自动抽稀，避免重叠。</p>',

      '<p><b>⑥ 导出</b><br>SVG 矢量图、PNG 2× 位图；TSV 可导出当前归一化矩阵或' + VAL_LABEL +
      '矩阵，行序、列序与屏幕一致，可直接进 Excel / R / Python。</p>'
    ].join('');
  }

  /* ---------------- 15. 启动 ---------------- */
  var lastSize = '';
  function scheduleRedraw() {
    clearTimeout(window.__rz);
    window.__rz = setTimeout(function () {
      var wrap = document.getElementById('chartWrap');
      var key = wrap.clientWidth + 'x' + wrap.clientHeight;
      if (key === lastSize) return;          /* 尺寸未变则不重绘，避免循环 */
      lastSize = key;
      if (VIEW) { drawAll(); }
    }, 120);
  }
  function boot() {
    initControls();
    readState();
    render({ reset: true });
    var wrap = document.getElementById('chartWrap');
    lastSize = wrap.clientWidth + 'x' + wrap.clientHeight;
    if (window.ResizeObserver) {
      new ResizeObserver(function () { scheduleRedraw(); }).observe(wrap);
    }
    window.addEventListener('resize', scheduleRedraw);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
