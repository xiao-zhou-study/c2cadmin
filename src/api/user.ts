import { request } from '@/utils/request'
import type { UserInfo, PageQuery, PageResult } from '@/types'

// 分页查询用户列表
export function getUserList(params: PageQuery & { keyword?: string; status?: number }): Promise<PageResult<UserInfo>> {
  // 过滤掉undefined的参数
  const filteredParams: any = {}
  if (params.keyword !== undefined) filteredParams.keyword = params.keyword
  if (params.status !== undefined) filteredParams.status = params.status
  if (params.pageNo !== undefined) filteredParams.pageNo = params.pageNo
  if (params.pageSize !== undefined) filteredParams.pageSize = params.pageSize
  
  return request.get('/us/users/page', { params: filteredParams })
}

// 根据用户ID获取用户信息
export function getUserById(id: string): Promise<UserInfo> {
  return request.get(`/us/users/${id}`)
}

// 根据userId批量查询用户信息
export function getUsersByIds(ids: string[]): Promise<UserInfo[]> {
  return request.get('/us/users/list', { params: { ids: ids.join(',') } })
}

// 更新用户信息
export function updateUser(id: string, data: Partial<UserInfo>): Promise<UserInfo> {
  return request.put(`/us/users/${id}`, data)
}
