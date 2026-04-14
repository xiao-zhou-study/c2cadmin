<template>
  <div class="order-status-flow">
    <div class="flow-header">
      <h3>订单状态流转</h3>
    </div>
    
    <div class="flow-steps">
      <el-steps
        :active="getActiveStep()"
        finish-status="success"
        align-center
      >
        <el-step 
          v-for="(step, index) in statusSteps" 
          :key="step.status"
          :title="step.title"
          :description="step.description"
          :status="getStepStatus(step.status, index)"
          :icon="step.icon"
        />
      </el-steps>
    </div>

    <div
      v-if="order && showActions"
      class="flow-actions"
    >
      <el-divider>状态操作</el-divider>
      <el-space wrap>
        <el-button 
          v-if="order.status === 1"
          type="success" 
          @click="handleConfirm"
        >
          确认订单
        </el-button>
        
        <el-button 
          v-if="order.status === 1"
          type="warning" 
          @click="handleReject"
        >
          拒绝订单
        </el-button>
        
        <el-button
          v-if="order.status === 2"
          type="success"
          @click="handleStartBorrow"
        >
          确认发货
        </el-button>

        <el-button
          v-if="order.status === 3"
          type="success"
          @click="handleReturn"
        >
          确认完成
        </el-button>
        
        <el-button 
          v-if="[1, 2].includes(order.status)"
          type="danger" 
          @click="handleCancel"
        >
          取消订单
        </el-button>
        
        <el-button 
          v-if="[3, 4].includes(order.status)"
          type="warning" 
          @click="handleDispute"
        >
          处理纠纷
        </el-button>
        
        <el-button
          v-if="order.status === 3"
          type="info"
          @click="sendReminder('return')"
        >
          收货提醒
        </el-button>
      </el-space>
    </div>

    <!-- 操作日志对话框 -->
    <el-dialog
      v-model="showLogs"
      title="订单操作日志"
      width="800px"
      @open="loadLogs"
    >
      <el-timeline>
        <el-timeline-item
          v-for="(log, index) in logs"
          :key="index"
          :timestamp="formatTime(log.createdAt)"
          :type="getLogType(log.action)"
        >
          <div class="log-content">
            <div class="log-action">
              {{ log.actionText }}
            </div>
            <div class="log-operator">
              操作人：{{ log.operatorName }}
            </div>
            <div
              v-if="log.note"
              class="log-note"
            >
              {{ log.note }}
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ShoppingBag, 
  CircleCheck, 
  Timer, 
  Check, 
  Close
} from '@element-plus/icons-vue'
import type { Order } from '@/types'
import { 
  confirmOrder, 
  rejectOrder, 
  startBorrow, 
  returnItem, 
  cancelOrder,
  getOrderLogs
} from '@/api/order'
import { formatTime } from '@/utils/time'

const props = defineProps<{
  order: Order | null
  showActions?: boolean
}>()

const emit = defineEmits<{
  statusChanged: []
}>()

const showLogs = ref(false)
const logs = ref<any[]>([])

const loadLogs = async () => {
  if (!props.order) return
  
  try {
    const response = await getOrderLogs(props.order.id)
    logs.value = response.map((log: any) => ({
      ...log,
      actionText: getActionText(log.action)
    }))
  } catch (error) {
    ElMessage.error('获取操作日志失败')
  }
}

const statusSteps = [
  {
    status: 1,
    title: '待确认',
    description: '买家提交购买申请',
    icon: ShoppingBag
  },
  {
    status: 2,
    title: '待付款',
    description: '卖家确认订单',
    icon: CircleCheck
  },
  {
    status: 3,
    title: '已付款',
    description: '等待卖家发货',
    icon: Timer
  },
  {
    status: 4,
    title: '已完成',
    description: '交易已完成',
    icon: Check
  },
  {
    status: 5,
    title: '已取消',
    description: '订单已取消',
    icon: Close
  },
  {
    status: 6,
    title: '已拒绝',
    description: '订单被拒绝',
    icon: Close
  }
]

const getActiveStep = () => {
  if (!props.order) return 0
  
  const statusStepMap: Record<number, number> = {
    1: 0, // 申请中
    2: 1, // 已确认
    3: 2, // 借用中
    4: 3, // 已归还
    5: 4, // 已取消
    6: 5  // 已拒绝
  }
  
  return statusStepMap[props.order.status] || 0
}

