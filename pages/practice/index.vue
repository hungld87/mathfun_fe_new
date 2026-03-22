<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

definePageMeta({
  title: 'Luyện Đề · MathFun',
  meta: [
    { name: 'description', content: 'Luyện đề từ các trường top đầu' }
  ]
})

// Fetch practices data directly from Strapi backend
const config = useRuntimeConfig()
const apiBase = config.public.apiBase

const { data: practicesResponse, error: practicesError } = await useAsyncData('practices-list', async () => {
  try {
    const response = await $fetch(`${apiBase}/practices/full`)
    
    // Transform Strapi data to frontend format
    const practices = response.data || []
    return {
      status: 'ok',
      data: practices.map((practice: any) => ({
        id: practice.id,
        documentId: practice.documentId,
        slug: practice.slug,
        title: practice.title,
        duration_time: practice.duration_time,
        thumb: practice.thumb?.url || null,
        class: practice.class ? {
          id: practice.class.id,
          documentId: practice.class.documentId,
          name: practice.class.name,
          is_highlight: practice.class.is_highlight || false
        } : null,
        level: practice.level ? {
          id: practice.level.id,
          documentId: practice.level.documentId,
          title: practice.level.title,
          description: practice.level.description
        } : null,
        subject: practice.subject ? {
          id: practice.subject.id,
          documentId: practice.subject.documentId,
          name: practice.subject.name,
          isDisplay: practice.subject.isDisplay,
          icon: practice.subject.icon?.url || null
        } : null,
        createdAt: practice.createdAt,
        updatedAt: practice.updatedAt,
        publishedAt: practice.publishedAt
      }))
    }
  } catch (error) {
    console.error('Error fetching practices:', error)
    return { status: 'error', data: [] }
  }
})

const allPractices = computed(() => {
  // Debug: Log the response
  if (process.client) {
    console.log('Practices Response:', practicesResponse.value)
    if (practicesError.value) {
      console.error('Practices Error:', practicesError.value)
    }
  }
  return practicesResponse.value?.data || []
})

// User authentication state - check directly from localStorage
const isAuthenticated = ref(false)

// Check authentication on client side
if (process.client) {
  const token = localStorage.getItem('jwt')
  isAuthenticated.value = !!token
}

// User's completed practices (Map of practice documentId -> submission data)
const completedPractices = ref<Map<string, any>>(new Map())

// Fetch user's completed practices
const fetchCompletedPractices = async () => {
  if (!isAuthenticated.value) {
    completedPractices.value = new Map()
    return
  }

  try {
    // Get all user's submissions
    const token = localStorage.getItem('jwt')
    if (!token) {
      completedPractices.value = new Map()
      return
    }

    // Fetch all submissions without filtering by specific practice - call Strapi directly
    const apiBase = 'http://127.0.0.1:1337/api'
    const response = await $fetch(`${apiBase}/practice-scorings/my-history`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    // Build a map of practice documentId -> submission
    const newMap = new Map()
    if (response?.data && Array.isArray(response.data)) {
      response.data.forEach((submission: any) => {
        // API returns practiceId field
        if (submission.practiceId) {
          newMap.set(submission.practiceId, submission)
        }
      })
    }
    
    completedPractices.value = newMap
  } catch (error) {
    console.error('Failed to fetch completed practices:', error)
    completedPractices.value = new Map()
  }
}

// Check if a practice is completed
const isPracticeCompleted = (documentId: string) => {
  return completedPractices.value.has(documentId)
}

// Fetch completed practices on mount and when auth state changes
onMounted(() => {
  fetchCompletedPractices()
  
  // Listen for auth changes (when user logs in/out)
  if (process.client) {
    window.addEventListener('storage', handleStorageChange)
  }
})

// Handle storage changes (login/logout in other tabs)
const handleStorageChange = (e: StorageEvent) => {
  if (e.key === 'jwt') {
    const token = e.newValue
    isAuthenticated.value = !!token
    fetchCompletedPractices()
  }
}

// Cleanup on unmount
onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('storage', handleStorageChange)
  }
})

// Fetch filter data from Strapi
const { data: classesData } = await useAsyncData('filter-classes', async () => {
  const response = await $fetch(`${apiBase}/classes`)
  return response.data || []
})

const { data: subjectsData } = await useAsyncData('filter-subjects', async () => {
  const response = await $fetch(`${apiBase}/subjects`)
  return response.data || []
})

