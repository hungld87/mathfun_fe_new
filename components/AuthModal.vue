<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4" @click.self="close">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="close"></div>
        
        <!-- Modal -->
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
          <!-- Background Image -->
          <div class="absolute inset-0 z-0 rounded-2xl overflow-hidden">
            <img 
              src="/math-fun-login.jpg" 
              alt="Math Fun Background" 
              class="w-full h-full object-cover opacity-20"
            />
          </div>

          <!-- Close Button -->
          <button 
            @click="close"
            class="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition z-20 bg-white/80 rounded-full p-1"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div class="relative z-10 p-8 max-h-[90vh] overflow-y-auto">
            <!-- Login Form -->
            <div v-if="mode === 'login'">
              <h2 class="text-3xl font-bold text-gray-900 mb-2">Đăng nhập</h2>
              <p class="text-gray-600 mb-6">Chào mừng bạn quay trở lại!</p>

              <!-- Login Form Fields -->
              <form @submit.prevent="handleLogin" class="space-y-4">
                <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {{ error }}
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input 
                    v-model="loginForm.email"
                    type="email"
                    required
                    class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu</label>
                  <input 
                    v-model="loginForm.password"
                    type="password"
                    required
                    class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                    placeholder="••••••••"
                  />
                </div>

                <button 
                  type="submit"
                  :disabled="loading"
                  class="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-teal-600 hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ loading ? 'Đang xử lý...' : 'Đăng nhập' }}
                </button>
              </form>

              <div class="mt-6 text-center">
                <button 
                  @click="mode = 'register'"
                  class="text-primary hover:text-teal-600 font-semibold transition"
                >
                  Chưa có tài khoản? Đăng ký ngay
                </button>
              </div>
            </div>

            <!-- Register Form -->
            <div v-else-if="mode === 'register'">
              <h2 class="text-3xl font-bold text-gray-900 mb-2">Đăng ký</h2>
              <p class="text-gray-600 mb-6">Tạo tài khoản mới để bắt đầu học!</p>

              <form @submit.prevent="handleRegister" class="space-y-4">
                <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {{ error }}
                </div>

                <div v-if="successMessage" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {{ successMessage }}
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Họ tên <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="registerForm.fullName"
                    type="text"
                    required
                    class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="registerForm.email"
                    type="email"
                    required
                    class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Mật khẩu <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="registerForm.password"
                    type="password"
                    required
                    minlength="6"
                    class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                    placeholder="Ít nhất 6 ký tự"
                  />
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                  <input 
                    v-model="registerForm.phone"
                    type="tel"
                    class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                    placeholder="0912345678"
                  />
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Lớp</label>
                  <select 
                    v-model="registerForm.classId"
                    class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition appearance-none cursor-pointer"
                  >
                    <option value="">Chọn lớp</option>
                    <option 
                      v-for="cls in classes" 
                      :key="cls.documentId" 
                      :value="cls.documentId"
                      :class="{'font-bold': cls.is_highlight}"
                    >
                      {{ cls.name }}
                    </option>
                  </select>
                </div>

                <button 
                  type="submit"
                  :disabled="loading"
                  class="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-teal-600 hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ loading ? 'Đang xử lý...' : 'Đăng ký' }}
                </button>
              </form>

              <div class="mt-6 text-center">
                <button 
                  @click="mode = 'login'"
                  class="text-primary hover:text-teal-600 font-semibold transition"
                >
                  Đã có tài khoản? Đăng nhập
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  success: [data: any]
}>()

const mode = ref<'login' | 'register'>('login')
const loading = ref(false)
const error = ref('')
const successMessage = ref('')

const loginForm = ref({
  email: '',
  password: ''
})

const registerForm = ref({
  fullName: '',
  email: '',
  password: '',
  phone: '',
  classId: ''
})

// Fetch classes for register form
const { data: classesResponse } = await useAsyncData('classes-list', () => $fetch('/api/mock/classes'))
const classes = computed(() => classesResponse.value?.data || [])

// Reset form when modal opens/closes or mode changes
watch([() => props.isOpen, mode], () => {
  error.value = ''
  successMessage.value = ''
  if (!props.isOpen) {
    loginForm.value = { email: '', password: '' }
    registerForm.value = { fullName: '', email: '', password: '', phone: '', classId: '' }
    mode.value = 'login'
  }
})

function close() {
  emit('close')
}

async function handleLogin() {
  error.value = ''
  loading.value = true

  try {
    const response = await $fetch('/api/mock/auth/login', {
      method: 'POST',
      body: loginForm.value
    })

    if (response.status === 'ok') {
      // Save JWT token and user data to localStorage
      if (process.client) {
        localStorage.setItem('jwt', response.data.jwt)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      
      emit('success', response.data)
      close()
    } else {
      error.value = response.message || 'Đăng nhập thất bại'
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  error.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    const response = await $fetch('/api/mock/auth/register', {
      method: 'POST',
      body: registerForm.value
    })

    if (response.status === 'ok') {
      // Save JWT token and user data to localStorage
      if (process.client) {
        localStorage.setItem('jwt', response.data.jwt)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      
      successMessage.value = response.message
      
      // Close modal and notify parent after short delay
      setTimeout(() => {
        emit('success', response.data)
        close()
      }, 1500)
    } else {
      error.value = response.message || 'Đăng ký thất bại'
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
  } finally {
    loading.value = false
  }
}

// Prevent body scroll when modal is open
watch(() => props.isOpen, (isOpen) => {
  if (process.client) {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div:last-child,
.modal-leave-active > div:last-child {
  transition: transform 0.3s ease;
}

.modal-enter-from > div:last-child,
.modal-leave-to > div:last-child {
  transform: scale(0.95);
}
</style>
