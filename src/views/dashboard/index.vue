<template>
  <div class="dashboard-container">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="welcome-content">
        <div class="welcome-text">
          <h1 class="welcome-title">欢迎回来，{{ userStore.userName || '管理员' }}</h1>
          <p class="welcome-desc">校园二手交易平台 · 让闲置焕发新生</p>
        </div>
        <div class="welcome-time">
          <div class="time-value">{{ currentTime }}</div>
          <div class="time-date">{{ currentDate }}</div>
        </div>
      </div>
      <div class="welcome-decoration">
        <div class="decoration-circle decoration-circle--1" />
        <div class="decoration-circle decoration-circle--2" />
        <div class="decoration-circle decoration-circle--3" />
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row
      :gutter="20"
      class="stats-row"
    >
      <el-col
        :xs="12"
        :sm="6"
      >
        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--primary">
            <el-icon :size="24">
              <User />
            </el-icon>
          </div>
          <div class="stat-card__body">
            <div class="stat-card__value">
              <span class="count-up">{{ animatedStats.userCount }}</span>
            </div>
            <div class="stat-card__label">用户总数</div>
          </div>
          <div class="stat-card__trend stat-card__trend--up">
            <el-icon><CaretTop /></el-icon>
            <span>活跃用户</span>
          </div>
        </div>
      </el-col>
      <el-col
        :xs="12"
        :sm="6"
      >
        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--success">
            <el-icon :size="24">
              <Goods />
            </el-icon>
          </div>
          <div class="stat-card__body">
            <div class="stat-card__value">
              <span class="count-up">{{ animatedStats.itemCount }}</span>
            </div>
            <div class="stat-card__label">商品总数</div>
          </div>
          <div class="stat-card__trend stat-card__trend--up">
            <el-icon><CaretTop /></el-icon>
            <span>在售中</span>
          </div>
        </div>
      </el-col>
      <el-col
        :xs="12"
        :sm="6"
      >
        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--warning">
            <el-icon :size="24">
              <Document />
            </el-icon>
          </div>
          <div class="stat-card__body">
            <div class="stat-card__value">
              <span class="count-up">{{ animatedStats.orderCount }}</span>
            </div>
            <div class="stat-card__label">订单总数</div>
          </div>
          <div class="stat-card__trend stat-card__trend--up">
            <el-icon><CaretTop /></el-icon>
            <span>交易中</span>
          </div>
        </div>
      </el-col>
      <el-col
        :xs="12"
        :sm="6"
      >
        <div class="stat-card stat-card--highlight">
          <div class="stat-card__icon stat-card__icon--danger">
            <el-icon :size="24">
              <Money />
            </el-icon>
          </div>
          <div class="stat-card__body">
            <div class="stat-card__value">
              <span class="currency">¥</span>
              <span class="count-up">{{ formatAmount(animatedStats.totalAmount) }}</span>
            </div>
            <div class="stat-card__label">交易总额</div>
          </div>
          <div class="stat-card__footer">
            <div class="today-amount">
              <el-icon><TrendCharts /></el-icon>
              <span>今日交易 ¥{{ formatAmount(stats.todayAmount) }}</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row
      :gutter="20"
      class="chart-row"
    >
      <el-col
        :xs="24"
        :lg="16"
      >
        <div class="chart-card">
          <div class="chart-card__header">
            <div class="chart-card__title">
              <div class="title-icon">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <span>订单趋势</span>
            </div>
            <div class="chart-card__actions">
              <el-radio-group
                v-model="chartRange"
                size="small"
                @change="handleRangeChange"
              >
                <el-radio-button label="week">
                  本周
                </el-radio-button>
                <el-radio-button label="month">
                  本月
                </el-radio-button>
                <el-radio-button label="year">
                  本年
                </el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="chart-card__body">
            <div class="chart-wrapper">
              <div
                v-if="orderChartData.isEmpty"
                class="chart-empty"
              >
                <div class="empty-icon">
                  <el-icon :size="48"><DataLine /></el-icon>
                </div>
                <p>暂无订单趋势数据</p>
              </div>
              <div
                v-else
                ref="orderChartRef"
                class="chart-container"
              />
            </div>
          </div>
        </div>
      </el-col>
      <el-col
        :xs="24"
        :lg="8"
      >
        <div class="chart-card">
          <div class="chart-card__header">
            <div class="chart-card__title">
              <div class="title-icon title-icon--purple">
                <el-icon><PieChart /></el-icon>
              </div>
              <span>商品分类占比</span>
            </div>
          </div>
          <div class="chart-card__body">
            <div class="chart-wrapper">
              <div
                v-if="categoryChartData.isEmpty"
                class="chart-empty"
              >
                <div class="empty-icon">
                  <el-icon :size="48"><PieChart /></el-icon>
                </div>
                <p>暂无分类数据</p>
              </div>
              <div
                v-else
                ref="categoryChartRef"
                class="chart-container"
              />
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row
      :gutter="20"
      class="chart-row"
    >
      <el-col
        :xs="24"
        :lg="12"
      >
        <div class="chart-card">
          <div class="chart-card__header">
            <div class="chart-card__title">
              <div class="title-icon title-icon--blue">
                <el-icon><User /></el-icon>
              </div>
              <span>用户增长</span>
            </div>
            <div class="chart-card__actions">
              <el-radio-group
                v-model="userChartRange"
                size="small"
                @change="handleUserRangeChange"
              >
                <el-radio-button label="7">
                  近7天
                </el-radio-button>
                <el-radio-button label="30">
                  近30天
                </el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="chart-card__body">
            <div class="chart-wrapper">
              <div
                v-if="userChartData.isEmpty"
                class="chart-empty"
              >
                <div class="empty-icon">
                  <el-icon :size="48"><User /></el-icon>
                </div>
                <p>暂无用户增长数据</p>
              </div>
              <div
                v-else
                ref="userChartRef"
                class="chart-container"
              />
            </div>
          </div>
        </div>
      </el-col>
      <el-col
        :xs="24"
        :lg="12"
      >
        <div class="chart-card">
          <div class="chart-card__header">
            <div class="chart-card__title">
              <div class="title-icon title-icon--orange">
                <el-icon><Document /></el-icon>
              </div>
              <span>订单状态分布</span>
            </div>
          </div>
          <div class="chart-card__body">
            <div class="chart-wrapper">
              <div
                v-if="orderStatusChartData.isEmpty"
                class="chart-empty"
              >
                <div class="empty-icon">
                  <el-icon :size="48"><Document /></el-icon>
                </div>
                <p>暂无订单状态数据</p>
              </div>
              <div
                v-else
                ref="orderStatusChartRef"
                class="chart-container"
              />
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { useUserStore } from '@/stores/user'
import {
  getDashboardStats,
  getUserTotalCount,
  getItemTotalCount,
  getOrderTotalCount,
  getOrderAmountSummary,
  getOrderTrend,
  getCategoryStats,
  getLatestItems,
  getLatestOrders,
  getUserGrowth,
  getOrderStatusDistribution,
  getHotItems
} from '@/api/dashboard'

