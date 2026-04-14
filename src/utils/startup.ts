// 管理端页面启动验证工具
import { useUserStore } from '@/stores/user';
import router from '@/router';

// 应用启动时验证token状态
export const validateAuthOnStartup = async (): Promise<void> => {
  const userStore = useUserStore();
  
  // 启动活动监控
  if (typeof window !== 'undefined') {
    import('@/utils/tab-sync').then(({ activityMonitor }) => {
      activityMonitor.start();
    });
  }
  
  // 验证token状态
  if (userStore.token) {
    try {
      // 检查token是否已过期
      if (userStore.isTokenExpired(userStore.token)) {
        console.log('Admin token expired during startup, attempting refresh...');
        
        try {
          await userStore.refreshTokenAction(false);
          console.log('Admin token refreshed successfully on startup');
        } catch (error) {
          console.error('Admin token refresh failed on startup:', error);
          userStore.resetState();
          router.push('/login');
          return;
        }
      }
      
      // 获取管理员用户信息
      if (!userStore.userInfo) {
        try {
          await userStore.getUserInfoAction();
          console.log('Admin user info fetched on startup');
        } catch (error) {
          console.warn('Failed to fetch admin user info on startup:', error);
          // 不阻止应用启动，仅记录警告
        }
      }
    } catch (error) {
      console.error('Admin startup validation failed:', error);
      userStore.resetState();
      router.push('/login');
    }
  }
};

// 页面卸载时清理
export const cleanupOnPageUnload = (): void => {
  if (typeof window !== 'undefined') {
    import('@/utils/tab-sync').then(({ activityMonitor }) => {
      activityMonitor.stop();
    });
  }
};

// 监听页面可见性变化
export const handleVisibilityChange = (): void => {
  if (typeof document === 'undefined') return;
  
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
      const userStore = useUserStore();
      
      // 页面重新可见时验证token状态
      if (userStore.token && userStore.isTokenExpired(userStore.token)) {
        try {
          await userStore.refreshTokenAction(false);
          console.log('Admin token refreshed on page visibility change');
        } catch (error) {
          console.error('Admin token refresh failed on visibility change:', error);
        }
      }
    }
  });
};

// 网络状态监控
export const monitorNetworkStatus = (): void => {
  if (typeof window === 'undefined') return;
  
  window.addEventListener('online', async () => {
    console.log('Network restored, validating admin auth...');
    const userStore = useUserStore();
    
    if (userStore.token && userStore.isTokenExpired(userStore.token)) {
      try {
        await userStore.refreshTokenAction(false);
        console.log('Admin token refreshed on network restore');
      } catch (error) {
        console.error('Admin token refresh failed on network restore:', error);
      }
    }
  });
};