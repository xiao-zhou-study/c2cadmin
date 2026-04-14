import request from '@/utils/request'
import type { UploadResult } from '@/types'

// 单文件上传
export function uploadFile(file: File, data?: Record<string, any>) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('module', data?.module || 'common')

  if (data) {
    Object.keys(data).forEach(key => {
      if (key !== 'module') {
        formData.append(key, data[key])
      }
    })
  }

  return request<UploadResult>({
    url: '/ss/files/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 多文件上传
export function uploadMultipleFiles(files: File[], data?: Record<string, any>) {
  const formData = new FormData()

  files.forEach(file => {
    formData.append('files', file)
  })
  formData.append('module', data?.module || 'common')

  if (data) {
    Object.keys(data).forEach(key => {
      if (key !== 'module') {
        formData.append(key, data[key])
      }
    })
  }

  return request<UploadResult[]>({
    url: '/ss/files/upload/batch',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 删除上传的文件
export function deleteUploadedFile(fileId: number) {
  return request<boolean>({
    url: `/ss/files/${fileId}`,
    method: 'delete'
  })
}

// 获取文件信息
export function getFileInfo(fileId: number) {
  return request<UploadResult>({
    url: `/ss/files/${fileId}`,
    method: 'get'
  })
}