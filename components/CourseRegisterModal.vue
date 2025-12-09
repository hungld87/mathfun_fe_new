<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="close"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-primary to-teal-600 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div class="flex items-center gap-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 class="text-xl font-bold">Đăng ký khóa học</h2>
            </div>
            <button 
              @click="close"
              class="hover:bg-white/20 rounded-full p-2 transition-colors"
              aria-label="Đóng"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Form Body -->
          <form @submit.prevent="handleRegister" class="p-6 space-y-5 overflow-y-auto flex-1">
            <!-- Họ tên -->
            <div>
              <label for="fullName" class="block text-sm font-semibold text-gray-700 mb-2">
                Họ và tên <span class="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                v-model="registerForm.fullName"
                type="text"
                required
                placeholder="Nhập họ và tên của bạn"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>

            <!-- Số điện thoại -->
            <div>
              <label for="phone" class="block text-sm font-semibold text-gray-700 mb-2">
                Số điện thoại <span class="text-red-500">*</span>
              </label>
              <input
                id="phone"
                v-model="registerForm.phone"
                type="tel"
                required
                placeholder="0123 456 789"
                pattern="[0-9]{10,11}"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>

            <!-- Lớp -->
            <div>
              <label for="classId" class="block text-sm font-semibold text-gray-700 mb-2">Lớp</label>
              <select 
                id="classId"
                v-model="registerForm.classId"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">Chọn lớp</option>
                <option 
                  v-for="cls in classes" 
                  :key="cls.id" 
                  :value="cls.documentId"
                  :class="{'font-bold': cls.is_highlight}"
                >
                  {{ cls.name }}
                </option>
              </select>
            </div>

            <!-- Môn học -->
            <div>
              <label for="subjectId" class="block text-sm font-semibold text-gray-700 mb-2">Môn học</label>
              <select 
                id="subjectId"
                v-model="registerForm.subjectId"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">Chọn môn học</option>
                <option 
                  v-for="subject in subjects" 
                  :key="subject.id" 
                  :value="subject.documentId"
                >
                  {{ subject.name }}
                </option>
              </select>
            </div>

            <!-- Cấp độ -->
            <div>
              <label for="levelId" class="block text-sm font-semibold text-gray-700 mb-2">Cấp độ</label>
              <select 
                id="levelId"
                v-model="registerForm.levelId"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">Chọn cấp độ</option>
                <option 
                  v-for="level in levels" 
                  :key="level.id" 
                  :value="level.documentId"
                >
                  {{ level.title }}
                </option>
              </select>
            </div>

            <!-- Ghi chú -->
            <div>
              <label for="note" class="block text-sm font-semibold text-gray-700 mb-2">Ghi chú</label>
              <textarea
                id="note"
                v-model="registerForm.note"
                rows="4"
                placeholder="Mô tả chi tiết nhu cầu của bạn..."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
              ></textarea>
            </div>

            <!-- Buttons -->
            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="close"
                class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                Hủy
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                <svg v-if="loading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ loading ? 'Đang xử lý...' : 'Xác nhận' }}</span>
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
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Đăng ký thành công!</h2>
            <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">
              <p class="text-green-800 text-base">
                Đăng ký khóa học của bạn đã được gửi thành công!<br />
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
import { ref, computed, watch } from 'vue'

const props = withDefaults(defineProps<{
  isOpen: boolean
  defaultNote?: string
  courseClass?: any
  courseSubject?: any
  courseLevel?: any
}>(), {
  defaultNote: '',
  courseClass: null,
  courseSubject: null,
  courseLevel: null
})

const emit = defineEmits<{
  close: []
  success: [data: any]
}>()

const loading = ref(false)
const showSuccessModal = ref(false)
const showErrorModal = ref(false)
const errorMessage = ref('')

const registerForm = ref({
  fullName: '',
  phone: '',
  classId: '',
  subjectId: '',
  levelId: '',
  note: ''
})

// Fetch data for dropdowns
const { data: classesResponse } = await useAsyncData('classes-list-register', () => $fetch('/api/mock/classes'))
const classes = computed(() => classesResponse.value?.data || [])

const { data: subjectsResponse } = await useAsyncData('subjects-list', () => $fetch('/api/mock/subjects'))
const subjects = computed(() => subjectsResponse.value?.data || [])

const { data: levelsResponse } = await useAsyncData('levels-list', () => $fetch('/api/mock/levels'))
const levels = computed(() => levelsResponse.value?.data || [])

// Reset form when modal opens/closes
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    registerForm.value = { fullName: '', phone: '', classId: '', subjectId: '', levelId: '', note: '' }
  } else {
    // Auto-fill note
    if (props.defaultNote) {
      registerForm.value.note = props.defaultNote
    }
    // Auto-fill class, subject, level from course
    if (props.courseClass) {
      registerForm.value.classId = props.courseClass.documentId
    }
    if (props.courseSubject) {
      registerForm.value.subjectId = props.courseSubject.documentId
    }
    if (props.courseLevel) {
      registerForm.value.levelId = props.courseLevel.documentId
    }
  }
})

function close() {
  emit('close')
}

async function handleRegister() {
  loading.value = true

  try {
    const config = useRuntimeConfig()
    // Call real API
    const response = await $fetch(`${config.public.apiBase}/course-registers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        name: registerForm.value.fullName,
        phone: registerForm.value.phone,
        note: registerForm.value.note || '',
        level: registerForm.value.levelId || null,
        class: registerForm.value.classId || null,
        subject: registerForm.value.subjectId || null
      }
    })

    // Emit success
    emit('success', response)
    
    // Show success modal
    showSuccessModal.value = true
    
    // Reset form
    registerForm.value = { fullName: '', phone: '', classId: '', subjectId: '', levelId: '', note: '' }
    
    // Close main modal
    close()
  } catch (err: any) {
    console.error('Error submitting:', err)
    errorMessage.value = err.data?.error?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.'
    showErrorModal.value = true
  } finally {
    loading.value = false
  }
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
}

const closeErrorModal = () => {
  showErrorModal.value = false
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
