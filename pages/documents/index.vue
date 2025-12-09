<script setup lang="ts">
import { ref, computed, watch } from 'vue'

definePageMeta({
  title: 'Tài Liệu · MathFun',
  meta: [
    { name: 'description', content: 'Thư viện tài liệu học tập: đề thi, bài tập, bài giảng' }
  ]
})

// Filters
const selectedClass = ref('')
const selectedSubject = ref('')
const selectedLevel = ref('')
const selectedType = ref('')

// Fetch filters data
const { data: classesResponse } = await useAsyncData('classes-list', () => $fetch('/api/mock/classes'))
const classes = computed(() => classesResponse.value?.data || [])

const { data: subjectsResponse } = await useAsyncData('subjects-list', () => $fetch('/api/mock/subjects'))
const subjects = computed(() => subjectsResponse.value?.data || [])

const { data: levelsResponse } = await useAsyncData('levels-list', () => $fetch('/api/mock/levels'))
const levels = computed(() => levelsResponse.value?.data || [])

// Type options
const types = [
  { value: 'video', label: 'Video' },
  { value: 'file', label: 'File' }
]

// Build query params
const queryParams = computed(() => ({
  classId: selectedClass.value || undefined,
  subjectId: selectedSubject.value || undefined,
  levelId: selectedLevel.value || undefined,
  type: selectedType.value || undefined
}))

// Fetch materials with filters
const { data: materialsResponse, refresh } = await useAsyncData(
  'study-materials',
  () => $fetch('/api/mock/study-materials', { params: queryParams.value }),
  { watch: [queryParams] }
)

const materials = computed(() => materialsResponse.value?.data || [])
const meta = computed(() => materialsResponse.value?.meta)

// Reset filters
const resetFilters = () => {
  selectedClass.value = ''
  selectedSubject.value = ''
  selectedLevel.value = ''
  selectedType.value = ''
}

// Get type label
const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    pdf: 'PDF',
    video: 'Video',
    audio: 'Audio',
    document: 'Tài liệu'
  }
  return typeMap[type] || type
}

// Get type icon
const getTypeIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    pdf: '📄',
    video: '🎥',
    audio: '🎵',
    document: '📝'
  }
  return iconMap[type] || '📦'
}

// Video modal
const isVideoModalOpen = ref(false)
const currentVideoUrl = ref('')

const openVideoModal = (url: string) => {
  currentVideoUrl.value = url
  isVideoModalOpen.value = true
}

const closeVideoModal = () => {
  isVideoModalOpen.value = false
  currentVideoUrl.value = ''
}

// Get YouTube embed URL
const getYouTubeEmbedUrl = (url: string) => {
  const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&\n?#]+)/)
  return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url
}
</script>

