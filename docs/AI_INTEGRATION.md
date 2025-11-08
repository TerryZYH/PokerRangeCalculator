# AI 功能集成文档

## 📖 概述

本项目已集成基于 **LangGraph** 和 **Azure OpenAI** 的智能对话功能，为用户提供专业的德州扑克策略分析和问答服务。

## 🏗️ 架构

### 整体架构

```
┌─────────────────────┐
│   React 前端        │
│   (TypeScript)      │
│                     │
│  - AI Chat UI       │
│  - API Service      │
└──────────┬──────────┘
           │ HTTP/WebSocket
           │
┌──────────▼──────────┐
│   FastAPI 后端      │
│   (Python)          │
│                     │
│  - Chat Router      │
│  - Range Router     │
│  - LangGraph Agent  │
│  - LLM Service      │
└──────────┬──────────┘
           │ API Call
           │
┌──────────▼──────────┐
│   Azure OpenAI      │
│   或 OpenAI         │
└─────────────────────┘
```

### 技术栈

**后端**：
- FastAPI: Web 框架
- LangGraph: 对话流程编排
- LangChain: LLM 集成
- Azure OpenAI SDK: AI 能力
- Pydantic: 数据验证

**前端**：
- React + TypeScript
- Fetch API: HTTP 通信
- Lucide Icons: UI 图标

## 🎯 功能特性

### 1. 智能对话

**功能**：与 AI 助手进行自然语言对话

**特点**：
- 多轮对话上下文记忆
- 支持德州扑克专业术语
- 基于 GTO 策略回答

**示例**：
```
用户: "什么是 GTO 策略？"
AI: "GTO（Game Theory Optimal）是博弈论最优策略..."
```

### 2. 手牌范围分析

**功能**：分析选定的手牌范围合理性

**特点**：
- 评估范围紧松程度
- 分析范围平衡性
- 提供改进建议
- 考虑位置和场景

**API**：
```typescript
POST /range/analyze
{
  "range_name": "UTG Open",
  "hands": ["AA", "KK", "QQ", "AKs"],
  "position": "UTG",
  "scenario": "open"
}
```

### 3. 范围推荐

**功能**：根据场景推荐合适的手牌范围

**特点**：
- 考虑位置因素
- 考虑对手风格
- 考虑筹码深度
- 给出详细理由

**API**：
```typescript
POST /range/recommend
{
  "position": "BTN",
  "scenario": "3-bet vs CO",
  "opponent_style": "tight-aggressive",
  "stack_depth": "100bb"
}
```

### 4. 上下文感知

**功能**：AI 可以感知当前选择的手牌范围

**实现**：
- 前端自动传递 `range_context`
- 后端基于上下文提供更精准的回答

**示例**：
```typescript
// 前端发送
{
  "message": "这个范围合理吗？",
  "range_context": {
    "name": "UTG Open",
    "hands": ["AA", "KK", ...],
    "probability": 15.2
  }
}

// AI 理解当前范围并分析
AI: "您当前选择的 UTG Open 范围（15.2%）是比较标准的..."
```

## 🔧 配置指南

### 后端配置

#### 1. 安装依赖

```bash
cd backend
python -m venv venv
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

#### 2. 配置 Azure OpenAI

编辑 `backend/.env` 文件：

```env
# Azure OpenAI 配置
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-35-turbo
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

**获取配置信息**：

1. **登录 Azure Portal**
   - 访问: https://portal.azure.com

2. **创建 Azure OpenAI 资源**（如果还没有）
   - 搜索 "Azure OpenAI"
   - 点击 "创建"
   - 选择订阅、资源组、区域
   - 选择定价层

3. **部署模型**
   - 进入资源 → 模型部署
   - 点击 "创建新部署"
   - 选择模型（推荐 gpt-35-turbo 或 gpt-4）
   - 输入部署名称（如 `gpt-35-turbo`）

