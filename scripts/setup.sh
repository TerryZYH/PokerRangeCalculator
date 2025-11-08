#!/bin/bash

# 德州扑克手牌范围计算器 - 安装脚本

echo "🃏 德州扑克手牌范围计算器 - 安装开始"
echo "=========================================="

# 检查 Node.js 版本
echo "📦 检查 Node.js 版本..."
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js 版本: $NODE_VERSION"

# 检查 npm 版本
NPM_VERSION=$(npm -v)
echo "✅ npm 版本: $NPM_VERSION"

# 检查并修复 npm 缓存权限
echo ""
echo "🔧 检查 npm 缓存权限..."
if [ -d "$HOME/.npm" ]; then
    if [ ! -w "$HOME/.npm" ]; then
        echo "⚠️  npm 缓存目录权限不足，尝试修复..."
        sudo chown -R $(whoami) "$HOME/.npm" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "✅ npm 缓存权限已修复"
        else
            echo "⚠️  无法自动修复权限，将使用临时缓存"
            USE_TEMP_CACHE=true
        fi
    else
        echo "✅ npm 缓存权限正常"
    fi
fi

# 安装依赖
echo ""
echo "📥 安装项目依赖..."
if [ "$USE_TEMP_CACHE" = true ]; then
    npm install --cache /tmp/.npm-cache
else
    npm install
fi

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ 依赖安装失败！"
    echo ""
    echo "请尝试以下解决方案："
    echo "1. 手动修复权限: sudo chown -R \$(whoami) ~/.npm"
    echo "2. 使用临时缓存: npm install --cache /tmp/.npm-cache"
    echo "3. 使用 yarn: yarn install"
    echo "4. 强制重装: npm install --force"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ 安装完成！"
echo ""
echo "🚀 启动开发服务器:"
echo "   npm run dev"
echo ""
echo "🏗️  构建生产版本:"
echo "   npm run build"
echo ""
echo "📚 查看文档:"
echo "   - README.md (完整文档)"
echo "   - QUICK_START.md (快速开始)"
echo "   - PROJECT_SUMMARY.md (项目总结)"
echo ""
echo "祝您使用愉快！🃏"

