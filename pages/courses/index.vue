<script setup lang="ts">
import { ref, computed, watch } from 'vue'

definePageMeta({
  title: 'Khoá Học · MathFun',
  meta: [
    { name: 'description', content: 'Danh sách các khoá học toán tư duy cho học sinh' }
  ]
})

const { data: coursesResponse } = await useAsyncData('courses-list', () => $fetch('/api/mock/courses'))
const allCourses = computed(() => coursesResponse.value?.data || [])

const { data: filtersResponse } = await useAsyncData('course-filters', () => $fetch('/api/mock/course-filters'))
const filterClasses = computed(() => filtersResponse.value?.data?.classes || [])
const filterLevels = computed(() => filtersResponse.value?.data?.levels || [])
const filterSubjects = computed(() => filtersResponse.value?.data?.subjects || [])

// Filter states
const selectedClass = ref('')
const selectedSubject = ref('')
const selectedLevel = ref('')

// Pagination
const itemsPerPage = 6
const currentPage = ref(1)

// Filtered courses based on selected filters
const filteredCourses = computed(() => {
  let courses = allCourses.value || []
  
  // Filter by class
  if (selectedClass.value) {
    courses = courses.filter((course: any) => 
      course.class?.documentId === selectedClass.value
    )
  }
  
  // Filter by subject
  if (selectedSubject.value) {
    courses = courses.filter((course: any) => 
      course.subject?.documentId === selectedSubject.value
    )
  }
  
  // Filter by level
  if (selectedLevel.value) {
    courses = courses.filter((course: any) => 
      course.level?.documentId === selectedLevel.value
    )
  }
  
  return courses
})

// Display courses with pagination
const displayedCourses = computed(() => {
  return filteredCourses.value.slice(0, currentPage.value * itemsPerPage)
})

// Check if there are more courses to load
const hasMore = computed(() => {
  return displayedCourses.value.length < filteredCourses.value.length
})

// Load more courses
const loadMore = () => {
  currentPage.value++
}

// Reset filters
const resetFilters = () => {
  selectedClass.value = ''
  selectedSubject.value = ''
  selectedLevel.value = ''
  currentPage.value = 1
}

// Reset pagination when filters change
watch([selectedClass, selectedSubject, selectedLevel], () => {
  currentPage.value = 1
})
</script>

<template>
  <main class="bg-background">
    <div class="container mx-auto px-6 py-10 max-w-content">
      <h1 class="text-3xl font-bold text-primary mb-8">Các Khoá Học</h1>
      
      <!-- Filters -->
      <div class="mb-8 bg-white rounded-xl shadow-sm p-6">
        <div class="flex flex-wrap gap-4 items-end">
          <!-- Class Filter -->
          <div class="relative flex-1 min-w-[200px]">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Khoảng tuổi</label>
            <select 
              v-model="selectedClass"
              class="appearance-none w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-gray-700 hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition cursor-pointer"
            >
              <option value="">Tất cả khoảng tuổi</option>
              <option 
                v-for="cls in filterClasses" 
                :key="cls.id" 
                :value="cls.documentId"
                :class="{'font-bold text-teal-600': cls.is_highlight}"
              >
                {{ cls.name }}
                <span v-if="cls.is_highlight">⭐</span>
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
                :value="subject.documentId"
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
            <label class="block text-sm font-semibold text-gray-700 mb-2">Trình độ</label>
            <select 
              v-model="selectedLevel"
              class="appearance-none w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-gray-700 hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition cursor-pointer"
            >
              <option value="">Tất cả trình độ</option>
              <option 
                v-for="level in filterLevels" 
                :key="level.id" 
                :value="level.documentId"
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
        Hiển thị {{ displayedCourses.length }} / {{ filteredCourses.length }} khoá học
        <span v-if="selectedClass || selectedSubject || selectedLevel" class="text-primary font-medium">
          (đã lọc từ {{ allCourses?.length || 0 }} khoá học)
        </span>
      </div>

      <!-- Course Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CourseCard v-for="course in displayedCourses" :key="course.id" :course="course" />
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
      <div v-else-if="displayedCourses.length > 0" class="mt-8 text-center">
        <p class="text-muted">Đã hiển thị tất cả {{ displayedCourses.length }} khoá học</p>
      </div>
    </div>
  </main>
</template>
