<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="closeModal"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-primary to-teal-600 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div class="flex items-center gap-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h2 class="text-xl font-bold">Yêu cầu tư vấn</h2>
            </div>
            <button 
              @click="closeModal"
              class="hover:bg-white/20 rounded-full p-2 transition-colors"
              aria-label="Đóng"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Form Body -->
          <form @submit.prevent="handleSubmit" class="p-6 space-y-5 overflow-y-auto flex-1">
            <!-- Họ tên -->
            <div>
              <label for="fullName" class="block text-sm font-semibold text-gray-700 mb-2">
                Họ và tên <span class="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                v-model="formData.fullName"
                type="text"
                required
                placeholder="Nhập họ và tên của bạn"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                :class="{ 'border-red-500': errors.fullName }"
              />
              <p v-if="errors.fullName" class="mt-1 text-sm text-red-500">{{ errors.fullName }}</p>
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">
                Email <span class="text-red-500">*</span>
              </label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                required
                placeholder="example@email.com"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                :class="{ 'border-red-500': errors.email }"
              />
              <p v-if="errors.email" class="mt-1 text-sm text-red-500">{{ errors.email }}</p>
            </div>

            <!-- Số điện thoại -->
            <div>
              <label for="phone" class="block text-sm font-semibold text-gray-700 mb-2">
                Số điện thoại <span class="text-red-500">*</span>
              </label>
              <input
                id="phone"
                v-model="formData.phone"
                type="tel"
                required
                placeholder="0123 456 789"
                pattern="[0-9]{10,11}"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                :class="{ 'border-red-500': errors.phone }"
              />
              <p v-if="errors.phone" class="mt-1 text-sm text-red-500">{{ errors.phone }}</p>
            </div>

            <!-- Địa chỉ (tự động hoặc nhập tay) -->
            <div>
              <label for="address" class="block text-sm font-semibold text-gray-700 mb-2">
                Địa chỉ
                <span v-if="isLoadingLocation" class="text-xs text-muted ml-2">(Đang lấy vị trí...)</span>
              </label>
              <div class="relative">
                <input
                  id="address"
                  v-model="formData.address"
                  type="text"
                  placeholder="Nhập địa chỉ của bạn"
                  class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
                <button
                  type="button"
                  @click="getLocation"
                  :disabled="isLoadingLocation"
                  class="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-teal-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Tự động lấy vị trí hiện tại"
                >
                  <svg class="w-5 h-5" :class="{ 'animate-spin': isLoadingLocation }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              <p class="mt-1 text-xs text-muted">Có thể nhập tay hoặc nhấn biểu tượng để tự động lấy vị trí</p>
            </div>

            <!-- Ghi chú -->
            <div>
              <label for="note" class="block text-sm font-semibold text-gray-700 mb-2">
                Ghi chú
              </label>
              <textarea
                id="note"
                v-model="formData.note"
                rows="4"
                placeholder="Mô tả chi tiết nhu cầu tư vấn của bạn..."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
              ></textarea>
            </div>

            <!-- Buttons -->
            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                Hủy
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                <svg v-if="isSubmitting" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ isSubmitting ? 'Đang gửi...' : 'Xác nhận' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Success Modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="showSuccessModal"
        class="fixed inset-0 z-[101] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="closeSuccessModal"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4">
            <div class="flex items-center justify-center gap-3">
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <!-- Body -->
          <div class="p-6 text-center">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Gửi yêu cầu thành công!</h2>
            <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">
              <p class="text-green-800 text-base">
                Yêu cầu tư vấn của bạn đã được gửi thành công!<br />
                Chúng tôi sẽ liên hệ với bạn sớm nhất.
              </p>
            </div>

            <!-- Button -->
            <button
              @click="closeSuccessModal"
              class="w-full px-6 py-3 bg-gradient-to-r from-primary to-teal-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Error Modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="showErrorModal"
        class="fixed inset-0 z-[101] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="closeErrorModal"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4">
            <div class="flex items-center justify-center gap-3">
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <!-- Body -->
          <div class="p-6 text-center">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Có lỗi xảy ra!</h2>
            <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
              <p class="text-red-800 text-base">
                {{ errorMessage }}
              </p>
            </div>

            <!-- Button -->
            <button
              @click="closeErrorModal"
              class="w-full px-6 py-3 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700 hover:shadow-lg transition-all"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  defaultNote?: string
}>(), {
  defaultNote: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [data: any]
}>()

