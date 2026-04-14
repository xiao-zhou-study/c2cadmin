/**
 * 评价管理API
 */

import request from './request'

/**
 * 获取评价列表
 */
export function getReviewList(params: {
  page?: number
  pageSize?: number
  itemId?: string
  userId?: string
}): Promise<any> {
  return request.get('/rs/reviews/item/0', { params })
}

/**
 * 获取用户收到的评价列表
 */
export function getUserReviews(userId: number, params: {
  page?: number
  pageSize?: number
}): Promise<any> {
  return request.get(`/rs/reviews/user/${userId}`, { params })
}

/**
 * 删除评价
 */
export function deleteReview(reviewId: string): Promise<void> {
  return request.delete(`/rs/reviews/reviews/${reviewId}`)
}

/**
 * 获取评价详情
 */
export function getReviewDetail(reviewId: number): Promise<any> {
  return request.get(`/rs/reviews/item/0`, { params: { reviewId } })
}

/**
 * 导出评价数据
 */
export function exportReviews(params?: any): Promise<Blob> {
  return request.get('/rs/reviews/reviews/export', {
    params,
    responseType: 'blob'
  })
}

/**
 * 获取评价趋势数据
 */
export function getReviewTrends(params: {
  period: '7d' | '30d' | '90d'
}): Promise<any> {
  return request.get('/rs/reviews/reviews/stats/0', { params })
}