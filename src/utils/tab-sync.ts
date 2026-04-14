// 多标签页同步管理器
export class TabSyncManager {
  private channel: BroadcastChannel | null = null;
  private userStore: any = null;
  
  constructor() {
    this.initChannel();
    this.setupStorageListener();
  }
  
  setUserStore(store: any): void {
    this.userStore = store;
  }
  
  private initChannel(): void {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.channel = new BroadcastChannel('auth_sync');
        this.channel.addEventListener('message', this.handleMessage.bind(this));
      }
    } catch (error) {
      console.warn('BroadcastChannel not available:', error);
    }
  }
  
  private handleMessage(event: MessageEvent): void {
    const { type, data } = event.data || {};
    const timestamp = data?.timestamp as number | undefined;
    
    switch (type) {
      case 'token_refreshed':
        this.handleTokenRefreshed(data.token, timestamp);
        break;
      case 'user_logout':
        this.handleUserLogout(timestamp);
        break;
      case 'token_expired':
        this.handleTokenExpired(timestamp);
        break;
    }
  }

  /**
   * 判断当前标签页是否需要处理这条广播消息
   * 只有当广播的时间戳不早于本地最近一次鉴权变更时间时才处理，
   * 否则认为是“过期的旧广播”，直接忽略。
   */
  private shouldHandleMessage(timestamp?: number): boolean {
    if (!timestamp) {
      // 兼容旧数据，没有时间戳则默认处理
      return true;
    }
    if (!this.userStore || !this.userStore.lastAuthChangeTime) {
      return true;
    }

    const localTimeSource = this.userStore.lastAuthChangeTime;
    const localTime = typeof localTimeSource === 'number'
      ? localTimeSource
      : localTimeSource.value ?? 0;

    return timestamp >= localTime;
  }
  
  private handleTokenRefreshed(token: string, timestamp?: number): void {
    if (!this.shouldHandleMessage(timestamp)) {
      console.log('Admin token refresh message ignored as stale');
      return;
    }

    if (this.userStore && token !== this.userStore.token) {
      this.userStore.setToken(token);
      console.log('Admin token synced from other tab');
    }
  }
  
  private handleUserLogout(timestamp?: number): void {
    if (!this.shouldHandleMessage(timestamp)) {
      console.log('Admin logout message ignored as stale');
      return;
    }

    if (this.userStore && this.userStore.isLoggedIn) {
      this.userStore.logoutAction();
      console.log('Admin logout synced from other tab');
    }
  }
  
  private handleTokenExpired(timestamp?: number): void {
    if (!this.shouldHandleMessage(timestamp)) {
      console.log('Admin token expired message ignored as stale');
      return;
    }

    if (this.userStore && this.userStore.isLoggedIn) {
      this.userStore.resetState();
      console.log('Admin token expired synced from other tab');
    }
  }
  
  broadcastTokenRefresh(token: string): void {
    if (this.channel) {
      this.channel.postMessage({
        type: 'token_refreshed',
        data: { token, timestamp: Date.now() }
      });
    }
  }
  
  broadcastLogout(): void {
    if (this.channel) {
      this.channel.postMessage({
        type: 'user_logout',
        data: { timestamp: Date.now() }
      });
    }
  }
  
  broadcastTokenExpired(): void {
    if (this.channel) {
      this.channel.postMessage({
        type: 'token_expired',
        data: { timestamp: Date.now() }
      });
    }
  }
  
  private setupStorageListener(): void {
    try {
      window.addEventListener('storage', (event) => {
        if (event.key === 'admin_auth_token_changed') {
          if (this.userStore) {
            this.userStore.setToken(event.newValue);
          }
        }
      });
    } catch (error) {
      console.warn('Storage listener setup failed:', error);
    }
  }
}

// 活动监控管理器
export class ActivityMonitor {
  private inactivityTimer: NodeJS.Timeout | null = null;
  private readonly INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30分钟
  private userStore: any = null;
  private isActive = true;
  
  constructor() {
    this.setupEventListeners();
  }
  
  setUserStore(store: any): void {
    this.userStore = store;
  }
  
  start(): void {
    this.isActive = true;
    this.resetTimer();
  }
  
  stop(): void {
    this.isActive = false;
    this.clearTimer();
    this.removeEventListeners();
  }
  
  private resetTimer(): void {
    if (!this.isActive) return;
    
    this.clearTimer();
    this.inactivityTimer = setTimeout(() => {
      this.handleInactivity();
    }, this.INACTIVITY_TIMEOUT);
  }
  
  private clearTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }
  
  private handleInactivity(): void {
    if (this.userStore && this.userStore.isLoggedIn) {
      console.log('Admin user inactive, logging out...');
      this.userStore.logoutAction();
      // 跳转到登录页面
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }
  
  private boundHandleActivity: (() => void) | null = null;
  
  private setupEventListeners(): void {
    const events: string[] = [
      'mousedown', 'mousemove', 'keypress', 'scroll',
      'touchstart', 'click', 'keydown'
    ];

    // 确保绑定的函数引用一致
    this.boundHandleActivity = this.handleActivity.bind(this);

    events.forEach(event => {
      document.addEventListener(event, this.boundHandleActivity!, true);
    });
  }
  
  private removeEventListeners(): void {
    const events: string[] = [
      'mousedown', 'mousemove', 'keypress', 'scroll',
      'touchstart', 'click', 'keydown'
    ];

    const handler = this.boundHandleActivity;
    if (handler) {
      events.forEach(event => {
        document.removeEventListener(event, handler, true);
      });
      this.boundHandleActivity = null;
    }
  }
  
  private handleActivity(): void {
    this.resetTimer();
  }
}

// 创建全局实例
export const tabSyncManager = new TabSyncManager();
export const activityMonitor = new ActivityMonitor();