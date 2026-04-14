// ==================== 通用类型 ====================

// 登录表单
export interface LoginForm {
  username: string
  password: string
  rememberMe?: boolean
}

/**
 * 分页参数
 */
export interface PageQuery {
  pageNo: number
  pageSize: number
}

/**
 * 分页响应
 */
export interface PageResult<T> {
  total: number
  list: T[]
  pages: number
}

/**
 * 统一API响应格式
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
  timestamp: number
}

// ==================== 用户相关类型 ====================

/**
 * 用户基本信息 (对应 users 表)
 */
export interface User {
  id: string
  username: string
  email?: string
  phone?: string
  avatarUrl?: string
  studentId?: string
  school?: string
  department?: string
  grade?: string
  creditScore: number
  isVerified: boolean
  status: 1 | 2 // 1:正常 2:禁用
  lastLoginAt?: number
  createdAt: number
  updatedAt: number
}

/**
 * 用户详细信息 (对应 user_profiles 表)
 */
export interface UserProfile {
  id: string
  userId: string
  realName?: string
  gender?: 0 | 1 | 2 // 0:保密 1:男 2:女
  birthday?: string // date类型
  bio?: string
  qq?: string
  wechat?: string
  createdAt: number
  updatedAt: number
}

/**
 * 用户统计信息 (对应 user_stats 表)
 */
export interface UserStats {
  id: string
  userId: string
  itemsPublished: number // 发布商品数
  itemsBorrowed: number // 购买商品数
  itemsLent: number // 出售商品数
  totalRatings: number
  averageRating: number
  createdAt: number
  updatedAt: number
}

/**
 * 用户完整信息 (User + UserProfile + UserStats)
 */
export interface UserInfo extends User {
  realName?: string
  gender?: 0 | 1 | 2
  birthday?: string
  bio?: string
  qq?: string
  wechat?: string
  itemsPublished?: number // 发布商品数
  itemsBorrowed?: number // 购买商品数
  itemsLent?: number // 出售商品数
  totalRatings?: number
  averageRating?: number
}

// ==================== 权限相关类型 ====================

/**
 * 角色 (对应 roles 表)
 */
export interface Role {
  id: string
  name: string
  description?: string
  createdAt: number
  updatedAt: number
}

/**
 * 用户角色关联 (对应 user_roles 表)
 */
export interface UserRole {
  id: string
  userId: string
  roleId: string
  createdAt: number
}

// ==================== 商品相关类型 ====================

/**
 * 商品分类 (对应 categories 表)
 */
export interface Category {
  id: string
  name: string
  description?: string
  icon?: string
  sortOrder: number
  isActive: boolean
  createdAt: number
  updatedAt: number
}

/**
 * 商品信息 (对应 items 表)
 */
export interface Item {
  id: string
  ownerId: string
  title: string
  description?: string
  categoryId?: string
  categoryName?: string
  ownerName?: string
  username?: string
  avatar?: string
  conditionLevel: string // 商品成色
  images?: string[] // JSON类型
  price: number
  billingType: 'per_day' | 'per_week' | 'per_month'
  deposit: number // 担保金额
  isNegotiable: boolean
  minBorrowDays: number
  maxBorrowDays: number
  location?: string // 交易地点
  address?: string
  borrowConditions?: string // 交易说明
  status: 1 | 2 | 3 // 1:在售 2:已售出 3:已下架
  viewCount: number
  favoriteCount: number
  createdAt: number
  updatedAt: number
}

// ==================== 订单相关类型 ====================

/**
 * 交易订单 (对应 borrow_orders 表)
 */