const userStore = useUserStore()

const orderChartRef = ref<HTMLElement>()
const categoryChartRef = ref<HTMLElement>()
const userChartRef = ref<HTMLElement>()
const orderStatusChartRef = ref<HTMLElement>()
let orderChart: echarts.ECharts | null = null
let categoryChart: echarts.ECharts | null = null
let userChart: echarts.ECharts | null = null
let orderStatusChart: echarts.ECharts | null = null

const chartRange = ref('week')
const userChartRange = ref('7')

// 时间显示
const currentTime = ref('')
const currentDate = ref('')
let timeInterval: ReturnType<typeof setInterval> | null = null

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  currentDate.value = `${now.getMonth() + 1}月${now.getDate()}日 ${weekDays[now.getDay()]}`
}

// 图表数据状态
const orderChartData = reactive({ isEmpty: false })
const categoryChartData = reactive({ isEmpty: false })
const userChartData = reactive({ isEmpty: false })
const orderStatusChartData = reactive({ isEmpty: false })

// 统计数据
const stats = reactive({
  userCount: 0,
  itemCount: 0,
  orderCount: 0,
  todayOrders: 0,
  todayUsers: 0,
  activeItems: 0,
  pendingOrders: 0,
  totalAmount: 0,
  todayAmount: 0
})

