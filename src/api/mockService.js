/**
 * 模拟服务 - 用于在后端服务不可用时提供模拟数据
 */

export const mockOrderService = {
  /**
   * 获取模拟订单列表
   */
  getOrderList: (params) => {
    return new Promise((resolve) => {
      // 模拟数据
      const mockOrders = [
        {
          id: 1,
          itemId: 101,
          itemTitle: '笔记本电脑',
          borrowerId: 201,
          borrowerName: '张三',
          lenderId: 301,
          lenderName: '李四',
          totalAmount: 500,
          deposit: 200,
          borrowDays: 7,
          billingType: 1,
          billingTypeText: '按天计费',
          status: 1, // 申请中
          purpose: '毕业设计需要',
          createdAt: Date.now() - 86400000, // 一天前
          updatedAt: Date.now() - 86400000,
        },
        {
          id: 2,
          itemId: 102,
          itemTitle: '电动滑板车',
          borrowerId: 202,
          borrowerName: '王五',
          lenderId: 302,
          lenderName: '赵六',
          totalAmount: 300,
          deposit: 150,
          borrowDays: 3,
          billingType: 1,
          billingTypeText: '按天计费',
          status: 2, // 已确认
          purpose: '短途出行',
          createdAt: Date.now() - 172800000, // 两天前
          updatedAt: Date.now() - 172800000,
        },
        {
          id: 3,
          itemId: 103,
          itemTitle: '相机',
          borrowerId: 203,
          borrowerName: '钱七',
          lenderId: 303,
          lenderName: '孙八',
          totalAmount: 800,
          deposit: 500,
          borrowDays: 5,
          billingType: 1,
          billingTypeText: '按天计费',
          status: 3, // 借用中
          purpose: '旅游拍照',
          borrowTime: Date.now() - 86400000,
          returnTime: Date.now() + 259200000, // 三天后
          createdAt: Date.now() - 259200000, // 三天前
          updatedAt: Date.now() - 86400000,
        },
        {
          id: 4,
          itemId: 104,
          itemTitle: '投影仪',
          borrowerId: 204,
          borrowerName: '周九',
          lenderId: 304,
          lenderName: '吴十',
          totalAmount: 200,
          deposit: 100,
          borrowDays: 2,
          billingType: 1,
          billingTypeText: '按天计费',
          status: 4, // 已归还
          purpose: '会议演示',
          borrowTime: Date.now() - 259200000, // 三天前
          returnTime: Date.now() - 86400000, // 一天前
          actualReturnTime: Date.now() - 86400000, // 一天前
          createdAt: Date.now() - 345600000, // 四天前
          updatedAt: Date.now() - 86400000,
        },
        {
          id: 5,
          itemId: 105,
          itemTitle: '游戏机',
          borrowerId: 205,
          borrowerName: '刘一',
          lenderId: 305,
          lenderName: '陈二',
          totalAmount: 400,
          deposit: 300,
          borrowDays: 10,
          billingType: 1,
          billingTypeText: '按天计费',
          status: 5, // 已取消
          purpose: '娱乐',
          cancelReason: '临时有事',
          createdAt: Date.now() - 432000000, // 五天前
          updatedAt: Date.now() - 345600000, // 四天前,
        },
      ]

      // 根据参数过滤数据
      let filteredOrders = mockOrders
      if (params.keyword) {
        filteredOrders = filteredOrders.filter(order => 
          order.itemTitle.includes(params.keyword) || 
          order.id.toString().includes(params.keyword)
        )
      }
      if (params.status !== undefined && params.status !== null) {
        filteredOrders = filteredOrders.filter(order => order.status === params.status)
      }

      // 分页处理
      const start = (params.page - 1) * params.size
      const end = start + params.size
      const paginatedOrders = filteredOrders.slice(start, end)

      setTimeout(() => {
        resolve({
          records: paginatedOrders,
          total: filteredOrders.length,
          current: params.page,
          size: params.size,
        })
      }, 300) // 模拟网络延迟
    })
  },

  /**
   * 获取模拟订单详情
   */
  getOrderDetail: (orderId) => {
    return new Promise((resolve, reject) => {
      const mockOrders = [
        {
          id: 1,
          itemId: 101,
          itemTitle: '笔记本电脑',
          borrowerId: 201,
          borrowerName: '张三',
          lenderId: 301,
          lenderName: '李四',
          totalAmount: 500,
          deposit: 200,
          borrowDays: 7,
          billingType: 1,
          billingTypeText: '按天计费',
          status: 1, // 申请中
          purpose: '毕业设计需要',
          createdAt: Date.now() - 86400000, // 一天前
          updatedAt: Date.now() - 86400000,
        },
        {
          id: 2,
          itemId: 102,
          itemTitle: '电动滑板车',
          borrowerId: 202,
          borrowerName: '王五',
          lenderId: 302,
          lenderName: '赵六',
          totalAmount: 300,
          deposit: 150,
          borrowDays: 3,
          billingType: 1,
          billingTypeText: '按天计费',
          status: 2, // 已确认
          purpose: '短途出行',
          createdAt: Date.now() - 172800000, // 两天前
          updatedAt: Date.now() - 172800000,
        },
        {
          id: 3,
          itemId: 103,
          itemTitle: '相机',
          borrowerId: 203,
          borrowerName: '钱七',
          lenderId: 303,
          lenderName: '孙八',
          totalAmount: 800,
          deposit: 500,
          borrowDays: 5,
          billingType: 1,
          billingTypeText: '按天计费',
          status: 3, // 借用中
          purpose: '旅游拍照',
          borrowTime: Date.now() - 86400000,
          returnTime: Date.now() + 259200000, // 三天后
          createdAt: Date.now() - 259200000, // 三天前
          updatedAt: Date.now() - 86400000,
        },
        {
          id: 4,
          itemId: 104,
          itemTitle: '投影仪',
          borrowerId: 204,
          borrowerName: '周九',
          lenderId: 304,
          lenderName: '吴十',
          totalAmount: 200,
          deposit: 100,
          borrowDays: 2,
          billingType: 1,
          billingTypeText: '按天计费',
          status: 4, // 已归还
          purpose: '会议演示',
          borrowTime: Date.now() - 259200000, // 三天前
          returnTime: Date.now() - 86400000, // 一天前
          actualReturnTime: Date.now() - 86400000, // 一天前
          createdAt: Date.now() - 345600000, // 四天前
          updatedAt: Date.now() - 86400000,
        },
        {
          id: 5,
          itemId: 105,
          itemTitle: '游戏机',
          borrowerId: 205,
          borrowerName: '刘一',
          lenderId: 305,
          lenderName: '陈二',
          totalAmount: 400,
          deposit: 300,
          borrowDays: 10,
          billingType: 1,
          billingTypeText: '按天计费',
          status: 5, // 已取消
          purpose: '娱乐',
          cancelReason: '临时有事',
          createdAt: Date.now() - 432000000, // 五天前
          updatedAt: Date.now() - 345600000, // 四天前,
        },
      ]

      const foundOrder = mockOrders.find(order => order.id === orderId)
      if (foundOrder) {
        setTimeout(() => {
          resolve(foundOrder)
        }, 300)
      } else {
        setTimeout(() => {
          reject(new Error('订单不存在'))
        }, 300)
      }
    })
  },

  /**
   * 模拟确认订单
   */
  confirmOrder: (orderId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`订单 ${orderId} 已确认`)
        resolve()
      }, 300)
    })
  },

  /**
   * 模拟拒绝订单
   */
  rejectOrder: (orderId, reason) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`订单 ${orderId} 已拒绝，原因: ${reason}`)
        resolve()
      }, 300)
    })
  },

  /**
   * 模拟确认借出
   */
  startBorrow: (orderId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`订单 ${orderId} 已确认借出`)
        resolve()
      }, 300)
    })
  },

  /**
   * 模拟确认归还
   */
  returnItem: (orderId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`订单 ${orderId} 已确认归还`)
        resolve()
      }, 300)
    })
  },

  /**
   * 模拟取消订单
   */
  cancelOrder: (orderId, reason) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`订单 ${orderId} 已取消，原因: ${reason}`)
        resolve()
      }, 300)
    })
  },

  /**
   * 模拟获取订单统计数据
   */
  getOrderStats: (params) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalOrders: 150,
          pendingOrders: 12,
          completedOrders: 108,
          cancelledOrders: 30,
          totalRevenue: 25000,
        })
      }, 300)
    })
  },

  /**
   * 模拟获取订单操作日志
   */
  getOrderLogs: (orderId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, orderId, action: '创建订单', operator: '用户', time: Date.now() - 86400000, remark: '用户提交订单申请' },
          { id: 2, orderId, action: '确认订单', operator: '管理员', time: Date.now() - 43200000, remark: '管理员确认订单' },
        ])
      }, 300)
    })
  },
}