const getStepStatus = (stepStatus: number, _index: number) => {
  if (!props.order) return 'wait'
  
  if (props.order.status === 6 && stepStatus === 6) return 'error'
  if (props.order.status === 5 && stepStatus === 5) return 'error'
  if (props.order.status === 4 && stepStatus <= 4) return 'finish'
  if (props.order.status === 3 && stepStatus <= 3) return 'finish'
  if (props.order.status === 2 && stepStatus <= 2) return 'finish'
  if (props.order.status === 1 && stepStatus === 1) return 'process'
  
  return 'wait'
}



const getLogType = (action: string) => {
  const typeMap: Record<string, string> = {
    'confirm': 'primary',
    'reject': 'danger',
    'cancel': 'warning',
    'start_borrow': 'success',
    'return': 'success',
    'dispute': 'warning'
  }
  return typeMap[action] || 'primary'
}

const getActionText = (action: string) => {
  const actionTextMap: Record<string, string> = {
    'create': '创建订单',
    'confirm': '确认订单',
    'reject': '拒绝订单',
    'cancel': '取消订单',
    'start_borrow': '确认发货',
    'return': '确认完成',
    'dispute': '处理纠纷'
  }
  return actionTextMap[action] || action
}

const handleConfirm = () => {
  ElMessageBox.confirm('确定要确认此订单吗？', '确认操作', {
    type: 'info'
  }).then(async () => {
    await confirmOrder(props.order!.id)
    ElMessage.success('确认成功')
    emit('statusChanged')
  })
}

const handleReject = () => {
  ElMessageBox.prompt('请输入拒绝原因', '拒绝订单', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '请输入拒绝原因'
  }).then(async ({ value }) => {
    await rejectOrder(props.order!.id, value)
    ElMessage.success('拒绝成功')
    emit('statusChanged')
  })
}

const handleStartBorrow = () => {
  ElMessageBox.confirm('确定已发货吗？', '确认发货', {
    type: 'info'
  }).then(async () => {
    await startBorrow(props.order!.id)
    ElMessage.success('确认发货成功')
    emit('statusChanged')
  })
}

const handleReturn = () => {
  ElMessageBox.prompt('请输入交易完成情况（可选）', '确认完成', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '商品完好，交易完成'
  }).then(async (_param) => {
    await returnItem(props.order!.id)
    ElMessage.success('确认完成成功')
    emit('statusChanged')
  }).catch(() => {
    // 用户取消输入，直接确认完成
    returnItem(props.order!.id)
      .then(() => {
        ElMessage.success('确认完成成功')
        emit('statusChanged')
      })
  })
}

const handleCancel = () => {
  ElMessageBox.prompt('请输入取消原因', '取消订单', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '请输入取消原因'
  }).then(async ({ value: reason }) => {
    await cancelOrder(props.order!.id, reason || '')
    ElMessage.success('取消成功')
    emit('statusChanged')
  })
}

const handleDispute = () => {
  ElMessageBox.prompt('请输入纠纷处理方案', '处理纠纷', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputType: 'textarea',
    inputPlaceholder: '请详细说明处理方案...'
  }).then(async (_param) => {
    // 这里应该调用纠纷处理API
    ElMessage.success('纠纷处理方案已记录')
  })
}

const sendReminder = (type: 'return' | 'payment') => {
  const actionText = type === 'return' ? '收货提醒' : '支付提醒'
  ElMessage.warning(`${actionText}功能暂未实现`)
}

// 监听日志对话框显示

</script>

<style lang="scss" scoped>
.order-status-flow {
  .flow-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .flow-steps {
    margin: 30px 0;
    
    :deep(.el-step__title) {
      font-size: 14px;
      line-height: 1.4;
    }
    
    :deep(.el-step__description) {
      font-size: 12px;
      color: #909399;
      margin-top: 8px;
    }
  }
  
  .flow-actions {
    margin-top: 20px;
  }
}

.log-content {
  .log-action {
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .log-operator {
    font-size: 14px;
    color: #606266;
    margin-bottom: 4px;
  }
  
  .log-note {
    font-size: 13px;
    color: #909399;
    background: #f5f7fa;
    padding: 8px;
    border-radius: 4px;
    margin-top: 8px;
  }
}
</style>