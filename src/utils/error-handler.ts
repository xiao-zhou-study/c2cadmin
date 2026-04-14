// 统一错误处理工具
export class ErrorHandler {
  private static errorCounts = new Map<string, number>();
  private static lastErrorTime = new Map<string, number>();
  private static readonly ERROR_SUPPRESSION_DURATION = 5000; // 5秒内相同错误不重复显示
  private static readonly MAX_ERROR_COUNT = 3;

  static handleTokenError(error: any): { shouldRedirect: boolean; message: string; shouldRetry: boolean } {
    const errorKey = this.getErrorKey(error);
    const now = Date.now();
    const lastTime = this.lastErrorTime.get(errorKey) || 0;
    
    // 防止错误消息轰炸
    if (now - lastTime < this.ERROR_SUPPRESSION_DURATION) {
      const count = this.errorCounts.get(errorKey) || 0;
      this.errorCounts.set(errorKey, count + 1);
      
      if (count > this.MAX_ERROR_COUNT) {
        return { shouldRedirect: false, message: '', shouldRetry: false };
      }
    } else {
      this.errorCounts.set(errorKey, 1);
    }
    
    this.lastErrorTime.set(errorKey, now);
    
    const errorMessage = this.getErrorMessage(error);
    const isTokenExpired = this.isTokenExpiredError(errorMessage);
    const isNetworkError = this.isNetworkError(error);
    
    return {
      shouldRedirect: isTokenExpired,
      message: errorMessage,
      shouldRetry: isNetworkError || !isTokenExpired
    };
  }
  
  static getErrorMessage(error: any): string {
    if (error?.response?.data?.msg) {
      return error.response.data.msg
    }
    if (error?.response?.data?.message) {
      return error.response.data.message
    }
    if (error?.message) {
      return error.message
    }
    return '请求失败'
  }
  
  static isTokenExpiredError(message: string): boolean {
    const expiredPatterns = [
      '登录超时',
      '无效的token',
      'token已过期',
      'expired',
      'invalid token',
      'unauthorized'
    ];
    
    return expiredPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );
  }
  
  static isNetworkError(error: any): boolean {
    return !error?.response && (
      error?.message?.includes('timeout') ||
      error?.message?.includes('network') ||
      error?.message?.includes('fetch')
    );
  }
  
  static handleHttpError(status: number, data?: any): string {
    switch (status) {
      case 400:
        return data?.msg || data?.message || '请求参数错误'
      case 401:
        return '登录已过期，请重新登录'
      case 403:
        return '没有权限访问该资源'
      case 404:
        return '请求的资源不存在'
      case 500:
        return '服务器内部错误'
      case 502:
      case 503:
      case 504:
        return '服务暂时不可用，请稍后重试'
      default:
        return data?.msg || data?.message || '请求失败'
    }
  }
  
  private static getErrorKey(error: any): string {
    return `${error?.response?.status || 'network'}_${error?.response?.data?.msg || error?.message || 'unknown'}`;
  }
}

// 指数退避重试管理器
export class RetryManager {
  private static readonly MAX_RETRIES = 3;
  private static readonly BASE_DELAY = 1000;

  static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === this.MAX_RETRIES) {
          console.error(`Operation failed after ${this.MAX_RETRIES} attempts:`, context, error);
          throw lastError;
        }
        
        const delay = this.calculateDelay(attempt);
        console.warn(`Operation failed (attempt ${attempt}/${this.MAX_RETRIES}), retrying in ${delay}ms:`, context);
        
        await this.sleep(delay);
      }
    }
    
    throw lastError!;
  }
  
  private static calculateDelay(attempt: number): number {
    // 指数退避 + 随机抖动
    const exponentialDelay = this.BASE_DELAY * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 0.1 * exponentialDelay;
    return exponentialDelay + jitter;
  }
  
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}