const isOpen = ref(props.modelValue)
const isSubmitting = ref(false)
const isLoadingLocation = ref(false)

const formData = reactive({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  note: ''
})

const errors = reactive({
  fullName: '',
  email: '',
  phone: ''
})

// Watch for external changes
watch(() => props.modelValue, (newVal) => {
  isOpen.value = newVal
  if (newVal) {
    // Set default note if provided
    if (props.defaultNote) {
      formData.note = props.defaultNote
    }
    // Auto get location when modal opens
    setTimeout(() => {
      getLocation()
    }, 500)
  }
})

const closeModal = () => {
  isOpen.value = false
  emit('update:modelValue', false)
}

const getLocation = async () => {
  if (!navigator.geolocation) {
    formData.address = ''
    return
  }

  isLoadingLocation.value = true
  
  // Create a timeout promise (5 seconds)
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), 5000)
  })
  
  // Create geolocation promise
  const locationPromise = new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        try {
          // Use Nominatim OpenStreetMap API for reverse geocoding (free)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=vi`
          )
          const data = await response.json()
          
          if (data.display_name) {
            resolve(data.display_name)
          } else {
            resolve(`Tọa độ: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
          }
        } catch (error) {
          console.error('Error getting address:', error)
          resolve(`Tọa độ: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        }
      },
      (error) => {
        reject(error)
      }
    )
  })
  
  try {
    // Race between location and timeout
    const address = await Promise.race([locationPromise, timeoutPromise])
    formData.address = address as string
  } catch (error) {
    console.error('Error getting location:', error)
    // Don't set any default, let user input manually
    formData.address = ''
  } finally {
    isLoadingLocation.value = false
  }
}

const validateForm = () => {
  let isValid = true
  
  // Reset errors
  errors.fullName = ''
  errors.email = ''
  errors.phone = ''

  // Validate full name
  if (!formData.fullName.trim()) {
    errors.fullName = 'Vui lòng nhập họ và tên'
    isValid = false
  } else if (formData.fullName.trim().length < 3) {
    errors.fullName = 'Họ và tên phải có ít nhất 3 ký tự'
    isValid = false
  }

  // Validate email
  if (!formData.email.trim()) {
    errors.email = 'Vui lòng nhập email'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Email không hợp lệ'
    isValid = false
  }

  // Validate phone
  if (!formData.phone.trim()) {
    errors.phone = 'Vui lòng nhập số điện thoại'
    isValid = false
  } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
    errors.phone = 'Số điện thoại phải có 10-11 chữ số'
    isValid = false
  }

  return isValid
}

const showSuccessModal = ref(false)
const showErrorModal = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    const config = useRuntimeConfig()
    // Call real API
    const response = await $fetch(`${config.public.apiBase}/consultants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        location: formData.address || 'Không có',
        note: formData.note || ''
      }
    })
    
    // Emit data to parent
    emit('submit', { ...formData })
    
    // Show success modal
    showSuccessModal.value = true
    
    // Reset form
    formData.fullName = ''
    formData.email = ''
    formData.phone = ''
    formData.address = ''
    formData.note = ''
    
    // Close main modal
    closeModal()
  } catch (error: any) {
    console.error('Error submitting:', error)
    errorMessage.value = error.data?.error?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.'
    showErrorModal.value = true
  } finally {
    isSubmitting.value = false
  }
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
}

const closeErrorModal = () => {
  showErrorModal.value = false
}
</script>

<style scoped>
/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.modal-enter-from .bg-white {
  transform: scale(0.9) translateY(20px);
}

.modal-leave-to .bg-white {
  transform: scale(0.9) translateY(20px);
}
</style>
