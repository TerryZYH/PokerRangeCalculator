import React from 'react';
import { Hand } from '../types';

interface HandCellProps {
  hand: Hand;
  isSelected: boolean;
  isHovered: boolean;
  onMouseDown: () => void;
  onMouseEnter: () => void;
  onMouseUp: () => void;
  onTouchStart: () => void;
  onTouchMove: () => void;
  onTouchEnd: () => void;
}

export const HandCell: React.FC<HandCellProps> = ({
  hand,
  isSelected,
  isHovered,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  onTouchStart,
  onTouchMove,
  onTouchEnd
}) => {
  // 根据手牌类型设置背景色
  const getBaseColor = () => {
    if (hand.type === 'pair') return 'bg-gray-100';
    if (hand.type === 'suited') return 'bg-blue-50';
    return 'bg-green-50';
  };

  // 根据状态设置样式
  const getCellStyle = () => {
    const baseClasses = 'relative flex items-center justify-center text-xs sm:text-sm font-semibold border border-gray-300 cursor-pointer transition-colors select-none touch-manipulation';
    const sizeClasses = 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12';
    
    if (isSelected) {
      return `${baseClasses} ${sizeClasses} bg-blue-600 text-white border-blue-700`;
    }
    
    if (isHovered) {
      return `${baseClasses} ${sizeClasses} ${getBaseColor()} opacity-70 border-blue-400`;
    }
    
    return `${baseClasses} ${sizeClasses} ${getBaseColor()} text-gray-800 hover:opacity-80`;
  };

  return (
    <div
      className={getCellStyle()}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      data-hand={hand.name}
    >
      <span className="pointer-events-none">{hand.name}</span>
    </div>
  );
};