// 动画计数器
const animatedStats = reactive({
  userCount: 0,
  itemCount: 0,
  orderCount: 0,
  totalAmount: 0
})

// 数字动画
const animateNumber = (key: keyof typeof animatedStats, target: number, duration = 1000) => {
  const start = animatedStats[key]
  const startTime = performance.now()

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeProgress = 1 - Math.pow(1 - progress, 3)
    animatedStats[key] = Math.floor(start + (target - start) * easeProgress)

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}

// 最新物品数据
const latestItems = ref<any[]>([])

// 最新订单数据
const latestOrders = ref<any[]>([])

// 热门物品数据
const hotItems = ref<any[]>([])

// 格式化金额
const formatAmount = (amount: number) => {
  if (amount >= 10000) {
    return (amount / 10000).toFixed(1) + '万'
  }
  return amount.toFixed(0)
}

// 加载统计数据
const loadStats = async () => {
  try {
    const [dashboardRes, userTotal, itemTotal, orderTotal, amountSummary] = await Promise.all([
      getDashboardStats(),
      getUserTotalCount(),
      getItemTotalCount(),
      getOrderTotalCount(),
      getOrderAmountSummary()
    ])

    Object.assign(stats, dashboardRes)

    const total = Number(userTotal)
    if (!Number.isNaN(total)) {
      stats.userCount = total
      animateNumber('userCount', total)
    }

    const itemCount = Number(itemTotal)
    if (!Number.isNaN(itemCount)) {
      stats.itemCount = itemCount
      animateNumber('itemCount', itemCount)
    }

    const orderCount = Number(orderTotal)
    if (!Number.isNaN(orderCount)) {
      stats.orderCount = orderCount
      animateNumber('orderCount', orderCount)
    }

    const totalAmount = Number(amountSummary.totalAmount)
    if (!Number.isNaN(totalAmount)) {
      stats.totalAmount = totalAmount
      animateNumber('totalAmount', totalAmount)
    }

    const todayAmount = Number(amountSummary.todayAmount)
    if (!Number.isNaN(todayAmount)) {
      stats.todayAmount = todayAmount
    }
  } catch (error) {
    ElMessage.error('获取统计数据失败')
  }
}

// 加载最新数据
const loadLatestData = async () => {
  try {
    const [itemsRes, ordersRes, hotItemsRes] = await Promise.all([
      getLatestItems(5),
      getLatestOrders(5),
      getHotItems(7, 5)
    ])

    latestItems.value = itemsRes
    latestOrders.value = ordersRes
    hotItems.value = hotItemsRes
  } catch (error) {
    ElMessage.error('获取最新数据失败')
  }
}

// 处理范围变化
const handleRangeChange = async () => {
  let days = 7
  if (chartRange.value === 'month') days = 30
  if (chartRange.value === 'year') days = 365

  try {
    const res = await getOrderTrend(days)
    updateOrderChart(res.dates, res.orderCounts, res.amounts)
  } catch (error) {
    orderChartData.isEmpty = true
    ElMessage.error('获取订单趋势数据失败')
  }
}

// 处理用户图表范围变化
const handleUserRangeChange = async () => {
  const days = parseInt(userChartRange.value)

  try {
    const res = await getUserGrowth(days)
    updateUserChart(res.dates, res.userCounts)
  } catch (error) {
    userChartData.isEmpty = true
    ElMessage.error('获取用户增长数据失败')
  }
}

