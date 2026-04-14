import { request } from '@/utils/request'

// 博客分类类型
export interface BlogCategory {
  id?: number
  name: string
  description?: string
  sortOrder?: number
  createTime?: number
}

// 获取所有博客分类列表
export function getBlogCategoryList(): Promise<BlogCategory[]> {
  return request.get('/cs/categories/list')
}

// 新增或修改博客分类
export function saveBlogCategory(data: BlogCategory): Promise<void> {
  return request.post('/cs/categories/add', data)
}

// 删除博客分类
export function deleteBlogCategory(id: number): Promise<void> {
  return request.delete(`/cs/categories/delete?id=${id}`)
}
