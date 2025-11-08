import { Range, StoredRange } from '../types';

const STORAGE_KEY = 'poker-ranges';

/**
 * 将Range转换为可存储的格式
 */
function rangeToStored(range: Range): StoredRange {
  return {
    ...range,
    hands: Array.from(range.hands)
  };
}

/**
 * 将存储的格式转换回Range
 */
function storedToRange(stored: StoredRange): Range {
  return {
    ...stored,
    hands: new Set(stored.hands)
  };
}

/**
 * 保存所有范围到本地存储
 */
export function saveRanges(ranges: Range[]): void {
  try {
    const storedRanges = ranges.map(rangeToStored);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedRanges));
  } catch (error) {
    console.error('保存范围失败:', error);
  }
}

/**
 * 从本地存储加载所有范围
 */
export function loadRanges(): Range[] | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    
    const storedRanges: StoredRange[] = JSON.parse(data);
    return storedRanges.map(storedToRange);
  } catch (error) {
    console.error('加载范围失败:', error);
    return null;
  }
}

/**
 * 清除所有自定义数据
 */
export function clearAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('清除数据失败:', error);
  }
}

/**
 * 导出范围为JSON文件
 */
export function exportRanges(ranges: Range[]): void {
  try {
    const storedRanges = ranges.map(rangeToStored);
    const dataStr = JSON.stringify(storedRanges, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `poker-ranges-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('导出失败:', error);
    throw new Error('导出失败');
  }
}

/**
 * 从JSON文件导入范围
 */
export function importRanges(file: File): Promise<Range[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const storedRanges: StoredRange[] = JSON.parse(content);
        
        // 验证数据格式
        if (!Array.isArray(storedRanges)) {
          throw new Error('无效的文件格式');
        }
        
        const ranges = storedRanges.map(storedToRange);
        resolve(ranges);
      } catch (error) {
        reject(new Error('请上传JSON格式的范围文件'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
    
    reader.readAsText(file);
  });
}

