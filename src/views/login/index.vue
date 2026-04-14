<template>
  <div class="login-container">
    <!-- 左侧装饰区域 -->
    <div class="login-decoration">
      <div class="decoration-content">
        <div class="decoration-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h1 class="decoration-title">校园二手交易平台</h1>
        <p class="decoration-desc">让闲置焕发新生，打造绿色校园</p>
        <div class="decoration-features">
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon><Goods /></el-icon>
            </div>
            <span>便捷交易</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon><User /></el-icon>
            </div>
            <span>安全可靠</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <span>绿色环保</span>
          </div>
        </div>
      </div>
      <div class="decoration-bg" />
    </div>

    <!-- 右侧登录区域 -->
    <div class="login-section">
      <div class="login-card">
        <!-- Logo & 标题 -->
        <div class="login-header">
          <div class="logo-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 class="title">欢迎回来</h1>
          <p class="subtitle">登录管理后台</p>
        </div>

        <!-- 登录表单 -->
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              size="large"
              clearable
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <div class="form-options">
            <el-checkbox v-model="rememberMe">
              <span class="remember-text">记住我</span>
            </el-checkbox>
          </div>

          <el-form-item>
            <el-button
              type="primary"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              <span v-if="!loading">登 录</span>
              <span v-else>登录中...</span>
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-footer">
          <span>校园二手交易平台 · 管理后台</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Goods, TrendCharts } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { storage } from '@/utils/storage'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)
const rememberMe = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

// 从本地存储加载记住的登录信息
onMounted(() => {
  const savedLoginInfo = storage.get('login_info')
  if (savedLoginInfo) {
    try {
      const { username, password, remember } = JSON.parse(savedLoginInfo)
      loginForm.username = username
      loginForm.password = password
      rememberMe.value = remember
    } catch (e) {
      console.error('解析保存的登录信息失败:', e)
    }
  }
})

const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        userStore.clearToken()
        await userStore.loginAction({
          username: loginForm.username,
          password: loginForm.password,
          rememberMe: rememberMe.value
        })

        ElMessage.success('登录成功')

        if (rememberMe.value) {
          const loginInfo = {
            username: loginForm.username,
            password: loginForm.password,
            remember: rememberMe.value
          }
          storage.set('login_info', JSON.stringify(loginInfo))
        } else {
          storage.remove('login_info')
        }

        const redirect = route.query.redirect as string
        router.push(redirect || '/')
      } catch (error: any) {
        ElMessage.error(error.message || '登录失败')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;

.login-container {
  min-height: 100vh;
  display: flex;
  background-color: $bg-page;
}

// 左侧装饰区域
.login-decoration {
  flex: 1;
  display: none;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);

  @media (min-width: 992px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.decoration-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 40px;
}

.decoration-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 8px 24px rgba(34, 197, 94, 0.3);

  svg {
    width: 40px;
    height: 40px;
  }
}

.decoration-title {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 12px;
  letter-spacing: -0.02em;
}

.decoration-desc {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 48px;
}

.decoration-features {
  display: flex;
  justify-content: center;
  gap: 32px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  .feature-icon {
    width: 56px;
    height: 56px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $primary-color;
    font-size: 24px;
    transition: all $transition-normal;
  }

  span {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
  }

  &:hover .feature-icon {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-4px);
  }
}

.decoration-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%);
  pointer-events: none;
}

// 右侧登录区域
.login-section {
  width: 100%;
  max-width: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;

  @media (min-width: 992px) {
    flex: 0 0 500px;
  }
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;

  .logo-circle {
    width: 64px;
    height: 64px;
    margin: 0 auto 20px;
    background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    box-shadow: 0 8px 24px rgba(34, 197, 94, 0.3);

    svg {
      width: 32px;
      height: 32px;
    }
  }

  .title {
    font-size: 24px;
    font-weight: 700;
    color: $text-primary;
    margin: 0 0 8px;
    letter-spacing: -0.02em;
  }

  .subtitle {
    font-size: 14px;
    color: $text-secondary;
    margin: 0;
  }
}

.login-form {
  :deep(.el-input__wrapper) {
    padding: 4px 14px;
    border-radius: $radius-md;
    box-shadow: 0 0 0 1px $border-color inset;
    transition: all $transition-fast;

    &:hover {
      box-shadow: 0 0 0 1px darken($border-color, 10%) inset;
    }

    &.is-focus {
      box-shadow: 0 0 0 2px $primary-color inset;
    }
  }

  :deep(.el-input__inner) {
    height: 46px;
    line-height: 46px;
  }

  :deep(.el-form-item) {
    margin-bottom: 24px;
  }
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;

  .remember-text {
    font-size: 13px;
    color: $text-regular;
  }
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 15px;
  font-weight: 600;
  border-radius: $radius-md;
  background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%);
  border: none;
  transition: all $transition-normal;
  letter-spacing: 0.05em;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-primary;
  }

  &:active {
    transform: translateY(0);
  }
}

.login-footer {
  text-align: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid $border-light;

  span {
    font-size: 12px;
    color: $text-secondary;
  }
}

// 响应式
@media (max-width: 480px) {
  .login-section {
    padding: 24px 16px;
  }

  .login-header {
    .logo-circle {
      width: 56px;
      height: 56px;

      svg {
        width: 28px;
        height: 28px;
      }
    }

    .title {
      font-size: 22px;
    }
  }
}
</style>