const { data: levelsData } = await useAsyncData('filter-levels', async () => {
  const response = await $fetch(`${apiBase}/levels`)
  return response.data || []
})

const filterClasses = computed(() => classesData.value || [])
const filterSubjects = computed(() => subjectsData.value || [])
const filterLevels = computed(() => levelsData.value || [])

// Filters
const selectedClass = ref('')
const selectedSubject = ref('')
const selectedLevel = ref('')

// Pagination
const itemsPerPage = 12
const currentPage = ref(1)

// Filtered data
const filteredPractices = computed(() => {
  let result = [...allPractices.value]
  
  if (selectedClass.value) {
    result = result.filter(p => p.class?.id === selectedClass.value)
  }
  
  if (selectedSubject.value) {
    result = result.filter(p => p.subject?.id === selectedSubject.value)
  }

  if (selectedLevel.value) {
    result = result.filter(p => p.level?.id === selectedLevel.value)
  }
  
  return result
})

const displayedPractices = computed(() => {
  return filteredPractices.value.slice(0, currentPage.value * itemsPerPage)
})

const hasMore = computed(() => {
  return displayedPractices.value.length < filteredPractices.value.length
})

const loadMore = () => {
  currentPage.value++
}

const resetFilters = () => {
  selectedClass.value = ''
  selectedSubject.value = ''
  selectedLevel.value = ''
  currentPage.value = 1
}

// Reset to page 1 when filters change
watch([selectedClass, selectedSubject, selectedLevel], () => {
  currentPage.value = 1
})

// Handle start practice - clear old data ONLY if not completed yet
const startPractice = (slug: string, documentId: string) => {
  // Check if this practice is already completed
  const isCompleted = isPracticeCompleted(documentId)
  
  // If completed, just navigate to view results (don't clear storage)
  if (isCompleted) {
    navigateTo(`/practice/${slug}`)
    return
  }
  
  // For new attempts: clear localStorage
  let userEmail = 'guest'
  if (process.client) {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        userEmail = user.email || user.id || 'guest'
      } catch (e) {
        console.error('Failed to parse user data:', e)
      }
    }
    
    // Clear all localStorage for this practice with user email
    localStorage.removeItem(`practice_time_${userEmail}_${documentId}`)
    localStorage.removeItem(`practice_answers_${userEmail}_${documentId}`)
    localStorage.removeItem(`practice_start_${userEmail}_${documentId}`)
  }
  
  // Navigate to practice page using slug (pretty URL)
  navigateTo(`/practice/${slug}`)
}
</script>