// 初始化订单趋势图表
const initOrderChart = async () => {
  if (!orderChartRef.value) return

  orderChart = echarts.init(orderChartRef.value)

  try {
    const res = await getOrderTrend(7)
    updateOrderChart(res.dates, res.orderCounts, res.amounts)
  } catch (error) {
    orderChartData.isEmpty = true
  }
}

// 更新订单趋势图表
const updateOrderChart = (dates: string[], orderCounts: number[], amounts: number[]) => {
  if (!orderChart) return

  const isEmpty = !dates?.length ||
    !orderCounts?.length ||
    !amounts?.length ||
    orderCounts.every(v => v === 0) ||
    amounts.every(v => v === 0)

  orderChartData.isEmpty = isEmpty
  if (isEmpty) return

  orderChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: [12, 16],
      textStyle: { color: '#1a1a1a', fontSize: 13 },
      extraCssText: 'border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);'
    },
    legend: {
      data: ['订单数', '交易额'],
      top: 8,
      right: 8,
      icon: 'roundRect',
      itemWidth: 12,
      itemHeight: 4,
      itemGap: 20,
      textStyle: { color: '#6b7280', fontSize: 12 }
    },
    grid: {
      left: 0,
      right: 0,
      bottom: 0,
      top: 50,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: true,
      data: dates,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#9ca3af', fontSize: 11, margin: 12 }
    },
    yAxis: [
      {
        type: 'value',
        name: '订单数',
        nameTextStyle: { color: '#9ca3af', fontSize: 11, padding: [0, 40, 0, 0] },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#9ca3af', fontSize: 11 },
        splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } }
      },
      {
        type: 'value',
        name: '交易额',
        nameTextStyle: { color: '#9ca3af', fontSize: 11, padding: [0, 0, 0, 40] },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { formatter: '¥{value}', color: '#9ca3af', fontSize: 11 },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '订单数',
        type: 'line',
        smooth: true,
        data: orderCounts,
        itemStyle: { color: '#22c55e' },
        lineStyle: { width: 3, cap: 'round' },
        showSymbol: false,
        emphasis: {
          focus: 'series',
          itemStyle: { borderWidth: 2, borderColor: '#fff' }
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(34, 197, 94, 0.2)' },
            { offset: 1, color: 'rgba(34, 197, 94, 0)' }
          ])
        }
      },
      {
        name: '交易额',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: amounts,
        itemStyle: { color: '#6366f1' },
        lineStyle: { width: 3, cap: 'round' },
        showSymbol: false,
        emphasis: {
          focus: 'series',
          itemStyle: { borderWidth: 2, borderColor: '#fff' }
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(99, 102, 241, 0.2)' },
            { offset: 1, color: 'rgba(99, 102, 241, 0)' }
          ])
        }
      }
    ]
  })
}

// 初始化分类占比图表
const initCategoryChart = async () => {
  if (!categoryChartRef.value) return

  categoryChart = echarts.init(categoryChartRef.value)

  try {
    const res = await getCategoryStats()

    const isEmpty = !res?.length || res.every(item => !item.count || item.count === 0)
    categoryChartData.isEmpty = isEmpty
    if (isEmpty) return

    const data = res.map(item => ({
      value: item.count,
      name: item.categoryName
    }))

    categoryChart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: [10, 14],
        textStyle: { color: '#1a1a1a', fontSize: 13 },
        extraCssText: 'border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);'
      },
      legend: {
        orient: 'horizontal',
        bottom: 8,
        left: 'center',
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 16,
        textStyle: { color: '#6b7280', fontSize: 11 }
      },
      series: [{
        type: 'pie',
        radius: ['50%', '72%'],
        center: ['50%', '42%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 3
        },
        label: { show: false },
        emphasis: {
          scale: true,
          scaleSize: 8,
          label: { show: true, fontSize: 14, fontWeight: 'bold' }
        },
        data: data,
        color: ['#22c55e', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']
      }]
    })
  } catch (error) {
    categoryChartData.isEmpty = true
  }
}

