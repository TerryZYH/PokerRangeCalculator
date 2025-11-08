#!/bin/bash

# 德州扑克 AI 助手 - 状态检查脚本
# 用途：查看前端和后端服务状态

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
echo -e "${BLUE}📊 服务状态检查${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# 检查服务状态
check_service() {
    local service_name=$1
    local port=$2
    local pid_file="$PID_DIR/$service_name.pid"
    local url=$3
    
    echo -e "${YELLOW}🔍 检查 $service_name 服务...${NC}"
    
    # 检查 PID 文件
    if [ -f "$pid_file" ]; then
        PID=$(cat "$pid_file")
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${GREEN}  ✅ 进程运行中 (PID: $PID)${NC}"
        else
            echo -e "${RED}  ❌ 进程不存在 (PID: $PID)${NC}"
            echo -e "${YELLOW}     (PID 文件存在但进程已停止)${NC}"
        fi
    else
        echo -e "${YELLOW}  ⚠️  未找到 PID 文件${NC}"
    fi
    
    # 检查端口
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        PORT_PID=$(lsof -ti:$port)
        echo -e "${GREEN}  ✅ 端口 $port 已监听 (PID: $PORT_PID)${NC}"
    else
        echo -e "${RED}  ❌ 端口 $port 未监听${NC}"
    fi
    
    # 检查 HTTP 服务
    if [ ! -z "$url" ]; then
        if curl -s "$url" >/dev/null 2>&1; then
            echo -e "${GREEN}  ✅ HTTP 服务正常${NC}"
            echo -e "${GREEN}     地址: $url${NC}"
        else
            echo -e "${RED}  ❌ HTTP 服务无响应${NC}"
        fi
    fi
    
    echo ""
}

# 检查后端健康状态
check_backend_health() {
    if curl -s http://localhost:8000/health >/dev/null 2>&1; then
        HEALTH=$(curl -s http://localhost:8000/health)
        echo -e "${GREEN}📡 后端服务详情：${NC}"
        echo "$HEALTH" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f'  - 状态: {data.get(\"status\", \"unknown\")}')
    print(f'  - AI 服务: {\"✅ 已启用\" if data.get(\"ai_enabled\") else \"❌ 未启用\"}')
    print(f'  - AI 提供商: {data.get(\"ai_provider\", \"N/A\")}')
    print(f'  - 版本: {data.get(\"version\", \"N/A\")}')
except:
    print('  - 无法解析健康检查响应')
"
        echo ""
    fi
}

# 显示日志位置
show_logs() {
    echo -e "${YELLOW}📝 日志文件：${NC}"
    
    if [ -f "$PROJECT_ROOT/logs/backend.log" ]; then
        SIZE=$(du -h "$PROJECT_ROOT/logs/backend.log" | cut -f1)
        echo -e "${GREEN}  - 后端: logs/backend.log ($SIZE)${NC}"
    else
        echo -e "${YELLOW}  - 后端: logs/backend.log (不存在)${NC}"
    fi
    
    if [ -f "$PROJECT_ROOT/logs/frontend.log" ]; then
        SIZE=$(du -h "$PROJECT_ROOT/logs/frontend.log" | cut -f1)
        echo -e "${GREEN}  - 前端: logs/frontend.log ($SIZE)${NC}"
    else
        echo -e "${YELLOW}  - 前端: logs/frontend.log (不存在)${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}💡 查看日志: tail -f logs/backend.log logs/frontend.log${NC}"
    echo ""
}

# 主流程
main() {
    # 检查后端
    check_service "后端" 8000 "http://localhost:8000/health"
    
    # 检查前端
    check_service "前端" 3000 "http://localhost:3000"
    
    # 检查后端健康状态
    check_backend_health
    
    # 显示日志位置
    show_logs
    
    echo -e "${BLUE}================================${NC}"
    echo -e "${YELLOW}💡 管理命令：${NC}"
    echo -e "${YELLOW}   启动服务: ./scripts/start.sh${NC}"
    echo -e "${YELLOW}   停止服务: ./scripts/stop.sh${NC}"
    echo -e "${YELLOW}   重启服务: ./scripts/restart.sh${NC}"
    echo -e "${BLUE}================================${NC}"
}

# 执行主流程
main

