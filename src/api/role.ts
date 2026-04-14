import { request } from '@/utils/request'
import type { Role } from '@/types'

// 获取角色列表
export function getRoleList(): Promise<Role[]> {
  return request.get('/as/roles/list')
}

// 获取角色详情
export function getRoleById(id: number | string): Promise<Role> {
  return request.get(`/as/roles/${id}`)
}

// 新增角色
export function addRole(data: Partial<Role>): Promise<Role> {
  return request.post('/as/roles', data)
}

// 更新角色
export function updateRole(id: number | string, data: Partial<Role>): Promise<void> {
  return request.put(`/as/roles/${id}`, data)
}

// 删除角色
export function deleteRole(id: number | string): Promise<void> {
  return request.delete(`/as/roles/${id}`)
}