// 初始化用户增长图表
const initUserChart = async () => {
  if (!userChartRef.value) return

  userChart = echarts.init(userChartRef.value)

  try {
    const res = await getUserGrowth(7)
    updateUserChart(res.dates, res.userCounts)
  } catch (error) {
    userChartData.isEmpty = true
  }
}

// 更新用户增长图表
const updateUserChart = (dates: string[], userCounts: number[]) => {
  if (!userChart) return

  const isEmpty = !dates?.length || !userCounts?.length || userCounts.every(v => v === 0)
  userChartData.isEmpty = isEmpty
  if (isEmpty) return

  userChart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: [12, 16],
      textStyle: { color: '#1a1a1a', fontSize: 13 },
      extraCssText: 'border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: 0,
      right: 0,
      bottom: 0,
      top: 30,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#9ca3af', fontSize: 11, margin: 12 }
    },
    yAxis: {
      type: 'value',
      name: '用户数',
      nameTextStyle: { color: '#9ca3af', fontSize: 11, padding: [0, 40, 0, 0] },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#9ca3af', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } }
    },
    series: [{
      type: 'bar',
      data: userCounts,
      barWidth: '40%',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#22c55e' },
          { offset: 1, color: '#16a34a' }
        ]),
        borderRadius: [6, 6, 0, 0]
      },
      emphasis: {
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#4ade80' },
            { offset: 1, color: '#22c55e' }
          ])
        }
      }
    }]
  })
}

// 初始化订单状态分布图表
const initOrderStatusChart = async () => {
  if (!orderStatusChartRef.value) return

  orderStatusChart = echarts.init(orderStatusChartRef.value)

  try {
    const res = await getOrderStatusDistribution()

    const isEmpty = !res?.length || res.every(item => !item.count || item.count === 0)
    orderStatusChartData.isEmpty = isEmpty
    if (isEmpty) return

    const data = res.map(item => ({
      name: item.statusText,
      value: item.count
    }))

    orderStatusChart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: [10, 14],
        textStyle: { color: '#1a1a1a', fontSize: 13 },
        extraCssText: 'border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);'
      },
      legend: {
        bottom: 8,
        left: 'center',
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 16,
        textStyle: { color: '#6b7280', fontSize: 11 }
      },
      series: [{
        type: 'pie',
        radius: ['50%', '72%'],
        center: ['50%', '42%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 3
        },
        label: { show: false },
        emphasis: {
          scale: true,
          scaleSize: 8,
          label: { show: true, fontSize: 14, fontWeight: 'bold' }
        },
        data: data,
        color: ['#22c55e', '#f59e0b', '#6366f1', '#8b5cf6', '#ef4444', '#6b7280']
      }]
    })
  } catch (error) {
    orderStatusChartData.isEmpty = true
  }
}

const handleResize = () => {
  orderChart?.resize()
  categoryChart?.resize()
  userChart?.resize()
  orderStatusChart?.resize()
}

onMounted(async () => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)

  await Promise.all([loadStats(), loadLatestData()])

  await Promise.all([
    initOrderChart(),
    initCategoryChart(),
    initUserChart(),
    initOrderStatusChart()
  ])

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
  window.removeEventListener('resize', handleResize)
  orderChart?.dispose()
  categoryChart?.dispose()
  userChart?.dispose()
  orderStatusChart?.dispose()
})
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;

.dashboard-container {
  padding: 24px;
  background: $bg-page;
  min-height: 100%;
}

