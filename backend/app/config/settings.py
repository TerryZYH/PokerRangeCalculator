"""
应用配置
从环境变量加载配置信息
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """应用配置类"""
    
    # Azure OpenAI 配置
    azure_openai_endpoint: Optional[str] = None
    azure_openai_api_key: Optional[str] = None
    azure_openai_deployment_name: Optional[str] = "gpt-35-turbo"
    azure_openai_api_version: str = "2024-02-15-preview"
    
    # 标准 OpenAI 配置（备选）
    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-3.5-turbo"
    
    # 应用配置
    environment: str = "development"
    port: int = 8000
    frontend_url: str = "http://localhost:3000"
    log_level: str = "INFO"
    
    # AI 功能配置
    ai_temperature: float = 0.7
    ai_max_tokens: int = 1000
    ai_conversation_history_length: int = 10
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    @property
    def is_azure_configured(self) -> bool:
        """检查是否配置了 Azure OpenAI"""
        return bool(
            self.azure_openai_endpoint and 
            self.azure_openai_api_key and 
            self.azure_openai_deployment_name
        )
    
    @property
    def is_openai_configured(self) -> bool:
        """检查是否配置了标准 OpenAI"""
        return bool(self.openai_api_key)
    
    @property
    def is_ai_enabled(self) -> bool:
        """检查 AI 功能是否可用"""
        return self.is_azure_configured or self.is_openai_configured


# 全局配置实例
settings = Settings()