4. **获取密钥和终结点**
   - 进入 "密钥和终结点"
   - 复制：
     - `Endpoint`: 作为 `AZURE_OPENAI_ENDPOINT`
     - `Key 1` 或 `Key 2`: 作为 `AZURE_OPENAI_API_KEY`

#### 3. 启动后端

```bash
cd backend
python app/main.py

# 或使用 uvicorn
uvicorn app.main:app --reload --port 8000
```

访问 http://localhost:8000/docs 查看 API 文档。

### 前端配置

#### 1. 配置 API 地址

编辑 `.env.local` 文件：

```env
VITE_API_URL=http://localhost:8000
```

#### 2. 启动前端

```bash
npm run dev
```

前端会自动连接到后端服务。

### Docker 部署（一键启动）

```bash
# 确保已配置 backend/.env
docker-compose up

# 后台运行
docker-compose up -d
```

这将同时启动前端（3000）和后端（8000）。

## 🎨 使用指南

### 用户界面

#### 1. 打开 AI 助手

- 点击右下角的蓝色浮动按钮
- 图标：💬 MessageCircle

#### 2. 发送消息

- 在输入框输入问题
- 按 Enter 或点击发送按钮

#### 3. 查看回复

- AI 回复显示在左侧（灰色气泡）
- 用户消息显示在右侧（蓝色气泡）

#### 4. 清除对话

- 点击顶部的垃圾桶图标
- 清除当前对话历史

#### 5. 关闭窗口

- 点击顶部的 X 按钮
- 聊天记录会保留

### 使用技巧

#### 1. 范围分析

**操作步骤**：
1. 在手牌矩阵中选择一些手牌
2. 打开 AI 助手
3. 询问："这个范围合理吗？"

**AI 自动获取**：
- 当前范围名称
- 选中的手牌列表
- 概率信息

#### 2. 场景推荐

**示例问题**：
```
"在 BTN 位置面对 CO 的 open，我应该用什么范围 3-bet？"
"对抗紧凶玩家，UTG 应该如何调整 open 范围？"
"100bb 深度下，SB 应该如何防守 BB？"
```

#### 3. 策略学习

**示例问题**：
```
"什么是 GTO 策略？"
"为什么同色手牌比不同色少？"
"如何计算手牌组合数？"
"什么是范围优势？"
```

## 🔌 API 接口

### 1. 健康检查

```http
GET /health
```

**响应**：
```json
{
  "status": "healthy",
  "ai_enabled": true,
  "ai_provider": "Azure OpenAI",
  "version": "1.0.0"
}
```

### 2. 聊天对话

```http
POST /chat/
Content-Type: application/json

{
  "message": "这个范围在UTG位置合理吗？",
  "conversation_id": "uuid-optional",
  "range_context": {
    "name": "UTG Open",
    "hands": ["AA", "KK", "AKs"],
    "probability": 2.26
  }
}
```

**响应**：
```json
{
  "reply": "您选择的UTG Open范围非常紧...",
  "conversation_id": "uuid",
  "timestamp": "2024-01-01T12:00:00"
}
```

### 3. 范围分析

```http
POST /range/analyze
Content-Type: application/json

{
  "range_name": "UTG Open",
  "hands": ["AA", "KK", "QQ", "JJ", "AKs", "AKo"],
  "position": "UTG",
  "scenario": "open"
}
```

**响应**：
```json
{
  "analysis": "详细分析文本...",
  "suggestions": [
    "建议1: 可以适当加入 TT",
    "建议2: AQs 也可以考虑加入",
    "建议3: 注意范围平衡"
  ],
  "probability": 4.52,
  "total_combinations": 60
}
```

### 4. 范围推荐

```http
POST /range/recommend
Content-Type: application/json

{
  "position": "BTN",
  "scenario": "3-bet vs CO",
  "opponent_style": "tight-aggressive",
  "stack_depth": "100bb"
}
```

**响应**：
```json
{
  "recommended_hands": ["AA", "KK", "QQ", "AKs", "AKo", ...],
  "explanation": "针对紧凶玩家的3-bet范围应该...",
  "probability": 8.5
}
```

