// mockService.d.ts
export interface Order {
  id: string
  itemId: string
  itemTitle: string
  borrowerId: string
  borrowerName: string
  lenderId: string
  lenderName: string
  totalAmount: number
  deposit?: number
  borrowDays: number
  billingType: number
  billingTypeText: string
  status: number
  purpose?: string
  borrowTime?: number
  returnTime?: number
  actualReturnTime?: number
  cancelReason?: string
  createdAt: number
  updatedAt: number
}

export interface OrderListParams {
  keyword?: string
  status?: number
  page: number
  size: number
  startDate?: string
  endDate?: string
  borrowerId?: string
  lenderId?: string
}

export interface OrderListResponse {
  records: Order[]
  total: number
  current: number
  size: number
}

export interface MockOrderService {
  getOrderList: (params: OrderListParams) => Promise<OrderListResponse>
  getOrderDetail: (orderId: string) => Promise<Order>
  confirmOrder: (orderId: string) => Promise<void>
  rejectOrder: (orderId: string, reason?: string) => Promise<void>
  startBorrow: (orderId: string) => Promise<void>
  returnItem: (orderId: string) => Promise<void>
  cancelOrder: (orderId: string, reason?: string) => Promise<void>
  getOrderStats: (params?: {
    startDate?: string
    endDate?: string
    status?: number
  }) => Promise<any>
  getOrderLogs: (orderId: string) => Promise<any[]>
}

export const mockOrderService: MockOrderService