# 🔧 脚本工具

本目录包含项目的启动、停止和管理脚本。

## 📋 脚本列表

### 🚀 start.sh
**用途**: 启动完整服务（前端 + 后端）

**功能**:
- ✅ 自动检查依赖（Node.js、Python、npm packages、venv）
- ✅ 自动安装缺失的依赖
- ✅ 启动后端服务（端口 8000）
- ✅ 启动前端服务（端口 5173）
- ✅ 健康检查确保服务正常启动
- ✅ 显示访问地址和管理命令

**使用**:
```bash
./scripts/start.sh
```

**输出示例**:
```
================================
🚀 启动德州扑克 AI 助手
================================

📋 检查依赖...
✓ Node.js: v18.x.x
✓ Python: Python 3.12.x
✓ 前端依赖已安装
✓ 后端虚拟环境已创建

🔧 启动后端服务...
✅ 后端服务启动成功 (PID: 12345)
   地址: http://localhost:8000
   文档: http://localhost:8000/docs

🎨 启动前端服务...
✅ 前端服务启动成功 (PID: 12346)
   地址: http://localhost:5173

================================
🎉 服务启动完成！
================================
```

---

### 🛑 stop.sh
**用途**: 停止所有服务

**功能**:
- ✅ 通过 PID 文件停止服务
- ✅ 通过端口查找并停止服务
- ✅ 支持强制停止（kill -9）
- ✅ 清理 PID 文件

**使用**:
```bash
./scripts/stop.sh
```

**输出示例**:
```
================================
🛑 停止德州扑克 AI 助手
================================

🔧 停止后端服务...
停止 backend 服务 (PID: 12345)...
✅ backend 服务已停止

🎨 停止前端服务...
停止 frontend 服务 (PID: 12346)...
✅ frontend 服务已停止

================================
✅ 所有服务已停止
================================
```

---

### 🔄 restart.sh
**用途**: 重启所有服务

**功能**:
- ✅ 先停止现有服务
- ✅ 等待 2 秒
- ✅ 重新启动服务

**使用**:
```bash
./scripts/restart.sh
```

---

### 📊 status.sh
**用途**: 查看服务状态

**功能**:
- ✅ 检查进程状态（PID）
- ✅ 检查端口监听状态
- ✅ 检查 HTTP 服务响应
- ✅ 显示后端健康状态（AI 服务状态）
- ✅ 显示日志文件位置和大小

**使用**:
```bash
./scripts/status.sh
```

**输出示例**:
```
================================
📊 服务状态检查
================================

🔍 检查 后端 服务...
  ✅ 进程运行中 (PID: 12345)
  ✅ 端口 8000 已监听 (PID: 12345)
  ✅ HTTP 服务正常
     地址: http://localhost:8000/health

🔍 检查 前端 服务...
  ✅ 进程运行中 (PID: 12346)
  ✅ 端口 5173 已监听 (PID: 12346)
  ✅ HTTP 服务正常
     地址: http://localhost:5173

📡 后端服务详情：
  - 状态: healthy
  - AI 服务: ✅ 已启用
  - AI 提供商: Azure OpenAI
  - 版本: 1.0.0

📝 日志文件：
  - 后端: logs/backend.log (1.2M)
  - 前端: logs/frontend.log (856K)

💡 查看日志: tail -f logs/backend.log logs/frontend.log
```

---

### 🎨 dev-frontend.sh
**用途**: 仅启动前端开发服务（不启动后端）

**功能**:
- ✅ 自动检查并安装依赖
- ✅ 启动 Vite 开发服务器
- ✅ 支持热模块替换（HMR）

**使用**:
```bash
./scripts/dev-frontend.sh
```

**适用场景**:
- 纯前端功能开发
- 不需要 AI 功能时
- 后端已在其他地方运行

---

## 🗂️ 文件结构

```
scripts/
├── README.md              # 本文件
├── start.sh               # 启动完整服务
├── stop.sh                # 停止所有服务
├── restart.sh             # 重启服务
├── status.sh              # 查看状态
└── dev-frontend.sh        # 仅前端开发
```

---

## 📁 相关目录

### .pids/
存储进程 ID 文件：
- `backend.pid` - 后端进程 ID
- `frontend.pid` - 前端进程 ID

### logs/
存储服务日志：
- `backend.log` - 后端运行日志
- `frontend.log` - 前端运行日志

这些目录由脚本自动创建和管理。

---

## 💡 使用技巧

### 1. 查看实时日志
```bash
# 同时查看前后端日志
tail -f logs/backend.log logs/frontend.log

# 仅查看后端日志
tail -f logs/backend.log

# 仅查看前端日志
tail -f logs/frontend.log
```

### 2. 快速重启
```bash
# 完整重启
./scripts/restart.sh

# 或者分步操作
./scripts/stop.sh
./scripts/start.sh
```

### 3. 检查服务是否正常
```bash
# 查看详细状态
./scripts/status.sh

# 或者快速检查端口
lsof -i :8000  # 后端
lsof -i :5173  # 前端
```

### 4. 仅开发前端
```bash
# 不启动后端，快速开发前端
./scripts/dev-frontend.sh
```

---

## 🔧 故障排查

### 端口被占用
如果启动时提示端口被占用：

```bash
# 查找占用端口的进程
lsof -i :8000
lsof -i :5173

# 停止进程
kill <PID>

# 或者使用脚本自动处理
./scripts/stop.sh
./scripts/start.sh
```

### 服务启动失败
```bash
# 1. 查看日志
tail -50 logs/backend.log
tail -50 logs/frontend.log

# 2. 检查依赖
cd backend && source venv/bin/activate && pip list
cd .. && npm list --depth=0

# 3. 重新安装依赖
cd backend && pip install -r requirements.txt
cd .. && npm install
```

### PID 文件不同步
如果 PID 文件和实际进程不一致：

```bash
# 清理 PID 文件
rm -rf .pids/

# 手动停止进程
pkill -f "uvicorn app.main:app"
pkill -f "vite"

# 重新启动
./scripts/start.sh
```

---

## 📚 相关文档

- [README.md](../README.md) - 项目主页
- [docs/USER_GUIDE.md](../docs/USER_GUIDE.md) - 用户使用手册
- [docs/DEVELOPMENT.md](../docs/DEVELOPMENT.md) - 开发指南

---

**愉快开发！** 🚀

