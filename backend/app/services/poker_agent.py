"""
德州扑克 AI 助手
使用 LangGraph 构建对话流程
"""
from typing import TypedDict, Annotated, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage
from .llm_service import llm_service
import logging

logger = logging.getLogger(__name__)


class AgentState(TypedDict):
    """Agent 状态"""
    messages: List[Dict[str, str]]
    range_context: Dict[str, Any]
    analysis_result: str


class PokerAgent:
    """德州扑克 AI 助手"""
    
    def __init__(self):
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        """构建 LangGraph 工作流"""
        workflow = StateGraph(AgentState)
        
        # 添加节点
        workflow.add_node("analyze_intent", self.analyze_intent)
        workflow.add_node("answer_question", self.answer_question)
        workflow.add_node("analyze_range", self.analyze_range)
        workflow.add_node("recommend_range", self.recommend_range)
        
        # 设置入口
        workflow.set_entry_point("analyze_intent")
        
        # 添加条件边
        workflow.add_conditional_edges(
            "analyze_intent",
            self.route_intent,
            {
                "question": "answer_question",
                "analyze": "analyze_range",
                "recommend": "recommend_range",
            }
        )
        
        # 所有节点都连接到 END
        workflow.add_edge("answer_question", END)
        workflow.add_edge("analyze_range", END)
        workflow.add_edge("recommend_range", END)
        
        return workflow.compile()
    
    async def analyze_intent(self, state: AgentState) -> AgentState:
        """分析用户意图"""
        last_message = state["messages"][-1]["content"]
        
        # 简单的意图识别（实际可以用 LLM 做更智能的识别）
        if "分析" in last_message or "评价" in last_message or "合理" in last_message:
            state["intent"] = "analyze"
        elif "推荐" in last_message or "建议" in last_message or "应该" in last_message:
            state["intent"] = "recommend"
        else:
            state["intent"] = "question"
        
        return state
    
    def route_intent(self, state: AgentState) -> str:
        """路由到不同的处理节点"""
        return state.get("intent", "question")
    
    async def answer_question(self, state: AgentState) -> AgentState:
        """回答一般问题"""
        last_message = state["messages"][-1]["content"]
        range_context = state.get("range_context", {})
        
        # 准备上下文
        history = state["messages"][:-1][-5:]  # 最近5条消息
        
        # 生成包含范围信息的 system prompt
        system_prompt = llm_service.get_system_prompt(range_context=range_context)
        
        # 调用 LLM
        response = await llm_service.chat(
            message=last_message,
            system_prompt=system_prompt,
            history=history
        )
        
        state["analysis_result"] = response
        return state
    
    async def analyze_range(self, state: AgentState) -> AgentState:
        """分析手牌范围"""
        last_message = state["messages"][-1]["content"]
        range_context = state.get("range_context", {})
        
        # 构建分析提示
        prompt = f"""请分析以下手牌范围：

{last_message}

请从以下方面进行分析：
1. 范围的紧松程度
2. 范围的平衡性（价值牌和诈唬牌的比例）
3. 针对不同对手的适用性
4. 可能的改进建议"""
        
        # 生成包含范围信息的 system prompt
        system_prompt = llm_service.get_system_prompt(range_context=range_context)
        
        response = await llm_service.chat(
            message=prompt,
            system_prompt=system_prompt
        )
        
        state["analysis_result"] = response
        return state
    
    async def recommend_range(self, state: AgentState) -> AgentState:
        """推荐手牌范围"""
        last_message = state["messages"][-1]["content"]
        range_context = state.get("range_context", {})
        
        prompt = f"""请根据以下信息推荐合适的手牌范围：

{last_message}

请提供：
1. 推荐的具体手牌列表
2. 预期的范围概率
3. 推荐理由
4. 使用注意事项"""
        
        # 生成包含范围信息的 system prompt
        system_prompt = llm_service.get_system_prompt(range_context=range_context)
        
        response = await llm_service.chat(
            message=prompt,
            system_prompt=system_prompt
        )
        
        state["analysis_result"] = response
        return state
    
    async def chat(
        self, 
        message: str, 
        conversation_history: List[Dict[str, str]] = None,
        range_context: Dict[str, Any] = None
    ) -> str:
        """
        与 AI 助手对话（非流式）
        
        Args:
            message: 用户消息
            conversation_history: 对话历史
            range_context: 范围上下文
        
        Returns:
            AI 回复
        """
        if not llm_service.is_available():
            return "抱歉，AI 服务当前不可用。请检查配置。"
        
        try:
            # 准备状态
            messages = conversation_history or []
            messages.append({"role": "user", "content": message})
            
            state = {
                "messages": messages,
                "range_context": range_context or {},
                "analysis_result": ""
            }
            
            # 运行工作流
            result = await self.graph.ainvoke(state)
            
            return result.get("analysis_result", "抱歉，无法生成回复。")
            
        except Exception as e:
            logger.error(f"❌ Agent 处理失败: {e}")
            return f"抱歉，处理您的请求时出现错误: {str(e)}"
    
    async def chat_stream(
        self, 
        message: str, 
        conversation_history: List[Dict[str, str]] = None,
        range_context: Dict[str, Any] = None
    ):
        """
        与 AI 助手对话（流式）
        
        Args:
            message: 用户消息
            conversation_history: 对话历史
            range_context: 范围上下文
        
        Yields:
            AI 回复的文本块
        """
        if not llm_service.is_available():
            yield "抱歉，AI 服务当前不可用。请检查配置。"
            return
        
        try:
            # 准备历史
            history = conversation_history or []
            
            # 生成包含范围信息的 system prompt
            system_prompt = llm_service.get_system_prompt(range_context=range_context)
            
            # 调试日志
            logger.info(f"📊 Range Context: {range_context}")
            logger.info(f"📝 System Prompt Length: {len(system_prompt)}")
            if range_context:
                logger.info(f"✅ 范围信息已注入: {range_context.get('name', 'Unknown')}")
            
            # 直接使用 LLM 服务的流式方法（简化版）
            async for chunk in llm_service.chat_stream(
                message=message,
                system_prompt=system_prompt,
                history=history[-5:]  # 最近5条消息
            ):
                yield chunk
            
        except Exception as e:
            logger.error(f"❌ 流式 Agent 处理失败: {e}")
            yield f"抱歉，处理您的请求时出现错误: {str(e)}"


# 全局 Agent 实例
poker_agent = PokerAgent()

