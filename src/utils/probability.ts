import { TOTAL_HAND_COMBINATIONS } from '../data/ranks';

/**
 * 获取每种手牌类型的实际组合数
 * - 对子（如 AA）：C(4,2) = 6 种组合
 * - 同色（如 AKs）：4 种组合
 * - 不同色（如 AKo）：12 种组合
 */
export function getHandCombinations(handName: string): number {
  if (handName.length === 2) {
    // 对子（如 AA, KK）
    return 6;
  } else if (handName.endsWith('s')) {
    // 同色（如 AKs）
    return 4;
  } else if (handName.endsWith('o')) {
    // 不同色（如 AKo）
    return 12;
  }
  return 0;
}

/**
 * 计算选中手牌的实际组合数
 * @param selectedHands 选中的手牌名称集合
 * @returns 实际组合数
 */
export function calculateTotalCombinations(selectedHands: Set<string>): number {
  let total = 0;
  selectedHands.forEach(handName => {
    total += getHandCombinations(handName);
  });
  return total;
}

/**
 * 计算选中手牌的出现概率
 * @param selectedHands 选中的手牌名称集合
 * @returns 概率百分比（保留两位小数）
 */
export function calculateProbability(selectedHands: Set<string>): number {
  const totalCombinations = calculateTotalCombinations(selectedHands);
  if (totalCombinations === 0) return 0;
  return Number(((totalCombinations / TOTAL_HAND_COMBINATIONS) * 100).toFixed(2));
}

/**
 * 计算选中手牌数量（按组合数计算）
 * @param selectedCount 选中的手牌类型数量
 * @returns 概率百分比（保留两位小数）
 * @deprecated 使用 calculateProbability(selectedHands) 替代
 */
export function calculateProbabilityByCount(selectedCount: number): number {
  if (selectedCount === 0) return 0;
  return Number(((selectedCount / TOTAL_HAND_COMBINATIONS) * 100).toFixed(2));
}

/**
 * 格式化概率显示
 * @param probability 概率值
 * @returns 格式化的字符串
 */
export function formatProbability(probability: number): string {
  return `${probability}%`;
}

/**
 * 计算两个范围的交集、差集
 */
export function compareRanges(range1: Set<string>, range2: Set<string>) {
  const intersection = new Set<string>();
  const range1Only = new Set<string>();
  const range2Only = new Set<string>();
  
  // 计算交集和range1独有
  range1.forEach(hand => {
    if (range2.has(hand)) {
      intersection.add(hand);
    } else {
      range1Only.add(hand);
    }
  });
  
  // 计算range2独有
  range2.forEach(hand => {
    if (!range1.has(hand)) {
      range2Only.add(hand);
    }
  });
  
  return {
    intersection,
    range1Only,
    range2Only,
    intersectionCount: intersection.size,
    range1OnlyCount: range1Only.size,
    range2OnlyCount: range2Only.size,
    intersectionProbability: calculateProbability(intersection),
    range1OnlyProbability: calculateProbability(range1Only),
    range2OnlyProbability: calculateProbability(range2Only)
  };
}