<template>
  <main class="bg-background">
    <div class="container mx-auto px-6 py-10 max-w-content">
      <h1 class="text-3xl font-bold text-primary mb-8">Luyện Đề</h1>
      
      <!-- Filters -->
      <div class="mb-8 bg-white rounded-xl shadow-sm p-6">
        <div class="flex flex-wrap gap-4 items-end">
          <!-- Class Filter -->
          <div class="relative flex-1 min-w-[200px]">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Lớp</label>
            <select 
              v-model="selectedClass"
              class="appearance-none w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-gray-700 hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition cursor-pointer"
            >
              <option value="">Tất cả lớp</option>
              <option 
                v-for="cls in filterClasses" 
                :key="cls.id" 
                :value="cls.id"
                :class="{'font-bold': cls.is_highlight}"
              >
                {{ cls.name }}
              </option>
            </select>
            <div class="absolute right-3 bottom-2.5 pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>

          <!-- Subject Filter -->
          <div class="relative flex-1 min-w-[200px]">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Môn học</label>
            <select 
              v-model="selectedSubject"
              class="appearance-none w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-gray-700 hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition cursor-pointer"
            >
              <option value="">Tất cả môn học</option>
              <option 
                v-for="subject in filterSubjects" 
                :key="subject.id" 
                :value="subject.id"
              >
                {{ subject.name }}
              </option>
            </select>
            <div class="absolute right-3 bottom-2.5 pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>

          <!-- Level Filter -->
          <div class="relative flex-1 min-w-[200px]">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Cấp độ</label>
            <select 
              v-model="selectedLevel"
              class="appearance-none w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-gray-700 hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition cursor-pointer"
            >
              <option value="">Tất cả cấp độ</option>
              <option 
                v-for="level in filterLevels" 
                :key="level.id" 
                :value="level.id"
              >
                {{ level.title }}
              </option>
            </select>
            <div class="absolute right-3 bottom-2.5 pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>

          <!-- Reset Filter Button -->
          <div class="flex-shrink-0">
            <button 
              @click="resetFilters"
              class="px-4 py-2.5 text-sm text-gray-600 hover:text-teal-600 font-medium flex items-center gap-2 hover:bg-teal-50 rounded-lg transition whitespace-nowrap"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      <!-- Results Count -->
      <div class="mb-4 text-sm text-muted">
        <span v-if="selectedClass || selectedSubject || selectedLevel">
          Hiển thị {{ displayedPractices.length }} / {{ filteredPractices.length }} bài luyện đề (đã lọc từ {{ allPractices.length }} bài)
        </span>
        <span v-else>
          Hiển thị {{ displayedPractices.length }} / {{ allPractices.length }} bài luyện đề
        </span>
      </div>

      <!-- Practice Table -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-teal-50 to-teal-100 border-b border-teal-200">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-bold text-gray-700">Ảnh</th>
                <th class="px-6 py-4 text-left text-sm font-bold text-gray-700">Tiêu đề</th>
                <th class="px-6 py-4 text-left text-sm font-bold text-gray-700">Môn học</th>
                <th class="px-6 py-4 text-left text-sm font-bold text-gray-700">Lớp</th>
                <th class="px-6 py-4 text-left text-sm font-bold text-gray-700">Cấp độ</th>
                <th class="px-6 py-4 text-center text-sm font-bold text-gray-700">Thời gian</th>
                <th class="px-6 py-4 text-center text-sm font-bold text-gray-700">Hành động</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr 
                v-for="practice in displayedPractices" 
                :key="practice.id"
                class="hover:bg-teal-50/50 transition"
              >
                <td class="px-6 py-4">
                  <img 
                    v-if="practice.thumb"
                    :src="practice.thumb" 
                    :alt="practice.title" 
                    class="w-24 h-16 object-cover rounded-lg shadow-sm"
                  />
                  <div v-else class="w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="font-semibold text-text max-w-xs">{{ practice.title }}</div>
                </td>
                <td class="px-6 py-4">
                  <span v-if="practice.subject" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 whitespace-nowrap">
                    {{ practice.subject.name }}
                  </span>
                  <span v-else class="text-gray-400 text-sm">-</span>
                </td>
                <td class="px-6 py-4">
                  <span v-if="practice.class" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 whitespace-nowrap">
                    {{ practice.class.name }}
                  </span>
                  <span v-else class="text-gray-400 text-sm">-</span>
                </td>
                <td class="px-6 py-4">
                  <span v-if="practice.level" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                    {{ practice.level.title }}
                  </span>
                  <span v-else class="text-gray-400 text-sm">-</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <div class="flex items-center justify-center gap-1 text-sm text-gray-700">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="font-medium">{{ practice.duration_time || 0 }} phút</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <!-- Completed Badge -->
                    <span 
                      v-if="isPracticeCompleted(practice.documentId)"
                      class="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      Đã hoàn thành
                    </span>
                    
                    <!-- Action Button -->
                    <button
                      @click="startPractice(practice.slug, practice.documentId)"
                      :class="[
                        'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all whitespace-nowrap',
                        isPracticeCompleted(practice.documentId)
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                          : 'bg-gradient-to-r from-primary to-teal-600 text-white'
                      ]"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path 
                          v-if="isPracticeCompleted(practice.documentId)"
                          stroke-linecap="round" 
                          stroke-linejoin="round" 
                          stroke-width="2" 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                        />
                        <path 
                          v-else
                          stroke-linecap="round" 
                          stroke-linejoin="round" 
                          stroke-width="2" 
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                        />
                      </svg>
                      {{ isPracticeCompleted(practice.documentId) ? 'Xem kết quả' : 'Vào thi' }}
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-if="displayedPractices.length === 0">
                <td colspan="7" class="px-6 py-16 text-center">
                  <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p class="text-gray-500 font-medium">Không tìm thấy bài luyện đề nào</p>
                  <p class="text-sm text-muted mt-1">Thử thay đổi bộ lọc để xem thêm bài thi</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Load More Button -->
      <div v-if="hasMore" class="mt-8 text-center">
        <button 
          @click="loadMore"
          class="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-600 hover:shadow-lg transition-all"
        >
          Xem thêm
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <!-- All loaded message -->
      <div v-else-if="displayedPractices.length > 0" class="mt-8 text-center">
        <p class="text-muted">Đã hiển thị tất cả {{ displayedPractices.length }} bài luyện đề</p>
      </div>
    </div>
  </main>
</template>
