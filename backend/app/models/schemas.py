"""
数据模型定义
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class ChatMessage(BaseModel):
    """聊天消息"""
    role: str = Field(..., description="消息角色: user, assistant, system")
    content: str = Field(..., description="消息内容")


class ChatRequest(BaseModel):
    """聊天请求"""
    message: str = Field(..., description="用户消息", min_length=1, max_length=2000)
    conversation_id: Optional[str] = Field(None, description="对话 ID，用于维持上下文")
    range_context: Optional[Dict[str, Any]] = Field(None, description="当前范围上下文")


class ChatResponse(BaseModel):
    """聊天响应"""
    reply: str = Field(..., description="AI 回复")
    conversation_id: str = Field(..., description="对话 ID")
    timestamp: datetime = Field(default_factory=datetime.now)


class RangeAnalysisRequest(BaseModel):
    """范围分析请求"""
    range_name: str = Field(..., description="范围名称")
    hands: List[str] = Field(..., description="手牌列表", example=["AA", "KK", "AKs"])
    position: Optional[str] = Field(None, description="位置", example="UTG")
    scenario: Optional[str] = Field(None, description="场景", example="open")


class RangeAnalysisResponse(BaseModel):
    """范围分析响应"""
    analysis: str = Field(..., description="分析结果")
    suggestions: List[str] = Field(default_factory=list, description="建议")
    probability: float = Field(..., description="出现概率")
    total_combinations: int = Field(..., description="总组合数")


class RangeRecommendationRequest(BaseModel):
    """范围推荐请求"""
    position: str = Field(..., description="位置", example="BTN")
    scenario: str = Field(..., description="场景", example="open")
    opponent_style: Optional[str] = Field(None, description="对手风格", example="tight-aggressive")
    stack_depth: Optional[str] = Field(None, description="筹码深度", example="100bb")


class RangeRecommendationResponse(BaseModel):
    """范围推荐响应"""
    recommended_hands: List[str] = Field(..., description="推荐手牌")
    explanation: str = Field(..., description="推荐理由")
    probability: float = Field(..., description="预期概率")


class HealthResponse(BaseModel):
    """健康检查响应"""
    status: str = Field(..., description="服务状态")
    ai_enabled: bool = Field(..., description="AI 功能是否启用")
    ai_provider: Optional[str] = Field(None, description="AI 提供商")
    version: str = Field(default="1.0.0", description="API 版本")

