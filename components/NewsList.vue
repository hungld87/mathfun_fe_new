<template>
  <div class="bg-card rounded-lg shadow p-6">
    <div class="flex items-center gap-2 mb-4">
      <img v-if="icon" :src="icon" alt="icon" class="w-8 h-8 object-contain" />
      <h3 class="text-xl font-bold text-primary">
        {{ title || 'Tin Tức Nổi Bật' }}
      </h3>
    </div>
    <div class="space-y-4">
      <NuxtLink 
        v-for="news in items"
        :key="news.id"
        :to="`/news/${news.slug}`"
        class="flex gap-3 pb-3 border-b hover:bg-background p-2 rounded transition"
      >
        <img :src="news.thumb" :alt="news.title" class="w-20 h-20 rounded object-cover flex-shrink-0" />
        <div class="flex-1 min-w-0">
          <h4 class="font-semibold text-text line-clamp-2 hover:text-primary transition">{{ news.title }}</h4>
          <p class="text-sm text-muted line-clamp-1">{{ news.description }}</p>
          <p class="text-xs text-muted mt-1">{{ formatDate(news.datetime) }}</p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NewsItem } from '~/types'

defineProps<{
  items?: NewsItem[]
  title?: string
  icon?: string
}>()

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('vi-VN')
}
</script>
