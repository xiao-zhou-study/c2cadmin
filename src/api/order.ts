import { request } from '@/utils/request'
import type { Order } from '@/types'

// 检查是否为模拟模式
const isMockMode = import.meta.env.VITE_API_MOCK === 'true'

// 导入模拟服务
import('./mockService').then(module => {
  mockOrderService = module.mockOrderService
})

let mockOrderService: any

export interface OrderListParams {
  status?: number
  keyword?: string
  pageNo: number
  pageSize: number
  sortBy?: string
  isAsc?: boolean
}

export interface OrderListResponse {
  total: number
  list: Order[]
  pages: number
}

/**
 * 获取订单列表
 */
export function getOrderList(params: OrderListParams): Promise<OrderListResponse> {
  if (isMockMode) {
    return mockOrderService.getOrderList(params)
  }
  return request.get('/os/borrow_orders/list', { params }).then((res: any) => {
    const data = res || {}
    const rawList = data.list || []

    const list: Order[] = rawList.map((item: any) => {
      const order: Order = {
        id: String(item.id ?? ''),
        itemId: String(item.itemId ?? ''),
        itemName: item.itemName,
        itemImageUrl: item.itemImageUrl,
        buyerId: String(item.buyerId ?? ''),
        buyerName: item.buyerName,
        buyerAvatarUrl: item.buyerAvatarUrl,
        sellerId: String(item.sellerId ?? ''),
        sellerName: item.sellerName,
        sellerAvatarUrl: item.sellerAvatarUrl,
        title: item.title,
        price: Number(item.price) || 0,
        status: Number(item.status) as Order['status'],
        purpose: item.purpose,
        confirmTime: item.confirmTime ? Number(item.confirmTime) : undefined,
        payTime: item.payTime ? Number(item.payTime) : undefined,
        payTradeNo: item.payTradeNo,
        borrowTime: item.borrowTime ? Number(item.borrowTime) : undefined,
        cancelReason: item.cancelReason ?? undefined,
        version: item.version,
        createdAt: Number(item.createdAt) || 0,
        updatedAt: Number(item.updatedAt) || 0
      }

      return order
    })

    return {
      total: Number(data.total) || 0,
      pages: Number(data.pages) || 0,
      list
    }
  })
}

/**
 * 获取订单详情
 */
export function getOrderDetail(orderId: string): Promise<Order> {
  return request.get(`/os/${orderId}`)
}

/**
 * 确认订单
 */
export function confirmOrder(orderId: string): Promise<void> {
  return request.put(`/os/confirm`, { orderId })
}

/**
 * 拒绝订单
 */
export function rejectOrder(orderId: string, reason?: string): Promise<void> {
  return request.put(`/os/reject`, { orderId, reason })
}

/**
 * 确认借出
 */
export function startBorrow(orderId: string): Promise<void> {
  return request.put(`/os/borrow`, { orderId })
}

/**
 * 确认归还
 */
export function returnItem(orderId: string): Promise<void> {
  return request.put(`/os/return`, { orderId })
}

/**
 * 取消订单
 */
export function cancelOrder(orderId: string, reason?: string): Promise<void> {
  return request.put(`/os/cancel`, { orderId, reason })
}

/**
 * 获取订单统计数据
 */
export function getOrderStats(params?: {
  startDate?: string
  endDate?: string
  status?: number
}): Promise<any> {
  return request.get('/os/stats', { params })
}

/**
 * 获取订单操作日志
 */
export function getOrderLogs(orderId: string): Promise<any[]> {
  return request.get(`/os/${orderId}/logs`)
}
