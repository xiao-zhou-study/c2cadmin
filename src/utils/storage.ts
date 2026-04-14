// 增强的存储工具类
class Storage {
  private memoryCache = new Map<string, any>();
  private isLocalStorageAvailable = this.checkLocalStorageAvailability();
  private readonly MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly TOKEN_KEY = 'admin_token';

  private checkLocalStorageAvailability(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  get<T = any>(key: string, defaultValue: T = '' as T): T {
    try {
      // 优先从内存缓存读取
      if (this.memoryCache.has(key)) {
        return this.memoryCache.get(key);
      }
      
      if (!this.isLocalStorageAvailable) {
        return defaultValue;
      }
      
      const value = localStorage.getItem(key);
      if (value === null) return defaultValue;
      
      const parsed = JSON.parse(value);
      this.memoryCache.set(key, parsed);
      return parsed as T;
    } catch (error) {
      console.warn('Storage get error:', error);
      return defaultValue;
    }
  }
  
  set(key: string, value: any): void {
    try {
      // 更新内存缓存
      this.memoryCache.set(key, value);
      
      if (!this.isLocalStorageAvailable) {
        return;
      }
      
      // 检查存储空间
      const serialized = JSON.stringify(value);
      if (serialized.length > this.MAX_STORAGE_SIZE) {
        console.warn('Storage value too large, skipping localStorage');
        return;
      }
      
      localStorage.setItem(key, serialized);
      
      // 触发跨标签页同步
      this.broadcastStorageChange(key, value);
    } catch (error) {
      console.warn('Storage set error:', error);
      // 清理存储空间后重试
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.cleanupStorage();
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (retryError) {
          console.error('Storage retry failed:', retryError);
        }
      }
    }
  }
  
  remove(key: string): void {
    try {
      // 从内存缓存删除
      this.memoryCache.delete(key);
      
      if (!this.isLocalStorageAvailable) {
        return;
      }
      
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Storage remove error:', error);
    }
  }
  
  clear(): void {
    try {
      this.memoryCache.clear();
      
      if (!this.isLocalStorageAvailable) {
        return;
      }
      
      localStorage.clear();
    } catch (error) {
      console.warn('Storage clear error:', error);
    }
  }
  
  getToken(): string | null {
    return this.get(this.TOKEN_KEY, null);
  }
  
  setToken(token: string): void {
    this.set(this.TOKEN_KEY, token);
  }
  
  removeToken(): void {
    this.remove(this.TOKEN_KEY);
  }
  
  private cleanupStorage(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('draft_') || key.includes('temp_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log(`Cleaned up ${keysToRemove.length} storage items`);
    } catch (error) {
      console.warn('Storage cleanup failed:', error);
    }
  }
  
  // 跨标签页同步
  private broadcastStorageChange(key: string, value: any): void {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('storage_sync');
        channel.postMessage({ type: 'storage_change', key, value, timestamp: Date.now() });
        channel.close();
      }
    } catch (error) {
      console.warn('Broadcast channel not available:', error);
    }
  }
  
  // 监听跨标签页变化
  setupTabSync(): void {
    try {
      // 监听localStorage变化
      window.addEventListener('storage', (event) => {
        if (event.key && event.key !== null) {
          // 更新内存缓存
          if (event.newValue !== null) {
            const parsed = JSON.parse(event.newValue);
            this.memoryCache.set(event.key, parsed);
          } else {
            this.memoryCache.delete(event.key);
          }
        }
      });
      
      // 监听BroadcastChannel
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('storage_sync');
        channel.addEventListener('message', (event) => {
          if (event.data.type === 'storage_change') {
            this.memoryCache.set(event.data.key, event.data.value);
          }
        });
      }
    } catch (error) {
      console.warn('Tab sync setup failed:', error);
    }
  }
}

// 创建单例
const storage = new Storage();
storage.setupTabSync();

export { storage };
