# Ringi AI Infrastructure 小剧场插图模板库

本文档沉淀了专为 **AI 基础设施（AI Infrastructure / GPU 算力平台 / 大模型系统工程）** 打造的 16:9 复古彩色扁平 3D 小剧场插图方案。

角色默认采用 **Ringi 标准透明眼镜版**（专注、极客、技术底座），在纯白无界画布上展现算力与系统核心物理关系。

---

## 模板 1：GPU 算力集群与任务调度系统（GPU Cluster & Job Scheduling）

- **适用场景**：Kubernetes / Ray 调度、GPU 拓扑感知、任务队列、多租户算力分配。
- **模式**：流程拆解（4 节点流水线）
- **核心链路**：`任务分发` ➔ `GPU 算力池` ➔ `并行训练` ➔ `集群监控`
- **主要物件**：复古任务终端、插满绿色指示灯的模块化 GPU 刀片服务器组、同步运转的数据齿轮与张量方块、带 99.9% 仪表盘的橄榄绿监控台。
- **人物动作**：Ringi 佩戴透明眼镜，在分发端排队任务并在监控端掌控集群全局。
- **提示词骨架**：
  > 16:9 retro-colored flat 3D article editorial illustration on a seamless pure solid white background, depicting AI Infrastructure & GPU Cluster Management, operated by the character Ringi wearing his default clear thin-frame glasses. 4 stations: "任务分发", "GPU 算力池", "并行训练", "集群监控". Modular retro servers, soft ambient contact shadows, pure white canvas.

---

## 模板 2：海量数据流动与高速存储直通（High-Throughput AI Storage & RDMA）

- **适用场景**：AI 训练数据加载瓶颈、GPUDirect Storage、分布式缓存、数据预处理流水线。
- **模式**：流程拆解（4 节点流水线）
- **核心链路**：`海量数据源` ➔ `分布式清洗` ➔ `高速缓存` ➔ `显存直通`
- **主要物件**：复古磁带/文档漏斗、高速过滤筛鼓、闪烁黄色指示灯的 NVMe 缓存仓、直接连通 GPU 的发光数据总线管道。
- **人物动作**：Ringi 站在数据总线旁，调节高速阀门，确保数据零阻塞注入 GPU。

---

## 模板 3：分布式训练与 Checkpoint 故障自愈（Distributed Training & Auto-Failover）

- **适用场景**：千卡/万卡训练容错、NCCL 故障排查、快照恢复、节点自动替换（Node Health Check & Auto-Healing）。
- **模式**：核心动作 + 故障自愈对比
- **核心物理关系**：一侧 GPU 节点亮红灯故障 ➔ Ringi 迅速从 Checkpoint 快照保险箱提取最新权重 ➔ 无缝热插拔替换新节点并点亮绿灯。
- **主要标签**：`节点故障`、`快照恢复`、`自动替换`

---

## 模板 4：大模型推理网关与 KV Cache 优化（Inference Serving & KV Cache）

- **适用场景**：vLLM、Triton 推理服务器、Continuous Batching 动态批处理、显存显存碎片优化。
- **模式**：流程拆解 / 核心动作
- **核心链路**：`并发请求` ➔ `动态批处理` ➔ `KV Cache 显存池` ➔ `低延迟流式输出`
- **主要物件**：并发请求漏斗、紧凑卡槽打包机、整齐排列的显存积木插槽、平稳流出字句的打字机终端。
- **人物动作**：Ringi 熟练操作批处理操纵杆，展现出极致的吞吐与低延迟。
