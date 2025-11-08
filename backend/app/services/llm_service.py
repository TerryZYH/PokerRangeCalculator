"""
LLM 服务
支持 Azure OpenAI 和标准 OpenAI
"""
from typing import Optional, List
from langchain_openai import AzureChatOpenAI, ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from ..config.settings import settings
import logging

logger = logging.getLogger(__name__)


class LLMService:
    """LLM 服务类"""
    
    def __init__(self):
        self.llm = None
        self.provider = None
        self._initialize_llm()
    
    def _initialize_llm(self):
        """初始化 LLM"""
        try:
            if settings.is_azure_configured:
                # 使用 Azure OpenAI
                self.llm = AzureChatOpenAI(
                    azure_endpoint=settings.azure_openai_endpoint,
                    api_key=settings.azure_openai_api_key,
                    deployment_name=settings.azure_openai_deployment_name,
                    api_version=settings.azure_openai_api_version,
                    temperature=settings.ai_temperature,
                    max_tokens=settings.ai_max_tokens,
                )
                self.provider = "Azure OpenAI"
                logger.info(f"✅ Azure OpenAI 初始化成功: {settings.azure_openai_deployment_name}")
                
            elif settings.is_openai_configured:
                # 使用标准 OpenAI
                self.llm = ChatOpenAI(
                    api_key=settings.openai_api_key,
                    model=settings.openai_model,
                    temperature=settings.ai_temperature,
                    max_tokens=settings.ai_max_tokens,
                )
                self.provider = "OpenAI"
                logger.info(f"✅ OpenAI 初始化成功: {settings.openai_model}")
                
            else:
                logger.warning("⚠️  未配置 AI 服务，AI 功能将不可用")
                
        except Exception as e:
            logger.error(f"❌ LLM 初始化失败: {e}")
            self.llm = None
            self.provider = None
    
    def is_available(self) -> bool:
        """检查 LLM 是否可用"""
        return self.llm is not None
    
    async def chat(
        self, 
        message: str, 
        system_prompt: Optional[str] = None,
        history: Optional[List[dict]] = None
    ) -> str:
        """
        聊天（非流式）
        
        Args:
            message: 用户消息
            system_prompt: 系统提示（可选）
            history: 对话历史（可选）
        
        Returns:
            AI 回复
        """
        if not self.is_available():
            return "抱歉，AI 服务当前不可用。请检查配置。"
        
        try:
            messages = []
            
            # 添加系统提示
            if system_prompt:
                messages.append(SystemMessage(content=system_prompt))
            
            # 添加历史消息
            if history:
                for msg in history:
                    if msg["role"] == "user":
                        messages.append(HumanMessage(content=msg["content"]))
                    elif msg["role"] == "assistant":
                        messages.append(AIMessage(content=msg["content"]))
            
            # 添加当前消息
            messages.append(HumanMessage(content=message))
            
            # 调用 LLM
            response = await self.llm.ainvoke(messages)
            return response.content
            
        except Exception as e:
            logger.error(f"❌ 聊天失败: {e}")
            return f"抱歉，处理您的请求时出现错误: {str(e)}"
    
    async def chat_stream(
        self, 
        message: str, 
        system_prompt: Optional[str] = None,
        history: Optional[List[dict]] = None
    ):
        """
        聊天（流式）
        
        Args:
            message: 用户消息
            system_prompt: 系统提示（可选）
            history: 对话历史（可选）
        
        Yields:
            AI 回复的文本块
        """
        if not self.is_available():
            yield "抱歉，AI 服务当前不可用。请检查配置。"
            return
        
        try:
            messages = []
            
            # 添加系统提示
            if system_prompt:
                messages.append(SystemMessage(content=system_prompt))
            
            # 添加历史消息
            if history:
                for msg in history:
                    if msg["role"] == "user":
                        messages.append(HumanMessage(content=msg["content"]))
                    elif msg["role"] == "assistant":
                        messages.append(AIMessage(content=msg["content"]))
            
            # 添加当前消息
            messages.append(HumanMessage(content=message))
            
            # 流式调用 LLM
            async for chunk in self.llm.astream(messages):
                if hasattr(chunk, 'content') and chunk.content:
                    yield chunk.content
            
        except Exception as e:
            logger.error(f"❌ 流式聊天失败: {e}")
            yield f"抱歉，处理您的请求时出现错误: {str(e)}"
    
    def get_system_prompt(self, range_context: Optional[dict] = None) -> str:
        """
        获取德州扑克助手的系统提示
        
        Args:
            range_context: 当前选择的范围上下文（可选）
        
        Returns:
            系统提示文本
        """
        base_prompt = """你是一个专业的德州扑克策略助手。你的任务是：

1. 帮助玩家分析手牌范围的合理性
2. 根据位置、场景和对手风格提供策略建议
3. 解释扑克概率和数学概念
4. 回答关于德州扑克的各种问题

回答时请：
- 使用清晰简洁的语言
- 提供具体的数字和概率
- 基于GTO（博弈论最优）策略
- 考虑实战中的灵活应用
- 使用中文回答

重要概念：
- 对子（如 AA）有 6 种组合
- 同色（如 AKs）有 4 种组合
- 不同色（如 AKo）有 12 种组合
- 总共 1326 种起手牌组合

请保持专业、友好和耐心。"""

        # 如果有范围上下文，添加到 system prompt
        if range_context and range_context.get('hands'):
            hands = range_context.get('hands', [])
            name = range_context.get('name', '当前范围')
            
            # 计算总组合数
            total_combos = 0
            for hand in hands:
                if len(hand) == 2:  # 对子，如 AA
                    total_combos += 6
                elif hand.endswith('s'):  # 同花，如 AKs
                    total_combos += 4
                elif hand.endswith('o'):  # 不同花，如 AKo
                    total_combos += 12
                else:
                    total_combos += 16  # 未指定花色，计算所有组合
            
            probability = (total_combos / 1326) * 100
            
            range_info = f"""

**当前用户选择的范围信息：**
- 范围名称：{name}
- 包含手牌：{', '.join(sorted(hands))}
- 手牌数量：{len(hands)} 种
- 总组合数：{total_combos} 种
- 出现概率：{probability:.2f}%

请在回答时优先考虑并分析用户当前选择的这个范围。你可以：
- 评价这个范围的强度和松紧程度
- 分析这个范围在不同位置和场景下的适用性
- 提供针对这个范围的优化建议
- 回答关于这个范围的具体问题"""
            
            return base_prompt + range_info
        
        return base_prompt


# 全局 LLM 服务实例
llm_service = LLMService()

