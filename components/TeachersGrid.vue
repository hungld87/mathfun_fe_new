<template>
  <section>
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-3">
        <img v-if="icon" :src="icon" alt="icon" class="w-10 h-10 object-contain" />
        <h2 class="text-2xl font-bold text-primary">
          {{ title || 'Đội Ngũ Giáo Viên Tài Năng' }}
        </h2>
      </div>
      <NuxtLink 
        to="/teachers"
        class="inline-flex items-center gap-1 text-primary hover:text-teal-600 font-semibold text-sm transition-colors group"
      >
        <span>Xem tất cả</span>
        <svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </NuxtLink>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <TeacherCard v-for="teacher in teachers" :key="teacher.id" :teacher="teacher" />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Teacher } from '~/types'

defineProps<{
  teachers?: Teacher[]
  title?: string
  icon?: string
}>()
</script>
