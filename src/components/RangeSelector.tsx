import React, { useState } from 'react';
import { Range } from '../types';
import { Star, Plus, Trash2, Edit2, Download, Upload, RotateCcw } from 'lucide-react';
import { calculateTotalCombinations } from '../utils/probability';

interface RangeSelectorProps {
  ranges: Range[];
  currentRangeId: string | null;
  onRangeSelect: (rangeId: string) => void;
  onRangeCreate: (name: string) => void;
  onRangeDelete: (rangeId: string) => void;
  onRangeRename: (rangeId: string, newName: string) => void;
  onRangeFavorite: (rangeId: string) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onResetPresets: () => void;
}

export const RangeSelector: React.FC<RangeSelectorProps> = ({
  ranges,
  currentRangeId,
  onRangeSelect,
  onRangeCreate,
  onRangeDelete,
  onRangeRename,
  onRangeFavorite,
  onExport,
  onImport,
  onResetPresets
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRangeName, setNewRangeName] = useState('');
  const [editingRangeId, setEditingRangeId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState('');

  // 排序范围：收藏的在前，然后按创建时间
  const sortedRanges = [...ranges].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return b.createdAt - a.createdAt;
  });

  // 创建新范围
  const handleCreate = () => {
    const trimmedName = newRangeName.trim();
    
    if (!trimmedName) {
      setError('请输入范围名称');
      return;
    }

    if (ranges.some(r => r.name === trimmedName)) {
      setError('名称已存在');
      return;
    }

    onRangeCreate(trimmedName);
    setNewRangeName('');
    setError('');
    setShowCreateModal(false);
  };

  // 重命名范围
  const handleRename = (rangeId: string) => {
    const trimmedName = editingName.trim();
    
    if (!trimmedName) {
      setError('请输入范围名称');
      return;
    }

    if (ranges.some(r => r.id !== rangeId && r.name === trimmedName)) {
      setError('名称已存在');
      return;
    }

    onRangeRename(rangeId, trimmedName);
    setEditingRangeId(null);
    setEditingName('');
    setError('');
  };

  // 开始编辑
  const startEdit = (range: Range) => {
    setEditingRangeId(range.id);
    setEditingName(range.name);
    setError('');
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingRangeId(null);
    setEditingName('');
    setError('');
  };

  // 处理文件导入
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = ''; // 重置input
    }
  };

  // 处理重置预设范围
  const handleResetPresets = () => {
    if (window.confirm('确定要重置所有预设范围吗？\n\n这将恢复所有预设范围到初始状态。\n自定义范围不会受到影响。')) {
      onResetPresets();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">范围管理</h2>
        <div className="flex gap-2">
          {/* 创建新范围 */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors group relative"
            aria-label="创建新范围"
          >
            <Plus size={20} />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              创建新范围
            </span>
          </button>
          
          {/* 重置预设范围 */}
          <button
            onClick={handleResetPresets}
            className="p-2 text-orange-600 hover:bg-orange-50 rounded transition-colors group relative"
            aria-label="重置预设范围"
          >
            <RotateCcw size={20} />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              重置预设范围
            </span>
          </button>
          
          {/* 导出范围 */}
          <button
            onClick={onExport}
            className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors group relative"
            aria-label="导出范围"
          >
            <Upload size={20} />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              导出范围
            </span>
          </button>
          
          {/* 导入范围 */}
          <label 
            className="p-2 text-purple-600 hover:bg-purple-50 rounded transition-colors cursor-pointer group relative" 
            aria-label="导入范围"
          >
            <Download size={20} />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              导入范围
            </span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 范围列表 */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {sortedRanges.map(range => (
          <div
            key={range.id}
            className={`p-3 rounded-lg border-2 transition-all ${
              currentRangeId === range.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {editingRangeId === range.id ? (
              // 编辑模式
              <div className="space-y-2">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                  placeholder="输入范围名称"
                  autoFocus
                />
                {error && <div className="text-xs text-red-500">{error}</div>}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRename(range.id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    保存
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              // 显示模式
              <div className="flex items-center justify-between">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => onRangeSelect(range.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">
                      {range.name}
                    </span>
                    {range.isPreset && (
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
                        预设
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {range.hands.size} 种类型 · {calculateTotalCombinations(range.hands)} 组合 · {((calculateTotalCombinations(range.hands) / 1326) * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onRangeFavorite(range.id)}
                    className={`p-1.5 rounded transition-colors ${
                      range.isFavorite
                        ? 'text-yellow-500 hover:bg-yellow-50'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={range.isFavorite ? '取消收藏' : '收藏'}
                  >
                    <Star size={16} fill={range.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  
                  {!range.isPreset && (
                    <>
                      <button
                        onClick={() => startEdit(range)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="重命名"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('确定要删除这个范围吗？')) {
                            onRangeDelete(range.id);
                          }
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="删除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 创建范围模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">创建新范围</h3>
            <input
              type="text"
              value={newRangeName}
              onChange={(e) => setNewRangeName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
              placeholder="输入范围名称"
              autoFocus
            />
            {error && <div className="text-sm text-red-500 mb-4">{error}</div>}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewRangeName('');
                  setError('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

