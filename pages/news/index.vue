<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({
  title: 'Tin Tức · MathFun',
  meta: [
    { name: 'description', content: 'Tin tức, bài viết về toán học và giáo dục' }
  ]
})

const { get } = useApi()
const { data: allNews } = await useAsyncData('news-list', () => get('/news'))
const { data: categories } = await useAsyncData('news-categories', () => get('/news-categories'))

// Pagination
const itemsPerPage = 3
const currentPage = ref(1)

const displayedNews = computed(() => {
  if (!allNews.value) return []
  return allNews.value.slice(0, currentPage.value * itemsPerPage)
})

const hasMore = computed(() => {
  if (!allNews.value) return false
  return displayedNews.value.length < allNews.value.length
})

const loadMore = () => {
  currentPage.value++
}
</script>

<template>
  <main class="bg-background">
    <div class="container mx-auto px-6 py-10 max-w-content">
      <h1 class="text-3xl font-bold text-primary mb-8">Tin Tức</h1>
      
      <!-- Category Filter -->
      <div class="mb-8">
        <div class="flex items-center gap-3 flex-wrap">
          <span class="text-gray-600 font-medium">Danh mục:</span>
          <NuxtLink 
            to="/news"
            class="px-6 py-2.5 rounded-full font-semibold transition-all bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg scale-105"
          >
            Tất cả
          </NuxtLink>
          <NuxtLink 
            v-for="category in categories"
            :key="category.id"
            :to="`/news/category/${category.slug}`"
            class="px-6 py-2.5 rounded-full font-medium transition-all bg-white border border-gray-200 text-gray-700 hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50"
          >
            {{ category.name }}
          </NuxtLink>
        </div>
      </div>

      <!-- News List -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NewsCard 
          v-for="item in displayedNews"
          :key="item.id"
          :news="item"
        />
      </div>

      <!-- Load More -->
      <div v-if="hasMore" class="mt-8 text-center">
        <button 
          @click="loadMore"
          class="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-600 hover:shadow-lg transition-all inline-flex items-center gap-2"
        >
          Xem thêm
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <!-- No more items -->
      <div v-else-if="displayedNews.length > 0" class="mt-8 text-center">
        <p class="text-muted">Đã hiển thị tất cả {{ displayedNews.length }} bài viết</p>
      </div>
    </div>
  </main>
</template>
