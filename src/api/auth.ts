import { request } from '@/utils/request'
import type { LoginForm, UserInfo } from '@/types'

// 管理员登录
export function login(data: LoginForm): Promise<string> {
  return request.post('/as/accounts/admin/login', data)
}

// 退出登录
export function logout(): Promise<void> {
  return request.post('/as/accounts/logout')
}

// 获取当前用户信息
export function getUserInfo(): Promise<UserInfo> {
  return request.get('/us/users/current')
}

// 刷新token
export function refreshToken(): Promise<string> {
  return request.get('/as/accounts/refresh')
}

