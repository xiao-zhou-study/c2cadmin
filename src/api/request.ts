import axios from 'axios'
import { ElMessage } from 'element-plus'
import { storage } from '@/utils/storage'

// 创建axios实例
// 开发环境：通过 /api 代理到本地网关
// 生产环境：使用环境变量中的 HTTPS API 域名（见 .env.production 的 VITE_API_BASE_URL）
const request = axios.create({
  baseURL:
    import.meta.env.MODE === 'development'
      ? '/api'
      : import.meta.env.VITE_API_BASE_URL || 'https://api.xzxfle.top',
  timeout: 10000 // 请求超时时间
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    // 优先使用后台管理端 token（admin_token），兼容旧的 token key
    const token =
      storage.getToken() ||
      localStorage.getItem('admin_token') ||
      localStorage.getItem('token')

    if (token) {
      // storage.getToken() 返回的已是解析后的字符串，不包含多余引号
      config.headers['Authorization'] = token as string
    }
    return config
  },
  error => {
    // 对请求错误做些什么
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data

    // 兼容 code 为 0 或 200 的成功返回
    if (typeof res.code !== 'undefined' && res.code !== 0 && res.code !== 200) {
      ElMessage.error(res.message || res.msg || '请求失败')
      return Promise.reject(new Error(res.message || res.msg || 'Error'))
    }

    return res
  },
  error => {
    // 对响应错误做点什么
    console.error('Response error:', error)
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          ElMessage.error('未授权，请重新登录')
          // 仅在认证相关的页面跳转到登录页
          // 对于其他页面，我们显示错误信息而不是强制跳转
          if (window.location.pathname === '/login') {
            // 如果已经在登录页，不跳转
          } else {
            // 显示错误信息，但不跳转到登录页
            localStorage.removeItem('token')
            // 可以选择跳转到登录页或保持在当前页
            // window.location.href = '/login'  // 取消注释以恢复跳转
          }
          break
        case 403:
          ElMessage.error('拒绝访问')
          break
        case 404:
          ElMessage.error('请求地址不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(`连接出错${error.response.status}!`)
      }
    } else if (error.message.includes('timeout')) {
      ElMessage.error('请求超时！请稍后重试')
    } else {
      ElMessage.error('网络异常，请检查网络连接')
    }
    
    return Promise.reject(error)
  }
)

export default request