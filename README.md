# Lilinji's Agent Skills Collection

个人定制与精选的 AI Agent Skills 集合库，适用于 Antigravity / Gemini IDE、Claude Code、Codex 等主流智能体编程环境。

---

## 📂 Skills 清单

| Skill 名称 | 描述 | 目录链接 |
| :--- | :--- | :--- |
| **`ringi-article-illustrator`** | **[推荐]** Ringi IP × Baoyu 工业级技术文章配图工作流：结合宝玉 Type × Style 配图方法论与 Ringi 专属 IP 3D 小剧场（16:9 纯白底、哑光黏土质感、流程工坊与核心动作双模态），全自洽、支持完全离线运行。 | [查看详情](./ringi-article-illustrator/) |
| **`ringi-ip-article-illustrations`** | Ringi 出品的完整个人 IP 插图工作流：内置已确认的 Ringi 专属 IP 角色（默认透明眼镜版与可选潮酷墨镜版），自动为技术长文、AI 基础设施与工作流生成 16:9 复古彩色扁平 3D 小剧场插图。 | [查看详情](./ringi-ip-article-illustrations/) |

---

## 🚀 安装指南

### 方式 1：整体克隆仓库并链接 Skills

克隆整个仓库：
```bash
git clone https://github.com/lilinji/skills.git
```

将指定的 Skill 复制或软链接到对应的客户端 Skills 目录：

* **Antigravity / Gemini IDE**:
  ```powershell
  Copy-Item -Recurse "skills\ringi-ip-article-illustrations" "$HOME\.gemini\config\skills\"
  ```

* **Claude Code**:
  ```bash
  cp -r skills/ringi-ip-article-illustrations ~/.claude/skills/
  ```

* **Codex**:
  ```bash
  cp -r skills/ringi-ip-article-illustrations ~/.codex/skills/
  ```

---

## 📄 License

[MIT License](./LICENSE)
