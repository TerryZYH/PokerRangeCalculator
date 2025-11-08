#!/bin/bash

# 德州扑克 AI 助手后端启动脚本

cd "$(dirname "$0")"

echo "🚀 启动德州扑克 AI 助手后端..."
echo ""

# 激活虚拟环境
if [ -d "venv" ]; then
    echo "✓ 激活虚拟环境"
    source venv/bin/activate
else
    echo "❌ 错误：虚拟环境不存在"
    echo "请先运行: python3.12 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo "⚠️  警告：.env 文件不存在"
    echo "请复制 .env.example 为 .env 并填写 Azure OpenAI 配置"
    echo "cp .env.example .env"
    exit 1
fi

# 设置 PYTHONPATH
export PYTHONPATH="$(pwd):$PYTHONPATH"

echo "✓ 环境配置完成"
echo ""
echo "📡 启动服务 (http://localhost:8000)"
echo "📚 API 文档 (http://localhost:8000/docs)"
echo ""
echo "按 Ctrl+C 停止服务"
echo "================================"
echo ""

# 启动服务
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

