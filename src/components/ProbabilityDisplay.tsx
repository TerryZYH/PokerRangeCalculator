import React from 'react';
import { calculateProbability, calculateTotalCombinations, formatProbability } from '../utils/probability';
import { TOTAL_HAND_COMBINATIONS } from '../data/ranks';

interface ProbabilityDisplayProps {
  selectedHands: Set<string>;
}

export const ProbabilityDisplay: React.FC<ProbabilityDisplayProps> = ({ selectedHands }) => {
  const totalCombinations = calculateTotalCombinations(selectedHands);
  const probability = calculateProbability(selectedHands);
  const selectedCount = selectedHands.size;

  return (
    <div className="bg-gray-100 rounded-lg p-4 sm:p-6 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-around gap-4">
        {/* 已选手牌类型 */}
        <div className="text-center">
          <div className="text-gray-600 text-sm mb-1">已选手牌类型</div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-800">
            {selectedCount}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            / 169 种类型
          </div>
        </div>

        {/* 分隔线 */}
        <div className="hidden sm:block w-px h-12 bg-gray-300" />

        {/* 实际组合数 */}
        <div className="text-center">
          <div className="text-gray-600 text-sm mb-1">实际组合数</div>
          <div className="text-2xl sm:text-3xl font-bold text-purple-600">
            {totalCombinations}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            / {TOTAL_HAND_COMBINATIONS} 种组合
          </div>
        </div>

        {/* 分隔线 */}
        <div className="hidden sm:block w-px h-12 bg-gray-300" />

        {/* 出现概率 */}
        <div className="text-center">
          <div className="text-gray-600 text-sm mb-1">出现概率</div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">
            {formatProbability(probability)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            每100次约{Math.round(probability)}次
          </div>
        </div>
      </div>

      {/* 计算公式提示 */}
      <div className="mt-4 pt-4 border-t border-gray-300">
        <div className="text-xs text-gray-500 text-center">
          计算公式: {totalCombinations} ÷ {TOTAL_HAND_COMBINATIONS} × 100% ≈ {formatProbability(probability)}
        </div>
        <div className="text-xs text-gray-400 text-center mt-1">
          说明: 对子6种组合 · 同色4种组合 · 不同色12种组合
        </div>
      </div>
    </div>
  );
};

