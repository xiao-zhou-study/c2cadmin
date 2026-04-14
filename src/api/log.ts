import request from '@/utils/request'
import type { OperationLog, LoginLog, PageQuery, PageResult } from '@/types'

// 获取操作日志分页列表
export function getOperationLogPage(params: PageQuery & { 
  userId?: number
  operation?: string
  method?: string
  status?: number
  startTime?: number
  endTime?: number
}) {
  return request<PageResult<OperationLog>>({
    url: '/ls/operations/page',
    method: 'get',
    params
  })
}

// 获取操作日志详情
export function getOperationLog(id: string) {
  return request<OperationLog>({
    url: `/ls/operations/${id}`,
    method: 'get'
  })
}

// 删除操作日志
export function deleteOperationLog(id: string) {
  return request<boolean>({
    url: `/ls/operations/${id}`,
    method: 'delete'
  })
}

// 批量删除操作日志
export function batchDeleteOperationLog(ids: string[]) {
  return request<boolean>({
    url: '/ls/operations/batch',
    method: 'delete',
    data: { ids }
  })
}

// 清空操作日志
export function clearOperationLog() {
  return request<boolean>({
    url: '/ls/operations/clear',
    method: 'delete'
  })
}

// 导出操作日志
export function exportOperationLog(params?: any) {
  return request<Blob>({
    url: '/ls/operations/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 获取登录日志分页列表
export function getLoginLogPage(params: PageQuery & { 
  userId?: string
  username?: string
  ip?: string
  status?: number
  startTime?: number
  endTime?: number
}) {
  return request<PageResult<LoginLog>>({
    url: '/ls/logins/page',
    method: 'get',
    params
  })
}

// 获取登录日志详情
export function getLoginLog(id: string) {
  return request<LoginLog>({
    url: `/ls/logins/${id}`,
    method: 'get'
  })
}

// 删除登录日志
export function deleteLoginLog(id: string) {
  return request<boolean>({
    url: `/ls/logins/${id}`,
    method: 'delete'
  })
}

// 批量删除登录日志
export function batchDeleteLoginLog(ids: string[]) {
  return request<boolean>({
    url: '/ls/logins/batch',
    method: 'delete',
    data: { ids }
  })
}

// 清空登录日志
export function clearLoginLog() {
  return request<boolean>({
    url: '/ls/logins/clear',
    method: 'delete'
  })
}

// 导出登录日志
export function exportLoginLog(params?: any) {
  return request<Blob>({
    url: '/ls/logins/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}