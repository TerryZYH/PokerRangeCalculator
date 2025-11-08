/**
 * API 服务
 * 与后端进行通信
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ChatRequest {
  message: string;
  conversation_id?: string;
  range_context?: {
    name: string;
    hands: string[];
    probability: number;
  };
}

export interface ChatResponse {
  reply: string;
  conversation_id: string;
  timestamp: string;
}

export interface RangeAnalysisRequest {
  range_name: string;
  hands: string[];
  position?: string;
  scenario?: string;
}

export interface RangeAnalysisResponse {
  analysis: string;
  suggestions: string[];
  probability: number;
  total_combinations: number;
}

export interface RangeRecommendationRequest {
  position: string;
  scenario: string;
  opponent_style?: string;
  stack_depth?: string;
}

export interface RangeRecommendationResponse {
  recommended_hands: string[];
  explanation: string;
  probability: number;
}

export interface HealthResponse {
  status: string;
  ai_enabled: boolean;
  ai_provider: string | null;
  version: string;
}

class APIService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<HealthResponse> {
    const response = await fetch(`${this.baseURL}/health`);
    if (!response.ok) {
      throw new Error('健康检查失败');
    }
    return response.json();
  }

  /**
   * 聊天对话（非流式）
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.baseURL}/chat/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '聊天请求失败');
    }

    return response.json();
  }

  /**
   * 聊天对话（流式）
   */
  async *chatStream(request: ChatRequest): AsyncGenerator<{
    type: 'conversation_id' | 'content' | 'done' | 'error';
    conversation_id?: string;
    content?: string;
    timestamp?: string;
    error?: string;
  }> {
    const response = await fetch(`${this.baseURL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('流式聊天请求失败');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取响应流');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data.trim()) {
              try {
                const parsed = JSON.parse(data);
                yield parsed;
              } catch (e) {
                console.error('解析 SSE 数据失败:', e);
              }
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * 分析手牌范围
   */
  async analyzeRange(request: RangeAnalysisRequest): Promise<RangeAnalysisResponse> {
    const response = await fetch(`${this.baseURL}/range/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '范围分析失败');
    }

    return response.json();
  }

  /**
   * 推荐手牌范围
   */
  async recommendRange(request: RangeRecommendationRequest): Promise<RangeRecommendationResponse> {
    const response = await fetch(`${this.baseURL}/range/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '范围推荐失败');
    }

    return response.json();
  }

  /**
   * 清除对话历史
   */
  async clearConversation(conversationId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/chat/${conversationId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('清除对话失败');
    }
  }

  /**
   * 获取对话历史
   */
  async getConversationHistory(conversationId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/chat/history/${conversationId}`);

    if (!response.ok) {
      throw new Error('获取对话历史失败');
    }

    return response.json();
  }
}

export const apiService = new APIService();

