import React, { useState, useEffect, useCallback } from 'react';
import { Range } from './types';
import { generateHandMatrix } from './utils/handGenerator';
import { createPresetRanges } from './data/presetRanges';
import { saveRanges, loadRanges, exportRanges, importRanges, clearAllData } from './utils/storage';
import { HandMatrix } from './components/HandMatrix';
import { ProbabilityDisplay } from './components/ProbabilityDisplay';
import { RangeSelector } from './components/RangeSelector';
import { BatchOperations } from './components/BatchOperations';
import { AIChat } from './components/AIChat';
import { AlertCircle, Info, X } from 'lucide-react';

function App() {
  const [hands] = useState(() => generateHandMatrix());
  const [ranges, setRanges] = useState<Range[]>([]);
  const [currentRangeId, setCurrentRangeId] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 初始化：加载预设范围和用户数据
  useEffect(() => {
    const loadedRanges = loadRanges();
    
    if (loadedRanges && loadedRanges.length > 0) {
      setRanges(loadedRanges);
      // 选择第一个范围
      const firstRange = loadedRanges.find(r => r.isFavorite) || loadedRanges[0];
      setCurrentRangeId(firstRange.id);
      setShowWelcome(false);
    } else {
      // 首次使用，加载预设范围
      const presetRanges = createPresetRanges();
      setRanges(presetRanges);
      setCurrentRangeId(presetRanges[0].id);
    }
  }, []);

  // 保存到本地存储
  useEffect(() => {
    if (ranges.length > 0) {
      saveRanges(ranges);
    }
  }, [ranges]);

  // 获取当前范围
  const currentRange = ranges.find(r => r.id === currentRangeId);

  // 显示通知
  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // 选择范围
  const handleRangeSelect = useCallback((rangeId: string) => {
    setCurrentRangeId(rangeId);
  }, []);

  // 创建新范围
  const handleRangeCreate = useCallback((name: string) => {
    const newRange: Range = {
      id: `custom-${Date.now()}`,
      name,
      hands: new Set(),
      isPreset: false,
      isFavorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setRanges(prev => [...prev, newRange]);
    setCurrentRangeId(newRange.id);
    showNotification('success', '范围创建成功');
  }, [showNotification]);

  // 删除范围
  const handleRangeDelete = useCallback((rangeId: string) => {
    setRanges(prev => prev.filter(r => r.id !== rangeId));
    if (currentRangeId === rangeId) {
      const remaining = ranges.filter(r => r.id !== rangeId);
      setCurrentRangeId(remaining.length > 0 ? remaining[0].id : null);
    }
    showNotification('success', '范围已删除');
  }, [currentRangeId, ranges, showNotification]);

  // 重命名范围
  const handleRangeRename = useCallback((rangeId: string, newName: string) => {
    setRanges(prev => prev.map(r => 
      r.id === rangeId 
        ? { ...r, name: newName, updatedAt: Date.now() }
        : r
    ));
    showNotification('success', '范围已重命名');
  }, [showNotification]);

  // 切换收藏
  const handleRangeFavorite = useCallback((rangeId: string) => {
    setRanges(prev => prev.map(r => 
      r.id === rangeId 
        ? { ...r, isFavorite: !r.isFavorite, updatedAt: Date.now() }
        : r
    ));
  }, []);

  // 更新手牌选择
  const handleSelectionChange = useCallback((selectedHands: Set<string>) => {
    if (!currentRangeId) return;

    setRanges(prev => prev.map(r => 
      r.id === currentRangeId 
        ? { ...r, hands: selectedHands, updatedAt: Date.now() }
        : r
    ));
  }, [currentRangeId]);

  // 导出范围
  const handleExport = useCallback(() => {
    try {
      exportRanges(ranges);
      showNotification('success', '导出成功');
    } catch (error) {
      showNotification('error', '导出失败');
    }
  }, [ranges, showNotification]);

  // 导入范围
  const handleImport = useCallback(async (file: File) => {
    try {
      const importedRanges = await importRanges(file);
      // 合并导入的范围（避免ID冲突）
      const newRanges = importedRanges.map(r => ({
        ...r,
        id: `imported-${Date.now()}-${Math.random()}`,
        isPreset: false
      }));
      setRanges(prev => [...prev, ...newRanges]);
      showNotification('success', `成功导入 ${newRanges.length} 个范围`);
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : '导入失败');
    }
  }, [showNotification]);

  // 重置预设范围
  const handleResetPresets = useCallback(() => {
    // 保留自定义范围和收藏状态
    const customRanges = ranges.filter(r => !r.isPreset);
    const presetFavorites = ranges.filter(r => r.isPreset && r.isFavorite).map(r => r.id);
    
    // 创建新的预设范围
    const newPresets = createPresetRanges();
    
    // 恢复预设范围的收藏状态
    newPresets.forEach(preset => {
      if (presetFavorites.includes(preset.id)) {
        preset.isFavorite = true;
      }
    });
    
    // 合并自定义范围和新的预设范围
    setRanges([...newPresets, ...customRanges]);
    
    // 如果当前选中的是预设范围，切换到重置后的对应范围
    if (currentRangeId && currentRangeId.startsWith('preset-')) {
      const resetPreset = newPresets.find(r => r.id === currentRangeId);
      if (resetPreset) {
        setCurrentRangeId(resetPreset.id);
      }
    }
    
    showNotification('success', '预设范围已重置');
  }, [ranges, currentRangeId, showNotification]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl sm:text-3xl font-bold">德州扑克手牌范围计算器</h1>
          <p className="text-blue-100 text-sm mt-1">快速管理手牌范围，实时计算出现概率</p>
        </div>
      </header>

      {/* 欢迎提示 */}
      {showWelcome && (
        <div className="container mx-auto px-4 mt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">欢迎使用德州扑克手牌范围计算器！</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 点击或滑动选择手牌组合</li>
                <li>• 实时查看所选范围的出现概率</li>
                <li>• 使用预设范围或创建自定义范围</li>
                <li>• 支持收藏常用范围，导入导出备份</li>
              </ul>
            </div>
            <button
              onClick={() => setShowWelcome(false)}
              className="text-blue-600 hover:text-blue-800 flex-shrink-0"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* 通知提示 */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 animate-fade-in">
          <div className={`rounded-lg p-4 shadow-lg flex items-center gap-3 ${
            notification.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <AlertCircle 
              className={notification.type === 'success' ? 'text-green-600' : 'text-red-600'} 
              size={20} 
            />
            <span className={`text-sm font-medium ${
              notification.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {notification.message}
            </span>
          </div>
        </div>
      )}

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧：范围管理和批量操作 */}
          <div className="lg:col-span-3 space-y-6">
            <RangeSelector
              ranges={ranges}
              currentRangeId={currentRangeId}
              onRangeSelect={handleRangeSelect}
              onRangeCreate={handleRangeCreate}
              onRangeDelete={handleRangeDelete}
              onRangeRename={handleRangeRename}
              onRangeFavorite={handleRangeFavorite}
              onExport={handleExport}
              onImport={handleImport}
              onResetPresets={handleResetPresets}
            />
            
            {currentRange && (
              <BatchOperations
                hands={hands}
                selectedHands={currentRange.hands}
                onSelectionChange={handleSelectionChange}
              />
            )}
          </div>

          {/* 中间和右侧：矩阵和概率显示 */}
          <div className="lg:col-span-9 space-y-6">
            {/* 当前范围信息 */}
            {currentRange && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {currentRange.name}
                </h2>
              </div>
            )}

            {/* 概率显示 */}
            {currentRange && (
              <ProbabilityDisplay selectedHands={currentRange.hands} />
            )}

            {/* 手牌矩阵 */}
            {currentRange && (
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <HandMatrix
                  hands={hands}
                  selectedHands={currentRange.hands}
                  onSelectionChange={handleSelectionChange}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-800 text-gray-300 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm">
            <p>德州扑克手牌范围计算器 · 数据本地存储，隐私安全</p>
            <p className="mt-2 text-gray-400">
              总手牌组合：1326 · 支持预设范围与自定义范围管理
            </p>
          </div>
        </div>
      </footer>

      {/* AI 聊天助手 */}
      <AIChat currentRange={currentRange} />
    </div>
  );
}

export default App;

