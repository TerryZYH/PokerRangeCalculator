import { Hand, HandType } from '../types';
import { RANKS } from '../data/ranks';

/**
 * 生成13x13手牌矩阵
 */
export function generateHandMatrix(): Hand[] {
  const hands: Hand[] = [];

  for (let i = 0; i < RANKS.length; i++) {
    for (let j = 0; j < RANKS.length; j++) {
      let name: string;
      let type: HandType;

      if (i === j) {
        // 对角线：对子
        name = `${RANKS[i]}${RANKS[j]}`;
        type = 'pair';
      } else if (i < j) {
        // 右上三角：同色（suited）
        name = `${RANKS[i]}${RANKS[j]}s`;
        type = 'suited';
      } else {
        // 左下三角：不同色（offsuit）
        name = `${RANKS[j]}${RANKS[i]}o`;
        type = 'offsuit';
      }

      hands.push({
        i,
        j,
        name,
        type,
        selected: false
      });
    }
  }

  return hands;
}

/**
 * 根据手牌名称查找手牌
 */
export function findHandByName(hands: Hand[], name: string): Hand | undefined {
  return hands.find(h => h.name === name);
}

/**
 * 获取指定范围的所有手牌名称
 */
export function getHandNamesInRange(startRank: string, endRank: string, type?: HandType): string[] {
  const startIdx = RANKS.indexOf(startRank);
  const endIdx = RANKS.indexOf(endRank);
  
  if (startIdx === -1 || endIdx === -1 || startIdx > endIdx) {
    return [];
  }

  const hands: string[] = [];
  
  for (let i = startIdx; i <= endIdx; i++) {
    for (let j = startIdx; j <= endIdx; j++) {
      if (i === j && (!type || type === 'pair')) {
        hands.push(`${RANKS[i]}${RANKS[j]}`);
      } else if (i < j && (!type || type === 'suited')) {
        hands.push(`${RANKS[i]}${RANKS[j]}s`);
      } else if (i > j && (!type || type === 'offsuit')) {
        hands.push(`${RANKS[j]}${RANKS[i]}o`);
      }
    }
  }
  
  return hands;
}

