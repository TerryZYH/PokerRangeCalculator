import React from 'react';
import { Hand, HandType } from '../types';
import { CheckSquare, Square, Layers } from 'lucide-react';

interface BatchOperationsProps {
  hands: Hand[];
  selectedHands: Set<string>;
  onSelectionChange: (selectedHands: Set<string>) => void;
}

export const BatchOperations: React.FC<BatchOperationsProps> = ({
  hands,
  selectedHands,
  onSelectionChange
}) => {
  // 选中所有手牌
  const selectAll = () => {
    const allHands = new Set(hands.map(h => h.name));
    onSelectionChange(allHands);
  };

  // 取消所有选择
  const deselectAll = () => {
    onSelectionChange(new Set());
  };

  // 按类型选择
  const selectByType = (type: HandType) => {
    const newSelected = new Set(selectedHands);
    hands.filter(h => h.type === type).forEach(h => newSelected.add(h.name));
    onSelectionChange(newSelected);
  };

  // 按类型取消选择
  const deselectByType = (type: HandType) => {
    const newSelected = new Set(selectedHands);
    hands.filter(h => h.type === type).forEach(h => newSelected.delete(h.name));
    onSelectionChange(newSelected);
  };

  // 反选
  const invertSelection = () => {
    const allHands = new Set(hands.map(h => h.name));
    const newSelected = new Set<string>();
    allHands.forEach(handName => {
      if (!selectedHands.has(handName)) {
        newSelected.add(handName);
      }
    });
    onSelectionChange(newSelected);
  };

  // 检查类型是否全部选中
  const isTypeFullySelected = (type: HandType): boolean => {
    const typeHands = hands.filter(h => h.type === type);
    return typeHands.every(h => selectedHands.has(h.name));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center gap-2 mb-4">
        <Layers size={20} className="text-gray-600" />
        <h3 className="text-lg font-bold text-gray-800">批量操作</h3>
      </div>

      <div className="space-y-3">
        {/* 全选/全不选 */}
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <CheckSquare size={16} />
            全选
          </button>
          <button
            onClick={deselectAll}
            className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <Square size={16} />
            清空
          </button>
        </div>

        {/* 反选 */}
        <button
          onClick={invertSelection}
          className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          反选
        </button>

        {/* 按类型选择 */}
        <div className="border-t pt-3 space-y-2">
          <div className="text-sm font-medium text-gray-700 mb-2">按类型操作</div>
          
          {/* 对子 */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">对子 (Pairs)</span>
            <div className="flex gap-1">
              {isTypeFullySelected('pair') ? (
                <button
                  onClick={() => deselectByType('pair')}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors text-xs"
                >
                  取消
                </button>
              ) : (
                <button
                  onClick={() => selectByType('pair')}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
                >
                  选择
                </button>
              )}
            </div>
          </div>

          {/* 同色 */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">同色 (Suited)</span>
            <div className="flex gap-1">
              {isTypeFullySelected('suited') ? (
                <button
                  onClick={() => deselectByType('suited')}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors text-xs"
                >
                  取消
                </button>
              ) : (
                <button
                  onClick={() => selectByType('suited')}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
                >
                  选择
                </button>
              )}
            </div>
          </div>

          {/* 不同色 */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">不同色 (Offsuit)</span>
            <div className="flex gap-1">
              {isTypeFullySelected('offsuit') ? (
                <button
                  onClick={() => deselectByType('offsuit')}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors text-xs"
                >
                  取消
                </button>
              ) : (
                <button
                  onClick={() => selectByType('offsuit')}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
                >
                  选择
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

