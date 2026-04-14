import { request } from '@/utils/request'
import type { Category } from '@/types'

// 获取所有分类
export function getCategoryList(): Promise<Category[]> {
  return request.get('/is/categories/admin')
}

// 新增分类
export function addCategory(data: Partial<Category>): Promise<void> {
  return request.post('/is/categories', data)
}

// 更新分类
export function updateCategory(id: string, data: Partial<Category>): Promise<void> {
  return request.put(`/is/categories/${id}`, data)
}

// 删除分类
export function deleteCategory(id: string): Promise<void> {
  return request.delete(`/is/categories/${id}`)
}

// 上传分类图片
export function uploadCategoryImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/ss/files/upload?module=items', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}