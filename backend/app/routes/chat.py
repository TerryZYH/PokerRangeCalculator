"""
聊天相关路由
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from ..models.schemas import ChatRequest, ChatResponse
from ..services.poker_agent import poker_agent
from ..services.llm_service import llm_service
import logging
from datetime import datetime
import uuid
import json
import asyncio

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])

# 简单的对话历史存储（生产环境应该使用数据库）
conversations = {}


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    与 AI 助手对话（非流式）
    
    Args:
        request: 聊天请求
    
    Returns:
        AI 回复
    """
    if not llm_service.is_available():
        raise HTTPException(
            status_code=503,
            detail="AI 服务当前不可用，请检查配置"
        )
    
    try:
        # 获取或创建对话 ID
        conversation_id = request.conversation_id or str(uuid.uuid4())
        
        # 获取对话历史
        history = conversations.get(conversation_id, [])
        
        # 调用 AI Agent
        reply = await poker_agent.chat(
            message=request.message,
            conversation_history=history,
            range_context=request.range_context
        )
        
        # 更新对话历史
        history.append({"role": "user", "content": request.message})
        history.append({"role": "assistant", "content": reply})
        conversations[conversation_id] = history[-20:]  # 保留最近20条
        
        return ChatResponse(
            reply=reply,
            conversation_id=conversation_id,
            timestamp=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"❌ 聊天处理失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stream")
async def chat_stream(request: ChatRequest):
    """
    与 AI 助手对话（流式响应）
    
    Args:
        request: 聊天请求
    
    Returns:
        SSE 流式响应
    """
    if not llm_service.is_available():
        raise HTTPException(
            status_code=503,
            detail="AI 服务当前不可用，请检查配置"
        )
    
    async def generate():
        try:
            # 获取或创建对话 ID
            conversation_id = request.conversation_id or str(uuid.uuid4())
            
            # 发送对话 ID
            yield f"data: {json.dumps({'type': 'conversation_id', 'conversation_id': conversation_id})}\n\n"
            
            # 获取对话历史
            history = conversations.get(conversation_id, [])
            
            # 调用流式 AI Agent
            full_reply = ""
            async for chunk in poker_agent.chat_stream(
                message=request.message,
                conversation_history=history,
                range_context=request.range_context
            ):
                full_reply += chunk
                # 发送文本块
                yield f"data: {json.dumps({'type': 'content', 'content': chunk})}\n\n"
                await asyncio.sleep(0.01)  # 小延迟使流式效果更明显
            
            # 更新对话历史
            history.append({"role": "user", "content": request.message})
            history.append({"role": "assistant", "content": full_reply})
            conversations[conversation_id] = history[-20:]
            
            # 发送完成信号
            yield f"data: {json.dumps({'type': 'done', 'timestamp': datetime.now().isoformat()})}\n\n"
            
        except Exception as e:
            logger.error(f"❌ 流式聊天失败: {e}")
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@router.delete("/{conversation_id}")
async def clear_conversation(conversation_id: str):
    """
    清除对话历史
    
    Args:
        conversation_id: 对话 ID
    
    Returns:
        成功消息
    """
    if conversation_id in conversations:
        del conversations[conversation_id]
        return {"message": "对话历史已清除"}
    else:
        raise HTTPException(status_code=404, detail="对话不存在")


@router.get("/history/{conversation_id}")
async def get_conversation_history(conversation_id: str):
    """
    获取对话历史
    
    Args:
        conversation_id: 对话 ID
    
    Returns:
        对话历史
    """
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="对话不存在")
    
    return {
        "conversation_id": conversation_id,
        "messages": conversations[conversation_id]
    }

