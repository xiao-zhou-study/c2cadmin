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
  itemId?: string
  borrowerId?: string
  lenderId?: string
  type?: string
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

// 将后端 billingType 数字映射为前端使用的计费类型枚举
const mapBillingType = (value: any): Order['billingType'] => {
  const num = Number(value)
  switch (num) {
    case 1:
      return 'per_day'
    case 2:
      return 'per_week'
    case 3:
      return 'per_month'
    default:
      return 'per_day'
  }
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
        // 使用后端的 orderNo 作为前端展示的订单号
        id: String(item.orderNo ?? item.id ?? ''),
        itemId: String(item.itemId ?? ''),
        itemTitle: item.itemName,
        borrowerId: String(item.borrowerId ?? ''),
        borrowerName: item.borrowerName,
        lenderId: String(item.lenderId ?? ''),
        lenderName: item.lenderName,
        title: item.title,
        price: Number(item.price) || 0,
        billingType: mapBillingType(item.billingType),
        deposit: item.deposit != null ? Number(item.deposit) : undefined,
        borrowDays: Number(item.borrowDays) || 0,
        purpose: item.purpose,
        status: Number(item.status) as Order['status'],
        borrowTime: item.borrowTime ? Number(item.borrowTime) : undefined,
        returnTime: item.expectReturnTime ? Number(item.expectReturnTime) : undefined,
        actualReturnTime: item.actualReturnTime ? Number(item.actualReturnTime) : undefined,
        cancelReason: item.cancelReason ?? undefined,
        totalAmount: Number(item.totalAmount) || 0,
        createdAt: Number(item.createdAt) || 0,
        updatedAt: Number(item.updatedAt) || 0
      }

      // 附加后端特有字段，便于前端展示使用
      ;(order as any).orderNo = item.orderNo
      ;(order as any).itemImages = item.itemImages
      ;(order as any).ownerName = item.lenderName

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
