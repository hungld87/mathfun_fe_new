<script setup lang="ts">
import { ref, computed } from 'vue'
import { marked } from 'marked'

const route = useRoute()
const slug = route.params.slug

definePageMeta({
  title: 'Chi tiết khoá học · MathFun'
})

const { data: coursesResponse } = await useAsyncData('courses-detail', () => $fetch('/api/mock/courses'))
const allCourses = computed(() => coursesResponse.value?.data || [])
const course = computed(() => allCourses.value?.find((c: any) => c.slug === slug))

const isRegisterModalOpen = ref(false)

function openRegisterModal() {
  isRegisterModalOpen.value = true
}

function handleRegisterSuccess(data: any) {
  console.log('Course registration success:', data)
  // Here you can show a success notification
}

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
})

// Helper function to convert YouTube links to embedded iframe
const processYouTubeLinks = (html: string): string => {
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&].*)?/g
  
  return html.replace(youtubeRegex, (match, videoId) => {
    return `<div class="video-container my-6">
      <iframe 
        width="100%" 
        height="480" 
        src="https://www.youtube.com/embed/${videoId}" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen
        class="rounded-lg shadow-lg"
      ></iframe>
    </div>`
  })
}

// Parse markdown content to HTML
const parsedContent = computed(() => {
  if (!course.value?.content) return ''
  let html = marked.parse(course.value.content) as string
  html = processYouTubeLinks(html)
  return html
})
</script>

<template>
  <main class="bg-background">
    <div v-if="course" class="container mx-auto px-6 py-10 max-w-content">
      <NuxtLink to="/courses" class="text-primary hover:underline mb-4 inline-block">← Quay lại</NuxtLink>
      
      <div class="bg-card rounded-lg shadow p-8">
        <NuxtImg 
          :src="course.coverImage || course.image" 
          :alt="course.title" 
          class="w-full h-96 object-cover rounded-lg mb-6" 
        />
        
        <div class="flex items-start justify-between mb-4">
          <h1 class="text-4xl font-bold text-primary">{{ course.title }}</h1>
          <span v-if="course.isHot" class="bg-orange-100 text-orange-600 px-3 py-1 rounded-lg font-semibold text-sm">HOT</span>
        </div>

        <!-- Course Info -->
        <div class="flex flex-wrap gap-4 mb-6">
          <div v-if="course.subject" class="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span class="font-semibold">{{ course.subject.name }}</span>
          </div>
          <div v-if="course.class" class="flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span class="font-semibold">{{ course.class.name }}</span>
          </div>
          <div v-if="course.level" class="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span class="font-semibold">{{ course.level.title }}</span>
          </div>
        </div>
        
        <p v-if="course.description" class="text-lg text-text mb-6 pb-6 border-b border-gray-200">{{ course.description }}</p>

        <!-- Course Content -->
        <div v-if="course.content" class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Nội dung khóa học</h2>
          <div class="markdown-content" v-html="parsedContent"></div>
        </div>
        
        <button 
          @click="openRegisterModal"
          class="bg-success text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-green-600 transition inline-flex items-center gap-2"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Đăng ký khoá học
        </button>
      </div>
    </div>
    <div v-else class="container mx-auto px-6 py-10 max-w-content">
      <p class="text-muted">Khoá học không tìm thấy</p>
    </div>

    <!-- Course Register Modal -->
    <CourseRegisterModal 
      :is-open="isRegisterModalOpen"
      :default-note="`Đăng ký khóa học: ${course?.title || ''}`"
      :course-class="course?.class"
      :course-subject="course?.subject"
      :course-level="course?.level"
      @close="isRegisterModalOpen = false"
      @success="handleRegisterSuccess"
    />
  </main>
</template>

<style scoped>
/* Markdown Content Styling */
.markdown-content {
  @apply text-gray-800 leading-relaxed;
  font-size: 16px;
  line-height: 1.8;
}

.markdown-content :deep(p:first-of-type) {
  @apply text-lg text-gray-700 font-medium;
}

.markdown-content :deep(h1) {
  @apply text-3xl font-bold text-gray-900 mt-8 mb-4;
}

.markdown-content :deep(h2) {
  @apply text-2xl font-bold text-gray-900 mt-6 mb-3;
}

.markdown-content :deep(h3) {
  @apply text-xl font-semibold text-gray-900 mt-5 mb-2;
}

.markdown-content :deep(h4) {
  @apply text-lg font-semibold text-gray-800 mt-4 mb-2;
}

.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  @apply text-base font-semibold text-gray-800 mt-3 mb-2;
}

.markdown-content :deep(p) {
  @apply mb-4 text-base leading-7;
}

.markdown-content :deep(strong) {
  @apply font-bold text-gray-900;
}

.markdown-content :deep(em) {
  @apply italic;
}

.markdown-content :deep(a) {
  @apply text-primary hover:text-teal-600 underline font-medium transition-colors;
}

.markdown-content :deep(ul) {
  @apply list-disc list-inside mb-4 space-y-2 ml-4;
}

.markdown-content :deep(ol) {
  @apply list-decimal list-inside mb-4 space-y-2 ml-4;
}

.markdown-content :deep(li) {
  @apply text-base leading-7;
}

.markdown-content :deep(li > ul),
.markdown-content :deep(li > ol) {
  @apply mt-2 ml-6;
}

.markdown-content :deep(blockquote) {
  @apply border-l-4 border-primary bg-teal-50 pl-4 pr-4 py-3 mb-4 italic text-gray-700;
}

.markdown-content :deep(code) {
  @apply bg-gray-100 text-pink-600 px-2 py-1 rounded text-sm font-mono;
}

.markdown-content :deep(pre) {
  @apply bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4;
}

.markdown-content :deep(pre code) {
  @apply bg-transparent text-gray-100 p-0;
}

.markdown-content :deep(img) {
  @apply max-w-full h-auto rounded-lg shadow-md my-6 mx-auto;
}

.markdown-content :deep(table) {
  @apply w-full border-collapse mb-4 shadow-sm rounded-lg overflow-hidden;
}

.markdown-content :deep(thead) {
  @apply bg-primary text-white;
}

.markdown-content :deep(th) {
  @apply p-3 text-left font-semibold;
}

.markdown-content :deep(td) {
  @apply p-3 border-b border-gray-200;
}

.markdown-content :deep(tbody tr:hover) {
  @apply bg-gray-50;
}

.markdown-content :deep(hr) {
  @apply my-8 border-t-2 border-gray-200;
}

.markdown-content :deep(iframe) {
  @apply w-full aspect-video rounded-lg shadow-md my-6;
}

.markdown-content :deep(.video-container) {
  @apply relative w-full my-6;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
}

.markdown-content :deep(.video-container iframe) {
  @apply absolute top-0 left-0 w-full h-full rounded-lg shadow-lg;
}
</style>
