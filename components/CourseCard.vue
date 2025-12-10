<template>
  <article class="bg-card rounded-lg shadow-sm overflow-hidden hover:shadow-md transition hover-lift">
    <div class="relative">
      <NuxtImg 
        :src="course.coverImage || course.image" 
        :alt="course.title" 
        class="w-full h-44 object-cover"
        loading="lazy"
      />
      <!-- Badges - Top Right Corner -->
      <div class="absolute top-2 right-2 flex gap-2">
        <div v-if="course.subject" class="bg-purple-500 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-lg">
          {{ course.subject.name }}
        </div>
        <div v-if="course.class" class="bg-primary text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-lg">
          {{ course.class.name }}
        </div>
      </div>
    </div>
    <div class="p-4">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-lg font-semibold text-text flex-1">{{ course.title }}</h3>
        <span v-if="course.isHot" class="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded font-semibold">HOT</span>
      </div>
      <p v-if="course.description" class="text-sm text-muted line-clamp-2 mb-3">{{ course.description }}</p>
      
      <!-- Action Buttons -->
      <div class="flex gap-2">
        <button 
          @click="openConsultationModal"
          class="flex-1 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 text-white px-3 py-2 text-center text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-1"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Yêu cầu tư vấn
        </button>
        <button 
          @click="openCourse"
          class="flex-1 rounded-full bg-primary text-white px-3 py-2 text-center text-sm font-semibold hover:bg-teal-600 hover:shadow-lg hover:scale-105 transition-all"
        >
          Xem khoá
        </button>
      </div>
    </div>

    <!-- Consultation Modal -->
    <ConsultationModal 
      v-model="isConsultationModalOpen"
      :default-note="`Yêu cầu tư vấn khóa học: ${course.title}`"
      @submit="handleConsultationSubmit"
    />
  </article>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Course } from '~/types'

const props = defineProps<{
  course: Course
}>()

const router = useRouter()
const isConsultationModalOpen = ref(false)

function openCourse() {
  // Save referrer info for proper back navigation
  if (process.client) {
    sessionStorage.setItem('courses-referrer', JSON.stringify({ 
      from: router.currentRoute.value.path,
      scrollY: window.scrollY 
    }))
  }
  router.push({ path: `/courses/${props.course.slug}` })
}

function openConsultationModal() {
  isConsultationModalOpen.value = true
}

function handleConsultationSubmit(data: any) {
  console.log('Consultation request for course:', props.course.title, data)
  // Here you can send data to your API
}
</script>
