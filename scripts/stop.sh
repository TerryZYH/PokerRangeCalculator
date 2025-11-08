#!/bin/bash

# 德州扑克 AI 助手 - 停止脚本
# 用途：停止前端和后端服务

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_DIR="$PROJECT_ROOT/.pids"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}🛑 停止德州扑克 AI 助手${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# 停止服务
stop_service() {
    local service_name=$1
    local pid_file="$PID_DIR/$service_name.pid"
    
    if [ -f "$pid_file" ]; then
        PID=$(cat "$pid_file")
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${YELLOW}停止 $service_name 服务 (PID: $PID)...${NC}"
            kill $PID
            
            # 等待进程结束
            for i in {1..5}; do
                if ! ps -p $PID > /dev/null 2>&1; then
                    echo -e "${GREEN}✅ $service_name 服务已停止${NC}"
                    rm -f "$pid_file"
                    return 0
                fi
                sleep 1
            done
            
            # 强制停止
            echo -e "${YELLOW}强制停止 $service_name 服务...${NC}"
            kill -9 $PID 2>/dev/null || true
            rm -f "$pid_file"
            echo -e "${GREEN}✅ $service_name 服务已强制停止${NC}"
        else
            echo -e "${YELLOW}⚠️  $service_name 进程不存在 (PID: $PID)${NC}"
            rm -f "$pid_file"
        fi
    else
        echo -e "${YELLOW}⚠️  未找到 $service_name 的 PID 文件${NC}"
    fi
}

# 通过端口停止服务
stop_by_port() {
    local service_name=$1
    local port=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        PIDS=$(lsof -ti:$port)
        echo -e "${YELLOW}发现 $service_name 服务占用端口 $port (PID: $PIDS)${NC}"
        
        # 停止所有相关进程
        for PID in $PIDS; do
            kill $PID 2>/dev/null || true
        done
        sleep 2
        
        if ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
            echo -e "${GREEN}✅ $service_name 服务已停止${NC}"
        else
            echo -e "${YELLOW}强制停止 $service_name 服务...${NC}"
            for PID in $PIDS; do
                kill -9 $PID 2>/dev/null || true
            done
            echo -e "${GREEN}✅ $service_name 服务已强制停止${NC}"
        fi
    fi
}

# 通过进程名停止服务
stop_by_process() {
    local process_pattern=$1
    local service_name=$2
    
    PIDS=$(ps aux | grep "$process_pattern" | grep -v grep | awk '{print $2}')
    
    if [ ! -z "$PIDS" ]; then
        echo -e "${YELLOW}发现 $service_name 进程: $PIDS${NC}"
        for PID in $PIDS; do
            kill $PID 2>/dev/null || true
        done
        sleep 1
        
        # 检查是否还有进程
        REMAINING=$(ps aux | grep "$process_pattern" | grep -v grep | awk '{print $2}')
        if [ -z "$REMAINING" ]; then
            echo -e "${GREEN}✅ $service_name 进程已停止${NC}"
        else
            echo -e "${YELLOW}强制停止 $service_name 进程...${NC}"
            for PID in $REMAINING; do
                kill -9 $PID 2>/dev/null || true
            done
            echo -e "${GREEN}✅ $service_name 进程已强制停止${NC}"
        fi
    fi
}

# 主流程
main() {
    # 停止后端
    echo -e "${YELLOW}🔧 停止后端服务...${NC}"
    stop_service "backend"
    stop_by_port "后端" 8000
    
    # 额外检查：通过命令行特征停止后端
    BACKEND_PIDS=$(ps aux | grep "uvicorn app.main:app" | grep -v grep | awk '{print $2}')
    if [ ! -z "$BACKEND_PIDS" ]; then
        echo -e "${YELLOW}发现后端进程: $BACKEND_PIDS${NC}"
        for PID in $BACKEND_PIDS; do
            kill $PID 2>/dev/null || true
        done
        echo -e "${GREEN}✅ 后端进程已清理${NC}"
    fi
    
    echo ""
    
    # 停止前端
    echo -e "${YELLOW}🎨 停止前端服务...${NC}"
    stop_service "frontend"
    stop_by_port "前端" 3000
    
    # 额外检查：通过命令行特征停止前端 npm 和 vite 进程
    NPM_PIDS=$(ps aux | grep "npm run dev" | grep "po4" | grep -v grep | awk '{print $2}')
    if [ ! -z "$NPM_PIDS" ]; then
        echo -e "${YELLOW}发现前端 npm 进程: $NPM_PIDS${NC}"
        for PID in $NPM_PIDS; do
            kill $PID 2>/dev/null || true
        done
        sleep 1
        echo -e "${GREEN}✅ npm 进程已清理${NC}"
    fi
    
    VITE_PIDS=$(ps aux | grep "node.*vite" | grep "po4" | grep -v grep | awk '{print $2}')
    if [ ! -z "$VITE_PIDS" ]; then
        echo -e "${YELLOW}发现前端 vite 进程: $VITE_PIDS${NC}"
        for PID in $VITE_PIDS; do
            kill $PID 2>/dev/null || true
        done
        echo -e "${GREEN}✅ vite 进程已清理${NC}"
    fi
    
    # 清理 PID 目录
    if [ -d "$PID_DIR" ] && [ -z "$(ls -A $PID_DIR)" ]; then
        rm -rf "$PID_DIR"
    fi
    
    echo ""
    echo -e "${BLUE}================================${NC}"
    echo -e "${GREEN}✅ 所有服务已停止${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
    echo -e "${YELLOW}💡 重新启动: ./scripts/start.sh${NC}"
    echo ""
}

# 执行主流程
main

