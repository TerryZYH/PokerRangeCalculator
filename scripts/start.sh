#!/bin/bash

# 德州扑克 AI 助手 - 启动脚本
# 用途：启动前端和后端服务

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT"
PID_DIR="$PROJECT_ROOT/.pids"

# 创建 PID 目录
mkdir -p "$PID_DIR"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}🚀 启动德州扑克 AI 助手${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# 检查依赖
check_dependencies() {
    echo -e "${YELLOW}📋 检查依赖...${NC}"
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js 未安装${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Node.js: $(node --version)${NC}"
    
    # 检查 Python
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}❌ Python 3 未安装${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Python: $(python3 --version)${NC}"
    
    # 检查前端依赖
    if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
        echo -e "${YELLOW}⚠️  前端依赖未安装，正在安装...${NC}"
        cd "$FRONTEND_DIR" && npm install
    fi
    echo -e "${GREEN}✓ 前端依赖已安装${NC}"
    
    # 检查后端依赖
    if [ ! -d "$BACKEND_DIR/venv" ]; then
        echo -e "${YELLOW}⚠️  后端虚拟环境未创建，正在创建...${NC}"
        cd "$BACKEND_DIR" && python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
    fi
    echo -e "${GREEN}✓ 后端虚拟环境已创建${NC}"
    
    echo ""
}

# 启动后端
start_backend() {
    echo -e "${YELLOW}🔧 启动后端服务...${NC}"
    
    cd "$BACKEND_DIR"
    
    # 检查端口占用
    if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${YELLOW}⚠️  端口 8000 已被占用${NC}"
        PID=$(lsof -ti:8000)
        echo -e "${YELLOW}进程 PID: $PID${NC}"
        read -p "是否停止现有进程? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            kill $PID
            sleep 2
        else
            echo -e "${RED}❌ 取消启动${NC}"
            exit 1
        fi
    fi
    
    # 启动后端服务
    source venv/bin/activate
    nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > "$PROJECT_ROOT/logs/backend.log" 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > "$PID_DIR/backend.pid"
    
    # 等待服务启动
    echo -e "${YELLOW}等待后端服务启动...${NC}"
    for i in {1..10}; do
        if curl -s http://localhost:8000/health >/dev/null 2>&1; then
            echo -e "${GREEN}✅ 后端服务启动成功 (PID: $BACKEND_PID)${NC}"
            echo -e "${GREEN}   地址: http://localhost:8000${NC}"
            echo -e "${GREEN}   文档: http://localhost:8000/docs${NC}"
            return 0
        fi
        sleep 1
    done
    
    echo -e "${RED}❌ 后端服务启动失败${NC}"
    cat "$PROJECT_ROOT/logs/backend.log"
    exit 1
}

# 启动前端
start_frontend() {
    echo ""
    echo -e "${YELLOW}🎨 启动前端服务...${NC}"
    
    cd "$FRONTEND_DIR"
    
    # 检查端口占用
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${YELLOW}⚠️  端口 3000 已被占用${NC}"
        PID=$(lsof -ti:3000)
        echo -e "${YELLOW}进程 PID: $PID${NC}"
        read -p "是否停止现有进程? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            kill $PID
            sleep 2
        else
            echo -e "${RED}❌ 取消启动${NC}"
            exit 1
        fi
    fi
    
    # 启动前端服务
    nohup npm run dev > "$PROJECT_ROOT/logs/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > "$PID_DIR/frontend.pid"
    
    # 等待服务启动
    echo -e "${YELLOW}等待前端服务启动...${NC}"
    for i in {1..10}; do
        if curl -s http://localhost:3000 >/dev/null 2>&1; then
            echo -e "${GREEN}✅ 前端服务启动成功 (PID: $FRONTEND_PID)${NC}"
            echo -e "${GREEN}   地址: http://localhost:3000${NC}"
            return 0
        fi
        sleep 1
    done
    
    echo -e "${RED}❌ 前端服务启动失败${NC}"
    cat "$PROJECT_ROOT/logs/frontend.log"
    exit 1
}

# 主流程
main() {
    # 创建日志目录
    mkdir -p "$PROJECT_ROOT/logs"
    
    # 检查依赖
    check_dependencies
    
    # 启动服务
    start_backend
    start_frontend
    
    echo ""
    echo -e "${BLUE}================================${NC}"
    echo -e "${GREEN}🎉 服务启动完成！${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
    echo -e "${GREEN}📡 访问地址：${NC}"
    echo -e "${GREEN}   前端: http://localhost:3000${NC}"
    echo -e "${GREEN}   后端: http://localhost:8000${NC}"
    echo -e "${GREEN}   API文档: http://localhost:8000/docs${NC}"
    echo ""
    echo -e "${YELLOW}💡 管理命令：${NC}"
    echo -e "${YELLOW}   查看状态: ./scripts/status.sh${NC}"
    echo -e "${YELLOW}   停止服务: ./scripts/stop.sh${NC}"
    echo -e "${YELLOW}   重启服务: ./scripts/restart.sh${NC}"
    echo -e "${YELLOW}   查看日志: tail -f logs/backend.log logs/frontend.log${NC}"
    echo ""
    echo -e "${BLUE}================================${NC}"
}

# 执行主流程
main