<template>
  <main class="bg-background">
    <div class="container mx-auto px-6 py-10 max-w-content">
      <h1 class="text-3xl font-bold text-primary mb-8">Tài Liệu Học Tập</h1>
      
      <!-- Filters -->
      <div class="mb-8 bg-white rounded-xl shadow-sm p-6">
        <div class="flex gap-4 items-end">
          <!-- Type Filter -->
          <div class="relative flex-1">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Loại tài liệu</label>
            <select 
              v-model="selectedType"
              class="appearance-none w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-gray-700 hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition cursor-pointer"
            >
              <option value="">Tất cả</option>
              <option v-for="type in types" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
            <div class="absolute right-3 bottom-2.5 pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>

          <!-- Subject Filter -->
          <div class="relative flex-1">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Môn học</label>
            <select 
              v-model="selectedSubject"
              class="appearance-none w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-gray-700 hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition cursor-pointer"
            >
              <option value="">Tất cả</option>
              <option v-for="subject in subjects" :key="subject.documentId" :value="subject.documentId">
                {{ subject.name }}
              </option>
            </select>
            <div class="absolute right-3 bottom-2.5 pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>

          <!-- Class Filter -->
          <div class="relative flex-1">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Lớp</label>
            <select 
              v-model="selectedClass"
              class="appearance-none w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-gray-700 hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition cursor-pointer"
            >
              <option value="">Tất cả</option>
              <option v-for="cls in classes" :key="cls.documentId" :value="cls.documentId">
                {{ cls.name }}
              </option>
            </select>
            <div class="absolute right-3 bottom-2.5 pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>

          <!-- Level Filter -->
          <div class="relative flex-1">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Mức độ</label>
            <select 
              v-model="selectedLevel"
              class="appearance-none w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-gray-700 hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition cursor-pointer"
            >
              <option value="">Tất cả</option>
              <option v-for="level in levels" :key="level.documentId" :value="level.documentId">
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
      <div class="mb-4 text-sm text-gray-600">
        Tìm thấy <span class="font-semibold text-primary">{{ meta?.pagination?.total || 0 }}</span> tài liệu
      </div>

      <!-- Table -->
      <div v-if="materials.length > 0" class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-primary text-white">
              <tr>
                <th class="text-left p-4 font-semibold">Tên Tài Liệu</th>
                <th class="text-left p-4 font-semibold">Loại</th>
                <th class="text-left p-4 font-semibold">Môn học</th>
                <th class="text-left p-4 font-semibold">Lớp</th>
                <th class="text-center p-4 font-semibold">Mức độ</th>
                <th class="text-center p-4 font-semibold">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="material in materials" 
                :key="material.documentId"
                class="border-b hover:bg-gray-50 transition"
              >
                <td class="p-4">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">{{ getTypeIcon(material.type) }}</span>
                    <span class="font-medium text-gray-900">{{ material.title }}</span>
                  </div>
                </td>
                <td class="p-4">
                  <span class="px-3 py-1 bg-teal-100 text-teal-700 text-xs font-semibold rounded-full">
                    {{ getTypeLabel(material.type) }}
                  </span>
                </td>
                <td class="p-4 text-gray-600">
                  {{ material.subject?.name || '-' }}
                </td>
                <td class="p-4 text-gray-600">
                  {{ material.class?.name || '-' }}
                </td>
                <td class="p-4 text-center text-gray-600">
                  {{ material.level?.title || '-' }}
                </td>
                <td class="p-4">
                  <div class="flex items-center justify-center gap-2">
                    <!-- Video Button -->
                    <button 
                      v-if="material.type === 'video'"
                      @click="openVideoModal(material.documentLink)"
                      class="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition flex items-center gap-2"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                      </svg>
                      Xem video
                    </button>
                    
                    <!-- Download Button for non-video types -->
                    <a 
                      v-else
                      :href="material.documentLink" 
                      target="_blank"
                      rel="noopener noreferrer"
                      class="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition flex items-center gap-2"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Tải xuống
                    </a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white rounded-lg shadow-sm p-12 text-center">
        <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy tài liệu</h3>
        <p class="text-gray-500 mb-4">Thử thay đổi bộ lọc để xem thêm tài liệu</p>
        <button 
          @click="resetFilters"
          class="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-teal-600 transition"
        >
          Xóa bộ lọc
        </button>
      </div>

      <!-- Video Modal -->
      <Teleport to="body">
        <Transition name="modal">
          <div 
            v-if="isVideoModalOpen" 
            class="fixed inset-0 z-[100] flex items-center justify-center p-4"
            @click.self="closeVideoModal"
          >
            <!-- Backdrop -->
            <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="closeVideoModal"></div>
            
            <!-- Modal -->
            <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <!-- Close Button -->
              <button 
                @click="closeVideoModal"
                class="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 rounded-full p-2 transition shadow-lg"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <!-- Video Container -->
              <div class="relative w-full" style="padding-bottom: 56.25%;">
                <iframe 
                  :src="getYouTubeEmbedUrl(currentVideoUrl)"
                  class="absolute inset-0 w-full h-full"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
  </main>
</template>

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
