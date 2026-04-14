/**
 * 时间处理工具函数
 */

/**
 * 将时间戳转换为东八区（中国标准时间）日期格式
 * @param timestamp - 时间戳（毫秒）
 * @param format - 日期格式，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export function formatTimestampToCST(
  timestamp?: number | string | null, 
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string {
  if (!timestamp) return '-'

  // 确保输入的是数字类型的时间戳
  const time = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp
  
  if (!time || isNaN(time as number)) return '-'

  // 创建时间对象
  const date = new Date(time as number)

  // 验证日期是否有效
  if (isNaN(date.getTime())) return '-'

  // 使用 toLocaleString 方法获取指定时区的时间
  // 通过指定 timeZone 为 'Asia/Shanghai' 确保正确转换为东八区时间
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  
  const formatted = date.toLocaleString('zh-CN', options);
  
  // 解析格式化后的字符串并替换到模板中
  const [datePart, timePart] = formatted.split(' ');
  const [year, month, day] = datePart.split('/').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);
  
  return format
    .replace('YYYY', year.toString())
    .replace('MM', month.toString().padStart(2, '0'))
    .replace('DD', day.toString().padStart(2, '0'))
    .replace('HH', hour.toString().padStart(2, '0'))
    .replace('mm', minute.toString().padStart(2, '0'))
    .replace('ss', second.toString().padStart(2, '0'))
}

/**
 * 将时间戳转换为本地时间格式（兼容现有用法）
 * @param timestamp - 时间戳（毫秒）
 * @returns 格式化后的日期字符串
 */
export function formatTime(timestamp?: number | string): string {
  return formatTimestampToCST(timestamp, 'YYYY-MM-DD HH:mm:ss')
}

/**
 * 将时间戳转换为日期时间格式（年月日 时分秒）
 * @param timestamp - 时间戳（毫秒）
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(timestamp?: number): string {
  return formatTimestampToCST(timestamp, 'YYYY-MM-DD HH:mm:ss')
}

/**
 * 将时间戳转换为日期格式（年月日）
 * @param timestamp - 时间戳（毫秒）
 * @returns 格式化后的日期字符串
 */
export function formatDate(timestamp?: number): string {
  return formatTimestampToCST(timestamp, 'YYYY-MM-DD')
}

/**
 * 将时间戳转换为时间格式（时分秒）
 * @param timestamp - 时间戳（毫秒）
 * @returns 格式化后的时间字符串
 */
export function formatTimeOnly(timestamp?: number): string {
  return formatTimestampToCST(timestamp, 'HH:mm:ss')
}