"""
范围分析相关路由
"""
from fastapi import APIRouter, HTTPException
from ..models.schemas import (
    RangeAnalysisRequest, 
    RangeAnalysisResponse,
    RangeRecommendationRequest,
    RangeRecommendationResponse
)
from ..services.poker_agent import poker_agent
from ..services.llm_service import llm_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/range", tags=["range"])


@router.post("/analyze", response_model=RangeAnalysisResponse)
async def analyze_range(request: RangeAnalysisRequest):
    """
    分析手牌范围
    
    Args:
        request: 范围分析请求
    
    Returns:
        分析结果
    """
    if not llm_service.is_available():
        raise HTTPException(
            status_code=503,
            detail="AI 服务当前不可用，请检查配置"
        )
    
    try:
        # 计算概率和组合数
        total_combinations = calculate_total_combinations(request.hands)
        probability = (total_combinations / 1326) * 100
        
        # 构建分析提示
        prompt = f"""请分析以下手牌范围：

范围名称: {request.range_name}
手牌列表: {', '.join(request.hands)}
位置: {request.position or '未指定'}
场景: {request.scenario or '未指定'}
总组合数: {total_combinations}
出现概率: {probability:.2f}%

请从以下方面进行分析：
1. 范围的紧松程度评估
2. 范围的平衡性（价值牌和诈唬牌的比例）
3. 针对不同对手风格的适用性
4. 具体的改进建议（请给出3-5条）

请用专业但易懂的语言回答。"""
        
        # 调用 AI
        analysis = await llm_service.chat(
            message=prompt,
            system_prompt=llm_service.get_system_prompt()
        )
        
        # 提取建议（简单的文本处理）
        suggestions = extract_suggestions(analysis)
        
        return RangeAnalysisResponse(
            analysis=analysis,
            suggestions=suggestions,
            probability=round(probability, 2),
            total_combinations=total_combinations
        )
        
    except Exception as e:
        logger.error(f"❌ 范围分析失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/recommend", response_model=RangeRecommendationResponse)
async def recommend_range(request: RangeRecommendationRequest):
    """
    推荐手牌范围
    
    Args:
        request: 范围推荐请求
    
    Returns:
        推荐结果
    """
    if not llm_service.is_available():
        raise HTTPException(
            status_code=503,
            detail="AI 服务当前不可用，请检查配置"
        )
    
    try:
        # 构建推荐提示
        prompt = f"""请为以下场景推荐合适的手牌范围：

位置: {request.position}
场景: {request.scenario}
对手风格: {request.opponent_style or '标准'}
筹码深度: {request.stack_depth or '100bb'}

请提供：
1. 推荐的具体手牌列表（使用标准格式，如 AA, KK, AKs, AKo 等）
2. 预期的范围概率
3. 详细的推荐理由
4. 使用注意事项

请在回答的第一行用【手牌】标记列出所有推荐手牌，用逗号分隔。
例如：【手牌】AA, KK, QQ, AKs, AKo"""
        
        # 调用 AI
        response = await llm_service.chat(
            message=prompt,
            system_prompt=llm_service.get_system_prompt()
        )
        
        # 提取手牌列表
        hands = extract_hands(response)
        
        # 计算概率
        total_combinations = calculate_total_combinations(hands)
        probability = (total_combinations / 1326) * 100
        
        return RangeRecommendationResponse(
            recommended_hands=hands,
            explanation=response,
            probability=round(probability, 2)
        )
        
    except Exception as e:
        logger.error(f"❌ 范围推荐失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def calculate_total_combinations(hands: list[str]) -> int:
    """
    计算手牌总组合数
    
    Args:
        hands: 手牌列表
    
    Returns:
        总组合数
    """
    total = 0
    for hand in hands:
        if len(hand) == 2:  # 对子，如 AA
            total += 6
        elif hand.endswith('s'):  # 同色，如 AKs
            total += 4
        elif hand.endswith('o'):  # 不同色，如 AKo
            total += 12
    return total


def extract_suggestions(text: str) -> list[str]:
    """
    从分析文本中提取建议
    
    Args:
        text: 分析文本
    
    Returns:
        建议列表
    """
    suggestions = []
    lines = text.split('\n')
    
    for line in lines:
        line = line.strip()
        # 查找编号的建议
        if line and (
            line.startswith(('1.', '2.', '3.', '4.', '5.', '-', '•', '·'))
            or '建议' in line
        ):
            # 清理编号
            cleaned = line.lstrip('0123456789.-•· ')
            if cleaned:
                suggestions.append(cleaned)
    
    return suggestions[:5]  # 最多返回5条


def extract_hands(text: str) -> list[str]:
    """
    从推荐文本中提取手牌列表
    
    Args:
        text: 推荐文本
    
    Returns:
        手牌列表
    """
    import re
    
    # 查找【手牌】标记
    match = re.search(r'【手牌】(.+?)(?:\n|$)', text)
    if match:
        hands_str = match.group(1)
        # 分割并清理
        hands = [h.strip() for h in hands_str.split(',')]
        return [h for h in hands if h]
    
    # 如果没有找到标记，尝试从文本中提取
    # 这里可以用更复杂的正则表达式
    pattern = r'\b([AKQJT2-9]{2}[so]?)\b'
    matches = re.findall(pattern, text)
    return list(set(matches))[:20]  # 去重并限制数量

