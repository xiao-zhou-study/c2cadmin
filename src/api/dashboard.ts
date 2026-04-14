import request from './request'
import { storage } from '@/utils/storage'

export interface DashboardStats {
  userCount: number
  itemCount: number
  orderCount: number
  todayOrders: number
  todayUsers: number
  activeItems: number
  pendingOrders: number
  totalAmount: number
  todayAmount?: number
  userGrowth?: number
  itemGrowth?: number
  orderGrowth?: number
  revenueGrowth?: number
}

export interface OrderTrend {
  dates: string[]
  orderCounts: number[]
  amounts: number[]
}

export interface OrderAmountSummary {
  totalAmount: number
  todayAmount: number
}

export interface CategoryStat {
  categoryId: string
  categoryName: string
  count: number
}

export interface UserGrowth {
  dates: string[]
  userCounts: number[]
}

export interface OrderStatusStat {
  status: number
  statusText: string
  count: number
}

export interface ItemInfo {
  id: number
  title: string
  categoryName: string
  price: number
  viewCount?: number
  borrowCount?: number
}

export interface OrderInfo {
  id: string
  itemTitle: string
  status: number
  createTime: string
}

/**
 * 获取仪表盘统计数据
 */
export function getDashboardStats(): Promise<DashboardStats> {
  return request.get('/ad/dashboard/stats')
}

/**
 * 获取用户总数
 * 使用用户服务接口 /us/users/count
 */
export function getUserTotalCount(): Promise<number> {
  const token =
    storage.getToken() ||
    localStorage.getItem('admin_token') ||
    localStorage.getItem('token') ||
    ''

  return request
    .get('/us/users/count', {
      headers: {
        // 显式携带管理员访问令牌（不带多余引号）
        Authorization: token as string
      }
    })
    .then((res: any) => {
      const value = (res as any).data
      const num = Number(value)
      return Number.isNaN(num) ? 0 : num
    })
}

/**
 * 获取物品总数
 * 使用物品服务接口 /is/items/count
 */
export function getItemTotalCount(): Promise<number> {
  return request.get('/is/items/count').then((res: any) => {
    const value = (res as any).data
    const num = Number(value)
    return Number.isNaN(num) ? 0 : num
  })
}

/**
 * 获取订单趋势数据
 */
export function getOrderTrend(days: number): Promise<OrderTrend> {
  return request
    .get('/os/borrow_orders/trend', { params: { days } })
    .then((res: any) => {
      const list = (res as any).data || []
      return {
        dates: list.map((item: any) => item.date),
        orderCounts: list.map((item: any) => Number(item.orderCount) || 0),
        amounts: list.map((item: any) => Number(item.transactionAmount) || 0)
      } as OrderTrend
    })
}

/**
 * 获取订单总数
 * 使用订单服务接口 /os/borrow_orders/count
 */
export function getOrderTotalCount(): Promise<number> {
  return request.get('/os/borrow_orders/count').then((res: any) => {
    const value = (res as any).data
    const num = Number(value)
    return Number.isNaN(num) ? 0 : num
  })
}

/**
 * 获取订单金额统计
 * 使用订单服务接口 /os/borrow_orders/amount
 */
export function getOrderAmountSummary(): Promise<OrderAmountSummary> {
  return request.get('/os/borrow_orders/amount').then((res: any) => {
    const data = (res as any).data || {}
    const totalAmount = Number(data.totalAmount) || 0
    const todayAmount = Number(data.todayAmount) || 0
    return { totalAmount, todayAmount }
  })
}

/**
 * 获取分类统计数据
 */
export function getCategoryStats(): Promise<CategoryStat[]> {
  return request.get('/is/items/pie').then((res: any) => {
    const list = (res as any).data || []
    return list.map((item: any) => ({
      categoryId: '',
      categoryName: item.name,
      count: Number(item.value) || 0
    })) as CategoryStat[]
  })
}

/**
 * 获取最新物品
 */
export function getLatestItems(limit: number = 5): Promise<ItemInfo[]> {
  return request.get('/ad/dashboard/latest-items', { params: { limit } })
}

/**
 * 获取最新订单
 */
export function getLatestOrders(limit: number = 5): Promise<OrderInfo[]> {
  return request.get('/ad/dashboard/latest-orders', { params: { limit } })
}

/**
 * 获取用户增长数据
 */
export function getUserGrowth(days: number): Promise<UserGrowth> {
  return request
    .get('/us/users/trend', { params: { days } })
    .then((res: any) => {
      const list = (res as any).data || []
      return {
        dates: list.map((item: any) => item.date),
        userCounts: list.map((item: any) => Number(item.count) || 0)
      } as UserGrowth
    })
}

/**
 * 获取订单状态分布
 */
export function getOrderStatusDistribution(): Promise<OrderStatusStat[]> {
  return request.get('/os/borrow_orders/pie').then((res: any) => {
    const list = (res as any).data || []
    return list.map((item: any, index: number) => ({
      status: index + 1,
      statusText: item.name,
      count: Number(item.value) || 0
    })) as OrderStatusStat[]
  })
}

/**
 * 获取热门物品
 */
export function getHotItems(days: number = 7, limit: number = 5): Promise<ItemInfo[]> {
  return request.get('/ad/dashboard/hot-items', { params: { days, limit } })
}

/**
 * 导出仪表盘数据
 */
export function exportDashboardData(type: 'stats' | 'trend' | 'detailed'): Promise<Blob> {
  return request.get(`/ad/dashboard/export/${type}`, {
    responseType: 'blob'
  })
}