export interface Order {
  id: string // 订单 ID（唯一商户单号，主键）
  itemId: string // 关联物品 ID
  itemName?: string // 物品名称
  itemImageUrl?: string[] // 物品图片 URL 列表
  buyerId: string // 买家 ID
  buyerName?: string // 买家名称
  buyerAvatarUrl?: string // 买家头像 URL
  sellerId: string // 卖家 ID
  sellerName?: string // 卖家名称
  sellerAvatarUrl?: string // 卖家头像 URL
  title: string // 订单标题快照
  price: number // 价格（元）
  status: 1 | 2 | 3 | 4 | 5 | 6 | 7 // 1:待确认 2:待付款 3:交易中/服务中 4:待评价 5:已完成 6:已取消 7:已拒绝
  purpose?: string // 备注/用途说明
  confirmTime?: number // 确认时间戳
  payTime?: number // 支付成功时间戳
  payTradeNo?: string // 第三方支付流水号
  borrowTime?: number // 实际交付/开始时间戳
  cancelReason?: string // 取消/拒绝原因
  version?: number // 乐观锁版本号
  createdAt: number // 创建时间戳
  updatedAt: number // 更新时间戳
}

/**
 * 订单日志 (对应 order_logs 表)
 */
export interface OrderLog {
  id: string
  orderId: string
  operatorId: string
  action: string
  remark?: string
  createdAt: number
}

// ==================== 通知相关类型 ====================

/**
 * 通知消息 (对应 notifications 表)
 */
export interface Notification {
  id: string
  receiverId: string
  senderId?: string
  title: string
  content?: string
  type: 'system' | 'trade' | 'complete' | 'review' // 通知类型
  relatedId?: string
  relatedType?: 'item' | 'order'
  isRead: boolean
  readAt?: number
  isDeleted: boolean
  createdAt: number
  updatedAt: number
  // 管理端扩展字段
  isGlobal?: boolean
  status?: 0 | 1 // 0: 草稿 1: 已发布
  createdBy?: string
  createdByName?: string
  targetUsers?: string[]
}

/**
 * 通知模板 (对应 notification_templates 表)
 */
export interface NotificationTemplate {
  id: string
  code: string
  name: string
  titleTemplate: string
  contentTemplate: string
  type: string
  isActive: boolean
  createdAt: number
  updatedAt: number
}

// ==================== 评价相关类型 ====================

/**
 * 评价信息 (对应 reviews 表)
 */
export interface Review {
  id: string
  itemId: string
  reviewerId: string
  targetUserId: string
  orderId?: string
  rating: 1 | 2 | 3 | 4 | 5
  content?: string
  images?: string[] // JSON类型
  status: 1 | 2 // 1:正常 2:已删除
  isAnonymous: boolean
  createdAt: number
  updatedAt: number
}

/**
 * 评价统计 (对应 review_stats 表)
 */
export interface ReviewStats {
  id: string
  userId: string
  totalReviews: number
  avgRating: number
  oneStarCount: number
  twoStarCount: number
  threeStarCount: number
  fourStarCount: number
  fiveStarCount: number
  createdAt: number
  updatedAt: number
}

// ==================== 文件相关类型 ====================

/**
 * 文件信息 (对应 files 表)
 */
export interface FileInfo {
  id: string
  originalName: string
  fileName: string
  filePath: string
  fileSize: number
  fileType?: string
  mimeType?: string
  md5?: string
  bucket?: string
  url?: string
  uploaderId?: string
  module?: 'item' | 'user' | 'review'
  moduleId?: string
  status: 1 | 2 // 1:正常 2:已删除
  createdAt: number
  updatedAt: number
}

/**
 * 文件上传响应
 */
export interface UploadResult {
  url: string
  filename: string
  size: number
  type: string
}

// ==================== 系统日志类型 ====================

/**
 * 操作日志
 */
export interface OperationLog {
  id: string
  userId: string
  username?: string
  operation: string
  method: string
  params?: string
  time?: number
  ip?: string
  userAgent?: string
  status: number
  error?: string
  createdAt?: number
}

/**
 * 登录日志
 */
export interface LoginLog {
  id: string
  userId?: string
  username?: string
  ip?: string
  location?: string
  browser?: string
  os?: string
  status: number
  message?: string
  loginTime?: number
  createdAt?: number
}

/**
 * 系统配置
 */
export interface SystemConfig {
  id: string
  configKey: string
  configValue: string
  configType: string
  remark?: string
  isPublic: boolean
  createdAt?: number
  updatedAt?: number
}
