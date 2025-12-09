<template>
  <section>
    <div class="flex items-center gap-3 mb-8">
      <img v-if="icon" :src="icon" alt="icon" class="w-10 h-10 object-contain" />
      <h2 class="text-2xl font-bold text-primary">
        {{ title || 'Đội Ngũ Giáo Viên Tài Năng' }}
      </h2>
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
