<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import type { NewsItem } from '~/types'

const route = useRoute()
const slug = route.params.slug

definePageMeta({
  title: 'Chi tiết tin tức · MathFun'
})

const { get } = useApi()
const { data: newsList } = await useAsyncData('news-list', () => get('/news'))
const article = computed(() => newsList.value?.find(n => n.slug === slug))

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
})

// Helper function to convert YouTube links to embedded iframe
const processYouTubeLinks = (html: string): string => {
  // Pattern for YouTube links
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
  if (!article.value?.content) return ''
  let html = marked.parse(article.value.content) as string
  html = processYouTubeLinks(html)
  return html
})

// Parse markdown description to HTML
const parsedDescription = computed(() => {
  if (!article.value?.description) return ''
  let html = marked.parse(article.value.description) as string
  html = processYouTubeLinks(html)
  return html
})

// Get related news (same tags, exclude current)
const relatedNews = computed(() => {
  if (!article.value || !newsList.value) return []
  
  return newsList.value
    .filter(n => n.id !== article.value?.id)
    .filter(n => n.tags?.some(tag => article.value?.tags?.includes(tag)))
    .slice(0, 3)
})
</script>

<template>
  <main class="bg-background min-h-screen">
    <div v-if="article" class="container mx-auto px-6 py-8 max-w-7xl">
      
      <!-- SECTION 1: Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-muted mb-6">
        <NuxtLink to="/" class="hover:text-primary transition-colors">
          <svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </NuxtLink>
        <span>/</span>
        <NuxtLink to="/news" class="hover:text-primary transition-colors">Tin tức</NuxtLink>
        <span>/</span>
        <span class="text-text font-medium line-clamp-1">{{ article.title }}</span>
      </nav>

      <!-- SECTION 2: Chi tiết bài viết -->
      <article class="bg-card rounded-xl shadow-sm overflow-hidden mb-10">
        <!-- Cover Image -->
        <div class="relative h-[400px] overflow-hidden">
          <NuxtImg 
            :src="article.cover" 
            :alt="article.title" 
            class="w-full h-full object-cover"
            loading="eager"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        </div>
        
        <!-- Content -->
        <div class="p-8 lg:p-12">
          <!-- Title -->
          <h1 class="text-3xl lg:text-4xl font-bold text-text mb-4 leading-tight">
            {{ article.title }}
          </h1>
          
          <!-- Meta Info -->
          <div class="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-border">
            <div class="flex items-center gap-2 text-muted">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="font-medium">{{ article.author }}</span>
            </div>
            <span class="text-muted">•</span>
            <div class="flex items-center gap-2 text-muted">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <time>{{ new Date(article.datetime).toLocaleDateString('vi-VN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) }}</time>
            </div>
          </div>

          <!-- Description -->
          <div class="bg-teal-50 border-l-4 border-primary p-4 rounded-r-lg mb-8">
            <div class="markdown-content text-text font-medium" v-html="parsedDescription"></div>
          </div>
          
          <!-- Main Content -->
          <div class="markdown-content prose prose-lg max-w-none mb-8">
            <div v-html="parsedContent"></div>
          </div>

          <!-- Tags -->
          <div class="flex flex-wrap gap-2 mb-6">
            <span v-for="tag in article.tags" :key="tag" 
              class="inline-flex items-center bg-gradient-to-r from-teal-50 to-teal-100 text-primary px-4 py-2 rounded-full text-sm font-medium border border-teal-200 hover:shadow-md transition-all cursor-default">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {{ tag }}
            </span>
          </div>

          <!-- Share buttons -->
          <div class="pt-6 border-t border-border">
            <p class="text-sm text-muted mb-3 font-medium">Chia sẻ bài viết:</p>
            <div class="flex gap-3">
              <button class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
              <button class="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                Twitter
              </button>
              <button class="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Sao chép link
              </button>
            </div>
          </div>
        </div>
      </article>

      <!-- SECTION 3: Các bài viết liên quan -->
      <section v-if="relatedNews.length > 0" class="mb-10">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-1 h-8 bg-gradient-to-b from-primary to-teal-400 rounded-full"></div>
          <h2 class="text-2xl lg:text-3xl font-bold text-text">Bài viết liên quan</h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NewsCard 
            v-for="news in relatedNews" 
            :key="news.id"
            :news="news"
          />
        </div>

        <!-- View all button -->
        <div class="text-center mt-8">
          <NuxtLink 
            to="/news"
            class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-teal-600 hover:shadow-lg transition-all"
          >
            Xem tất cả tin tức
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </NuxtLink>
        </div>
      </section>

      <!-- Empty state for related news -->
      <section v-else class="text-center py-10">
        <p class="text-muted">Chưa có bài viết liên quan</p>
      </section>

    </div>

    <!-- Article not found -->
    <div v-else class="container mx-auto px-6 py-20 max-w-content text-center">
      <svg class="w-24 h-24 mx-auto mb-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h2 class="text-2xl font-bold text-text mb-3">Không tìm thấy bài viết</h2>
      <p class="text-muted mb-6">Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
      <NuxtLink 
        to="/news"
        class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-teal-600 hover:shadow-lg transition-all"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Quay lại trang tin tức
      </NuxtLink>
    </div>
  </main>
</template>

<style scoped>
/* Markdown Content Styling */
.markdown-content {
  @apply text-gray-800 leading-relaxed;
  font-size: 16px;
  line-height: 1.8;
}

/* First paragraph - lead style */
.markdown-content :deep(p:first-of-type) {
  @apply text-lg text-gray-700 font-medium;
}

/* Headings */
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

/* Paragraphs */
.markdown-content :deep(p) {
  @apply mb-4 text-base leading-7;
}

/* Bold & Italic */
.markdown-content :deep(strong) {
  @apply font-bold text-gray-900;
}

.markdown-content :deep(em) {
  @apply italic;
}

/* Links */
.markdown-content :deep(a) {
  @apply text-primary hover:text-teal-600 underline font-medium transition-colors;
}

/* Lists */
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

/* Blockquotes */
.markdown-content :deep(blockquote) {
  @apply border-l-4 border-primary bg-teal-50 pl-4 pr-4 py-3 mb-4 italic text-gray-700;
}

/* Code */
.markdown-content :deep(code) {
  @apply bg-gray-100 text-pink-600 px-2 py-1 rounded text-sm font-mono;
}

.markdown-content :deep(pre) {
  @apply bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4;
}

.markdown-content :deep(pre code) {
  @apply bg-transparent text-gray-100 p-0;
}

/* Images */
.markdown-content :deep(img) {
  @apply max-w-full h-auto rounded-lg shadow-md my-6 mx-auto;
}

/* Tables */
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

/* Horizontal Rule */
.markdown-content :deep(hr) {
  @apply my-8 border-t-2 border-gray-200;
}

/* Iframe (for YouTube videos) */
.markdown-content :deep(iframe) {
  @apply w-full aspect-video rounded-lg shadow-md my-6;
}

/* Video Container */
.markdown-content :deep(.video-container) {
  @apply relative w-full my-6;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
}

.markdown-content :deep(.video-container iframe) {
  @apply absolute top-0 left-0 w-full h-full rounded-lg shadow-lg;
}
</style>