## 🧪 测试

### 后端测试

```bash
# 测试健康检查
curl http://localhost:8000/health

# 测试聊天（需要配置 API Key）
curl -X POST http://localhost:8000/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "你好"}'
```

### 前端测试

1. 启动前端和后端
2. 打开浏览器开发者工具
3. 点击 AI 助手按钮
4. 查看网络请求和控制台日志

## 🐛 故障排查

### 问题 1: AI 服务不可用

**现象**：
- AI 助手显示"AI 服务当前不可用"
- 无法发送消息

**解决**：
1. 检查后端是否启动（http://localhost:8000/health）
2. 检查 `backend/.env` 配置是否正确
3. 验证 Azure OpenAI API Key 是否有效
4. 查看后端日志

### 问题 2: 无法连接后端

**现象**：
- AI 助手显示"无法连接到后端服务"
- 网络请求失败

**解决**：
1. 确认后端在运行（http://localhost:8000）
2. 检查 `.env.local` 中的 `VITE_API_URL`
3. 检查防火墙设置
4. 查看浏览器控制台错误

### 问题 3: CORS 错误

**现象**：
- 浏览器控制台显示 CORS 错误
- 请求被阻止

**解决**：
1. 检查后端 `app/main.py` 中的 CORS 配置
2. 确认前端地址在 `allow_origins` 列表中
3. 重启后端服务

### 问题 4: 回复速度慢

**原因**：
- LLM API 调用需要时间
- Azure OpenAI 可能有延迟

**优化**：
1. 使用更快的模型（gpt-3.5-turbo）
2. 减少 `AI_MAX_TOKENS` 设置
3. 考虑使用流式响应（未来实现）

## 📊 监控和日志

### 后端日志

后端会输出详细日志：

```
2024-01-01 12:00:00 - app.main - INFO - 🚀 德州扑克 AI 助手启动中...
2024-01-01 12:00:00 - app.main - INFO - ✅ AI 服务已启用: Azure OpenAI
2024-01-01 12:00:01 - app.routes.chat - INFO - 收到聊天请求
```

### 前端监控

使用浏览器开发者工具：

1. **Network 标签**：查看 API 请求
2. **Console 标签**：查看日志和错误
3. **React DevTools**：查看组件状态

## 🔮 未来扩展

### 计划中的功能

1. **流式响应**
   - 实时显示 AI 回复
   - 更好的用户体验

2. **语音输入**
   - 支持语音转文字
   - 更便捷的交互

3. **多模态支持**
   - 支持图片上传
   - 分析手牌图片

4. **对话历史持久化**
   - 保存到数据库
   - 跨设备同步

5. **高级分析**
   - 对手建模
   - 游戏记录分析
   - EV 计算

## 📚 相关文档

- [后端 API 文档](http://localhost:8000/docs)
- [LangGraph 官方文档](https://python.langchain.com/docs/langgraph)
- [Azure OpenAI 文档](https://learn.microsoft.com/azure/ai-services/openai/)
- [FastAPI 官方文档](https://fastapi.tiangolo.com)

## 💡 最佳实践

### 1. API Key 安全

- ❌ 不要把 API Key 提交到 Git
- ✅ 使用 `.env` 文件存储敏感信息
- ✅ 添加 `.env` 到 `.gitignore`
- ✅ 定期轮换 API Key

### 2. 错误处理

- 前端捕获所有 API 错误
- 显示友好的错误信息
- 后端记录详细日志

### 3. 性能优化

- 使用对话 ID 维持上下文
- 限制对话历史长度
- 合理设置 token 限制

### 4. 用户体验

- 显示加载状态
- 提供清除对话功能
- 支持键盘快捷键
- 响应式设计

## 🤝 贡献

欢迎贡献代码和建议！

提交 Issue 或 Pull Request：
- GitHub: [项目地址]

## 📄 许可

MIT License

