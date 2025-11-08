#!/bin/bash

# 德州扑克 AI 助手 - 仅前端开发脚本
# 用途：仅启动前端，不启动后端（适合纯前端开发）

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}🎨 启动前端开发服务${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

cd "$PROJECT_ROOT"

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 安装前端依赖...${NC}"
    npm install
    echo ""
fi

echo -e "${GREEN}✅ 依赖检查完成${NC}"
echo ""
echo -e "${YELLOW}🚀 启动 Vite 开发服务器...${NC}"
echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}📡 访问地址: http://localhost:5173${NC}"
echo -e "${YELLOW}💡 提示: AI 功能需要后端服务${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# 启动开发服务器
npm run dev

