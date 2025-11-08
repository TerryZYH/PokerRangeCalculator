// 手牌类型
export type HandType = 'pair' | 'suited' | 'offsuit';

// 手牌接口
export interface Hand {
  i: number; // 行索引
  j: number; // 列索引
  name: string; // 手牌名称如 "AA", "AKs", "AKo"
  type: HandType; // 手牌类型
  selected: boolean; // 是否选中
}

// 范围接口
export interface Range {
  id: string;
  name: string;
  hands: Set<string>; // 存储选中的手牌名称
  isPreset: boolean; // 是否为预设范围
  isFavorite: boolean; // 是否收藏
  createdAt: number;
  updatedAt: number;
}

// 用于存储的范围接口（Set转换为数组）
export interface StoredRange {
  id: string;
  name: string;
  hands: string[];
  isPreset: boolean;
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

