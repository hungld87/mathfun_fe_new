<template>
  <section>
    <div class="flex items-center gap-3 mb-8">
      <img v-if="icon" :src="icon" alt="Icon" class="w-10 h-10 object-contain" />
      <h2 class="text-2xl font-bold text-primary">
        {{ title || 'Khoá Học Nổi Bật' }}
      </h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <CourseCard v-for="course in courses" :key="course.id" :course="course" />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Course } from '~/types'

defineProps<{
  courses?: Course[]
  title?: string
  icon?: string
}>()
</script>
