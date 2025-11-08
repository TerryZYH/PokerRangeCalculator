"""
FastAPI 主应用
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config.settings import settings
from .routes import chat, range
from .models.schemas import HealthResponse
from .services.llm_service import llm_service
import logging

# 配置日志
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# 创建 FastAPI 应用
app = FastAPI(
    title="德州扑克 AI 助手 API",
    description="基于 LangGraph 的德州扑克手牌范围分析和智能对话系统",
    version="1.0.0"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(chat.router)
app.include_router(range.router)


@app.on_event("startup")
async def startup_event():
    """应用启动事件"""
    logger.info("🚀 德州扑克 AI 助手启动中...")
    logger.info(f"📝 环境: {settings.environment}")
    logger.info(f"🌐 前端地址: {settings.frontend_url}")
    
    if llm_service.is_available():
        logger.info(f"✅ AI 服务已启用: {llm_service.provider}")
    else:
        logger.warning("⚠️  AI 服务未配置，请检查环境变量")
        logger.warning("💡 请参考 .env.example 配置 Azure OpenAI 或 OpenAI API")


@app.get("/", response_model=HealthResponse)
async def root():
    """
    根路径 - 健康检查
    
    Returns:
        服务状态
    """
    return HealthResponse(
        status="healthy",
        ai_enabled=llm_service.is_available(),
        ai_provider=llm_service.provider,
        version="1.0.0"
    )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    健康检查接口
    
    Returns:
        服务状态
    """
    return HealthResponse(
        status="healthy",
        ai_enabled=llm_service.is_available(),
        ai_provider=llm_service.provider,
        version="1.0.0"
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=settings.environment == "development"
    )

