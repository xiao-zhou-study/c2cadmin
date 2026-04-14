import { request } from '@/utils/request'
import type { Item, PageQuery, PageResult } from '@/types'

// 获取物品列表
export function getItemList(params: PageQuery & {
  keyword?: string
  categoryId?: number
  status?: number
  minPrice?: number
  maxPrice?: number
  conditionLevel?: string
  isDeposit?: boolean
  location?: string
}): Promise<PageResult<Item>> {
  return request.get('/is/items', { params })
}

// 获取物品详情
export function getItemById(id: string): Promise<Item> {
  return request.get(`/is/items/${id}`)
}

// 新增物品
export function addItem(data: Partial<Item>): Promise<void> {
  return request.post('/is/items', data)
}

// 更新物品
export function updateItem(id: string, data: Partial<Item>): Promise<void> {
  return request.put(`/is/items/${id}`, data)
}

// 删除物品
export function deleteItem(id: string): Promise<void> {
  return request.delete(`/is/items/${id}`)
}

// 更新物品状态
export function updateItemStatus(id: string, status: number, remark?: string): Promise<void> {
  return request.put(`/is/items/${id}/status`, { status, remark })
}

// 批量更新物品状态
export function batchUpdateItemStatus(ids: number[], status: number, remark?: string): Promise<void> {
  return request.put('/is/items/batch/status', null, { params: { ids, status, remark } })
}

// 根据用户ID获取物品列表
export function getItemsByUserId(userId: string): Promise<Item[]> {
  return request.get(`/is/items/user/${userId}`)
}

// 获取物品统计信息
export function getItemStats(): Promise<any> {
  return request.get('/is/items/stats')
}

// 导出物品数据
export function exportItems(params?: any): Promise<Blob> {
  return request.get('/is/items/export', {
    params,
    responseType: 'blob'
  })
}