// 欢迎横幅
.welcome-banner {
  position: relative;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: $radius-xl;
  padding: 28px 32px;
  margin-bottom: 24px;
  overflow: hidden;

  .welcome-content {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .welcome-title {
    font-size: 22px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 8px;
    letter-spacing: -0.02em;
  }

  .welcome-desc {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }

  .welcome-time {
    text-align: right;

    .time-value {
      font-size: 36px;
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.02em;
      font-variant-numeric: tabular-nums;
    }

    .time-date {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.6);
      margin-top: 4px;
    }
  }

  .welcome-decoration {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    pointer-events: none;
  }

  .decoration-circle {
    position: absolute;
    border-radius: 50%;

    &--1 {
      width: 200px;
      height: 200px;
      top: -100px;
      right: 100px;
      background: rgba(34, 197, 94, 0.15);
    }

    &--2 {
      width: 150px;
      height: 150px;
      bottom: -75px;
      right: 200px;
      background: rgba(99, 102, 241, 0.1);
    }

    &--3 {
      width: 100px;
      height: 100px;
      top: 20px;
      right: 300px;
      background: rgba(245, 158, 11, 0.08);
    }
  }
}

// 统计卡片
.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  position: relative;
  background: $bg-card;
  border-radius: $radius-lg;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: $shadow-sm;
  transition: all $transition-normal;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-lg;
  }

  &--highlight {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(34, 197, 94, 0.02) 100%);
    border: 1px solid rgba(34, 197, 94, 0.1);
  }

  &__icon {
    width: 48px;
    height: 48px;
    border-radius: $radius-md;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;

    &--primary {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%);
      color: $primary-color;
    }

    &--success {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.05) 100%);
      color: #6366f1;
    }

    &--warning {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%);
      color: #f59e0b;
    }

    &--danger {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%);
      color: #ef4444;
    }
  }

  &__body {
    margin-bottom: 12px;
  }

  &__value {
    font-size: 28px;
    font-weight: 700;
    color: $text-primary;
    line-height: 1;
    letter-spacing: -0.02em;

    .currency {
      font-size: 18px;
      font-weight: 600;
      margin-right: 2px;
    }
  }

  &__label {
    font-size: 13px;
    color: $text-secondary;
    margin-top: 8px;
  }

  &__trend {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    padding: 4px 10px;
    border-radius: $radius-sm;
    background: rgba(34, 197, 94, 0.08);
    color: $primary-color;

    .el-icon {
      font-size: 10px;
    }
  }

  &__footer {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid $border-light;

    .today-amount {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: $text-secondary;

      .el-icon {
        color: $primary-color;
      }
    }
  }
}

// 图表卡片
.chart-row {
  margin-bottom: 24px;
}

.chart-card {
  background: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  overflow: hidden;
  transition: all $transition-normal;

  &:hover {
    box-shadow: $shadow-md;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid $border-light;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    font-weight: 600;
    color: $text-primary;

    .title-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%);
      border-radius: $radius-sm;
      display: flex;
      align-items: center;
      justify-content: center;
      color: $primary-color;
      font-size: 16px;

      &--purple {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.05) 100%);
        color: #6366f1;
      }

      &--blue {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%);
        color: #3b82f6;
      }

      &--orange {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%);
        color: #f59e0b;
      }
    }
  }

  &__actions {
    :deep(.el-radio-button__inner) {
      border-radius: $radius-sm;
      font-size: 12px;
      padding: 5px 12px;
      font-weight: 500;
    }

    :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
      background: $primary-color;
      border-color: $primary-color;
      box-shadow: none;
    }
  }

  &__body {
    padding: 16px;
  }
}

.chart-wrapper {
  height: 300px;
}

.chart-container {
  height: 100%;
}

.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: $text-secondary;

  .empty-icon {
    width: 80px;
    height: 80px;
    background: $bg-hover;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    color: $text-placeholder;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}

// 响应式
@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }

  .welcome-banner {
    padding: 20px;

    .welcome-title {
      font-size: 18px;
    }

    .welcome-time .time-value {
      font-size: 28px;
    }
  }

  .stat-card {
    padding: 16px;

    &__icon {
      width: 40px;
      height: 40px;
      margin-bottom: 12px;
    }

    &__value {
      font-size: 24px;
    }
  }

  .chart-wrapper {
    height: 250px;
  }
}
</style>
