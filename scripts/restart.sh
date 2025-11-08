#!/bin/bash

# 德州扑克 AI 助手 - 重启脚本
# 用途：重启前端和后端服务

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}🔄 重启德州扑克 AI 助手${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# 停止服务
echo -e "${YELLOW}1️⃣  停止现有服务...${NC}"
bash "$SCRIPT_DIR/stop.sh"

echo ""
echo -e "${YELLOW}⏳ 等待 2 秒...${NC}"
sleep 2

echo ""
echo -e "${YELLOW}2️⃣  启动服务...${NC}"
bash "$SCRIPT_DIR/start.sh"

