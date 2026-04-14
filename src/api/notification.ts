import request from '@/utils/request'
import type { Notification, PageQuery, PageResult } from '@/types'

// 获取通知列表
export function getNotificationPage(params: PageQuery & {
  type?: string
  isRead?: boolean
}) {
  return request<PageResult<Notification>>({
    url: '/ns/notifications',
    method: 'get',
    params
  })
}

// 获取通知详情（需要从列表中选择）
export function getNotificationDetail(notificationId: string) {
  return request<Notification>({
    url: `/ns/notifications/${notificationId}`,
    method: 'get'
  })
}

// 标记通知为已读
export function markAsRead(notificationId: string) {
  return request<void>({
    url: `/ns/notifications/${notificationId}/read`,
    method: 'post'
  })
}

// 标记所有通知为已读
export function markAllAsRead() {
  return request<void>({
    url: '/ns/notifications/read-all',
    method: 'post'
  })
}

// 删除通知
export function deleteNotification(notificationId: string) {
  return request<boolean>({
    url: `/ns/notifications/${notificationId}`,
    method: 'delete'
  })
}

// 清空所有通知
export function clearAllNotifications() {
  return request<boolean>({
    url: '/ns/notifications/clear-all',
    method: 'post'
  })
}

// 获取最新通知
export function getLatestNotifications(limit: number = 10) {
  return request<Notification[]>({
    url: '/ns/notifications/latest',
    method: 'get',
    params: { limit }
  })
}

// 获取未读通知数量
export function getUnreadCount() {
  return request<{ count: number }>({
    url: '/ns/notifications/unread-count',
    method: 'get'
  })
}

// 创建或修改全员广播公告
export interface BroadcastForm {
  id?: number | string
  title: string
  content: string
  category: number // 1-重要通知, 2-校园活动, 3-系统维护
  isActive?: boolean // 默认 true
}

export function addOrUpdateBroadcast(data: BroadcastForm) {
  return request<{}>({
    url: '/ns/system_broadcasts/add',
    method: 'post',
    data
  })
}

// 管理员分页获取全员广播公告列表
export interface BroadcastListParams {
  pageNo?: number
  pageSize?: number
  isAsc?: boolean
  sortBy?: string
  title?: string
  category?: number // 1-通知, 2-活动, 3-维护
  isActive?: boolean // true-发布中, false-已下线
  startTime?: number // 开始时间戳（毫秒）
  endTime?: number // 结束时间戳（毫秒）
}

export interface BroadcastItem {
  id: number
  title: string
  content: string
  category: number // 1-通知, 2-活动, 3-维护
  isActive: boolean
  createdAt: number
  updatedAt: number
}

export interface BroadcastListResponse {
  total: number
  pages: number
  list: BroadcastItem[]
}

export function getBroadcastList(params: BroadcastListParams) {
  return request<BroadcastListResponse>({
    url: '/ns/system_broadcasts/list',
    method: 'get',
    params
  })
}

// 删除全员广播公告
export function deleteBroadcast(id: number) {
  return request<{}>({
    url: '/ns/system_broadcasts/delete',
    method: 'delete',
    params: { id }
  })
}

// ==============================
// 校园公告管理（/cs/campus_announcements）
// ==============================

// 创建或修改校园公告
export interface CampusAnnouncementForm {
  id?: number | string
  title: string
  content: string
  // 发布状态：true-已发布，false-下线
  isPublished: boolean
}

// 校园公告列表/详情项
export interface CampusAnnouncementItem {
  id: number
  title: string
  content: string
  isPublished: boolean
  createTime: number
  updateTime: number
}

// 校园公告列表查询参数
export interface CampusAnnouncementListParams {
  pageNo?: number
  pageSize?: number
  isAsc?: boolean
  sortBy?: string
  keyword?: string
  isPublished?: boolean
}

// 校园公告分页响应
export interface CampusAnnouncementListResponse {
  total: number
  pages: number
  list: CampusAnnouncementItem[]
}

// 分页获取校园公告列表
export function getCampusAnnouncementList(params: CampusAnnouncementListParams) {
  return request<CampusAnnouncementListResponse>({
    url: '/cs/campus_announcements/list',
    method: 'get',
    params
  })
}

// 创建或修改校园公告
export function saveCampusAnnouncement(data: CampusAnnouncementForm) {
  return request<{}>({
    url: '/cs/campus_announcements/save',
    method: 'post',
    data
  })
}

// 删除校园公告
export function deleteCampusAnnouncement(id: number) {
  return request<{}>({
    url: '/cs/campus_announcements/delete',
    method: 'delete',
    params: { id }
  })
}

// 根据 ID 获取校园公告详情
export function getCampusAnnouncementDetail(id: number) {
  return request<CampusAnnouncementItem>({
    url: '/cs/campus_announcements/get',
    method: 'get',
    params: { id }
  })
}
