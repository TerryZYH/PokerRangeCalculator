import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Hand } from '../types';
import { RANKS } from '../data/ranks';
import { HandCell } from './HandCell';

interface HandMatrixProps {
  hands: Hand[];
  selectedHands: Set<string>;
  onSelectionChange: (selectedHands: Set<string>) => void;
}

export const HandMatrix: React.FC<HandMatrixProps> = ({
  hands,
  selectedHands,
  onSelectionChange
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'select' | 'deselect'>('select');
  const [hoveredHand, setHoveredHand] = useState<string | null>(null);
  const matrixRef = useRef<HTMLDivElement>(null);

  // 切换手牌选中状态
  const toggleHand = useCallback((handName: string) => {
    const newSelected = new Set(selectedHands);
    if (newSelected.has(handName)) {
      newSelected.delete(handName);
    } else {
      newSelected.add(handName);
    }
    onSelectionChange(newSelected);
  }, [selectedHands, onSelectionChange]);

  // 设置手牌选中状态（用于拖动）
  const setHandSelected = useCallback((handName: string, selected: boolean) => {
    const newSelected = new Set(selectedHands);
    if (selected) {
      newSelected.add(handName);
    } else {
      newSelected.delete(handName);
    }
    onSelectionChange(newSelected);
  }, [selectedHands, onSelectionChange]);

  // 鼠标按下
  const handleMouseDown = useCallback((handName: string) => {
    setIsDragging(true);
    const isCurrentlySelected = selectedHands.has(handName);
    setDragMode(isCurrentlySelected ? 'deselect' : 'select');
    toggleHand(handName);
  }, [selectedHands, toggleHand]);

  // 鼠标进入
  const handleMouseEnter = useCallback((handName: string) => {
    setHoveredHand(handName);
    if (isDragging) {
      const shouldSelect = dragMode === 'select';
      const isCurrentlySelected = selectedHands.has(handName);
      if (shouldSelect !== isCurrentlySelected) {
        setHandSelected(handName, shouldSelect);
      }
    }
  }, [isDragging, dragMode, selectedHands, setHandSelected]);

  // 鼠标松开
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 触摸开始
  const handleTouchStart = useCallback((handName: string) => {
    setIsDragging(true);
    const isCurrentlySelected = selectedHands.has(handName);
    setDragMode(isCurrentlySelected ? 'deselect' : 'select');
    toggleHand(handName);
  }, [selectedHands, toggleHand]);

  // 触摸移动
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const handName = element?.getAttribute('data-hand');
    
    if (handName) {
      const shouldSelect = dragMode === 'select';
      const isCurrentlySelected = selectedHands.has(handName);
      if (shouldSelect !== isCurrentlySelected) {
        setHandSelected(handName, shouldSelect);
      }
    }
  }, [isDragging, dragMode, selectedHands, setHandSelected]);

  // 触摸结束
  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 全局鼠标松开事件
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchend', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);

  // 将hands数组转换为13x13矩阵
  const matrix: Hand[][] = [];
  for (let i = 0; i < RANKS.length; i++) {
    matrix[i] = [];
    for (let j = 0; j < RANKS.length; j++) {
      const hand = hands.find(h => h.i === i && h.j === j);
      if (hand) {
        matrix[i][j] = hand;
      }
    }
  }

  return (
    <div className="flex flex-col items-center overflow-x-auto pb-4">
      {/* 顶部标签行 */}
      <div className="flex mb-1">
        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" /> {/* 左上角空白 */}
        {RANKS.map(rank => (
          <div
            key={`top-${rank}`}
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center text-xs sm:text-sm font-bold text-gray-700"
          >
            {rank}
          </div>
        ))}
      </div>

      {/* 矩阵主体 */}
      <div ref={matrixRef} className="select-none">
        {matrix.map((row, i) => (
          <div key={i} className="flex">
            {/* 左侧标签列 */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center text-xs sm:text-sm font-bold text-gray-700">
              {RANKS[i]}
            </div>
            
            {/* 手牌单元格 */}
            {row.map((hand) => (
              <HandCell
                key={hand.name}
                hand={hand}
                isSelected={selectedHands.has(hand.name)}
                isHovered={hoveredHand === hand.name}
                onMouseDown={() => handleMouseDown(hand.name)}
                onMouseEnter={() => handleMouseEnter(hand.name)}
                onMouseUp={handleMouseUp}
                onTouchStart={() => handleTouchStart(hand.name)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />
            ))}
          </div>
        ))}
      </div>

      {/* 图例说明 */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs sm:text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-100 border border-gray-300" />
          <span>对子（Pairs）</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-50 border border-gray-300" />
          <span>同色（Suited）</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-50 border border-gray-300" />
          <span>不同色（Offsuit）</span>
        </div>
      </div>
    </div>
  );
};

