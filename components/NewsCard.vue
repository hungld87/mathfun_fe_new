<template>
  <NuxtLink 
    :to="`/news/${news.slug}`"
    class="group bg-card rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
  >
    <div class="relative h-48 overflow-hidden">
      <NuxtImg 
        :src="news.cover || news.thumb" 
        :alt="news.title" 
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        loading="lazy"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
    
    <div class="p-5">
      <h3 class="text-lg font-semibold text-text mb-2 line-clamp-2 group-hover:text-primary transition-colors">
        {{ news.title }}
      </h3>
      
      <p class="text-sm text-muted mb-4 line-clamp-2">
        {{ news.description }}
      </p>
      
      <div class="flex items-center justify-between text-xs text-muted">
        <span class="flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {{ news.author }}
        </span>
        <time>{{ new Date(news.datetime).toLocaleDateString('vi-VN') }}</time>
      </div>

      <!-- Tags -->
      <div v-if="news.tags?.length" class="flex flex-wrap gap-1 mt-3">
        <span v-for="tag in news.tags.slice(0, 2)" :key="tag" 
          class="text-xs bg-teal-50 text-primary px-2 py-1 rounded-full">
          #{{ tag }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { NewsItem } from '~/types'

defineProps<{
  news: NewsItem
}>()
</script>
