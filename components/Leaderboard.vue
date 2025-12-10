<template>
  <div class="bg-card rounded-lg shadow p-6 min-w-0 overflow-hidden">
    <div class="flex items-center gap-2 mb-4 min-w-0">
      <img v-if="icon" :src="icon" alt="icon" class="w-8 h-8 object-contain" />
      <h3 class="text-xl font-bold text-primary">
        {{ title || 'Bảng Xếp Hạng Tuần Này' }}
      </h3>
    </div>
    <div class="space-y-3">
      <div v-for="(entry, index) in items" :key="entry.id" class="flex items-center justify-between py-2 border-b">
        <div class="flex items-center gap-3">
          <span class="font-bold text-lg text-primary">{{ index + 1 }}</span>
          <img v-if="entry.student?.avatar" :src="entry.student.avatar" :alt="entry.name" class="w-8 h-8 rounded-full" />
          <span class="text-text font-semibold">{{ entry.name }}</span>
        </div>
        <span class="text-success font-bold">{{ entry.totalScore }} điểm</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LeaderboardEntry } from '~/types'

defineProps<{
  items?: LeaderboardEntry[]
  title?: string
  icon?: string
}>()
</script>
