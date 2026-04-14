import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { login, logout, getUserInfo } from '@/api/auth'
import type { LoginForm, UserInfo } from '@/types'
import { storage } from '@/utils/storage'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(storage.getToken() || '')
  const userInfo = ref<UserInfo | null>(null)

  // 统一的刷新状态管理
  const isRefreshing = ref(false)
  const lastRefreshTime = ref(0)
  const refreshFailureCount = ref(0)

  // 记录当前标签页最近一次认证状态变更时间（登录 / 登出 / 刷新 token）
  const lastAuthChangeTime = ref<number>(Date.now())

  // 简化的请求队列管理
  const refreshRequestQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  }> = [];

  const markAuthChanged = () => {
    lastAuthChangeTime.value = Date.now();
  }

  // 清除token - 用于登录前清除旧token
  const clearToken = () => {
    token.value = ''
    storage.removeToken()
    markAuthChanged()
  }

  // 设置token（用于token刷新）- 提前定义以避免初始化错误
  const setToken = (newToken: string) => {
    token.value = newToken
    storage.setToken(newToken)
    markAuthChanged()
  }

  // 重置状态（用于token刷新失败）- 提前定义以避免初始化错误
  const resetState = () => {
    token.value = ''
    userInfo.value = null
    storage.removeToken()
    markAuthChanged()
  }

  // 简化的刷新策略 - 只在token即将过期时刷新
  const shouldRefreshToken = (tokenStr: string): boolean => {
    // 如果刚登录不久（1分钟内），不主动刷新
    if (Date.now() - lastRefreshTime.value < 60 * 1000) {
      return false;
    }

    const expireTime = getTokenExpireTime(tokenStr);
    if (!expireTime) return false;

    const timeUntilExpiry = expireTime - Date.now();
    // 提前2分钟刷新
    return timeUntilExpiry < 2 * 60 * 1000;
  };

  // 执行刷新的核心逻辑 - 使用独立的 axios 实例，避免循环调用
  const performRefresh = async (): Promise<string> => {
    console.log('管理端开始刷新token，当前token:', token.value.substring(0, 20) + '...');

    // 创建一个独立的 axios 实例，不使用请求拦截器，避免循环刷新
    // 本地开发：通过 Vite 反向代理走 /api
    // 生产环境：统一走 HTTPS API 域名（VITE_API_BASE_URL）
    const refreshAxios = axios.create({
      baseURL: import.meta.env.MODE === 'development'
        ? '/api'
        : import.meta.env.VITE_API_BASE_URL || 'https://api.zmwlovefmn.uk',
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Type': 'admin' // 必须添加此头，后端用于区分管理端
      },
      withCredentials: true // 允许携带 cookie（refresh token 在 cookie 中）
    });

    const newToken = await refreshAxios.get('/as/accounts/refresh') as any;

    // 后端返回的是纯 token 字符串，但经过统一响应格式处理，需要在 data 中获取
    const tokenData = newToken.data !== undefined ? newToken.data : newToken;

    if (!tokenData || typeof tokenData !== 'string') {
      console.error('管理端获取的token无效:', tokenData);
      throw new Error('获取的token无效');
    }

    console.log('管理端获取到新token:', tokenData.substring(0, 20) + '...');
    return tokenData;
  };

  // 处理刷新成功
  const handleRefreshSuccess = (newToken: string): void => {
    token.value = newToken;
    storage.setToken(newToken);
    lastRefreshTime.value = Date.now();

    console.log('管理端Token已更新到store:', token.value.substring(0, 20) + '...');

    // 解决所有等待的请求
    refreshRequestQueue.forEach(({ resolve }) => resolve(newToken));
    refreshRequestQueue.length = 0;
  };

  // 处理刷新失败
  const handleRefreshFailure = async (error: Error): Promise<void> => {
    console.error('管理端刷新token失败:', error);

    // 拒绝所有等待的请求
    refreshRequestQueue.forEach(({ reject }) => reject(error));
    refreshRequestQueue.length = 0;
  };

  // 解析 JWT token 的过期时间
  const getTokenExpireTime = (token: string): number | null => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Invalid JWT token structure');
        return null;
      }
      
      const payload = JSON.parse(atob(parts[1]));
      if (!payload || typeof payload.exp !== 'number') {
        console.error('Invalid JWT payload or missing exp field');
        return null;
      }
      
      return payload.exp * 1000;
    } catch (error) {
      console.error('Failed to parse JWT token:', error);
      return null;
    }
  };

  // 判断 token 是否已过期
  const isTokenExpired = (token: string): boolean => {
    const expireTime = getTokenExpireTime(token);
    if (!expireTime) return true;
    return expireTime < Date.now();
  };

  // 判断 token 是否即将过期（提前2分钟刷新）
  const isTokenExpiringSoon = (token: string): boolean => {
    const expireTime = getTokenExpireTime(token);
    if (!expireTime) return false;
    // 提前2分钟（120000ms）刷新
    return expireTime - Date.now() < 2 * 60 * 1000;
  };

  const isLoggedIn = computed(() => !!token.value && !isTokenExpired(token.value))
  const userName = computed(() => userInfo.value?.username || '管理员')
  const avatar = computed(() => userInfo.value?.avatarUrl || '')

  // 登录
  async function loginAction(loginForm: LoginForm) {
    const res = await login(loginForm)
    token.value = res
    storage.setToken(res)
    lastRefreshTime.value = Date.now() // 设置最后刷新时间，避免登录后立即触发刷新
    markAuthChanged()

    return { token: res }
  }

  // 获取用户信息
  async function getUserInfoAction() {
    const res = await getUserInfo()
    userInfo.value = res
    return res
  }

  // 主动刷新token - 简化版本
  const refreshTokenAction = async (autoRedirect = true): Promise<string> => {
    // 如果已经在刷新中，加入队列等待
    if (isRefreshing.value) {
      console.log('管理端Token正在刷新中，等待结果...');
      return new Promise((resolve, reject) => {
        refreshRequestQueue.push({ resolve, reject });

        // 设置超时保护，防止一直卡住
        setTimeout(() => {
          // 从队列中移除这个请求
          const index = refreshRequestQueue.findIndex(
            req => req.resolve === resolve && req.reject === reject
          );
          if (index !== -1) {
            refreshRequestQueue.splice(index, 1);
            reject(new Error('Token刷新超时'));
          }
        }, 10000); // 10秒超时
      });
    }

    isRefreshing.value = true;

    // 设置超时保护
    const timeoutTimer = setTimeout(() => {
      console.error('管理端Token刷新超时，重置状态');
      isRefreshing.value = false;

      // 拒绝所有等待的请求
      refreshRequestQueue.forEach(({ reject }) => reject(new Error('Token刷新超时')));
      refreshRequestQueue.length = 0;
    }, 15000); // 15秒超时

    try {
      const newToken = await performRefresh();
      clearTimeout(timeoutTimer);
      handleRefreshSuccess(newToken);
      markAuthChanged();
      refreshFailureCount.value = 0;

      return newToken;
    } catch (error) {
      clearTimeout(timeoutTimer);
      refreshFailureCount.value++;
      await handleRefreshFailure(error as Error);

      // 失败次数过多时重置状态
      if (refreshFailureCount.value >= 3) {
        resetState();
        if (autoRedirect) {
          router.push('/login');
        }
      }

      throw error;
    } finally {
      isRefreshing.value = false;
    }
  };

  // 登出
  async function logoutAction() {
    try {
      await logout()
    } finally {
      resetState()
    }
  }

  return {
    // 状态
    token,
    userInfo,
    isRefreshing,
    refreshFailureCount,
    lastAuthChangeTime,
    // 计算属性
    isLoggedIn,
    userName,
    avatar,
    // 方法
    loginAction,
    getUserInfoAction,
    logoutAction,
    setToken,
    clearToken,
    resetState,
    refreshTokenAction,
    // 辅助函数
    isTokenExpired,
    isTokenExpiringSoon,
    shouldRefreshToken,
    // 队列（供响应拦截器使用）
    refreshRequestQueue
  };
})

