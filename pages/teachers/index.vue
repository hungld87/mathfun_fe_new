<script setup lang="ts">
import type { Teacher } from '~/types'

definePageMeta({
  title: 'Đội Ngũ Giáo Viên · MathFun',
  meta: [
    { name: 'description', content: 'Đội ngũ giáo viên tài năng, giàu kinh nghiệm tại MathFun' }
  ]
})

// Fetch teachers data
const { data: teachersResponse } = await useAsyncData('teachers-list', () => $fetch('/api/proxy/teachers'))
const teachers = computed(() => teachersResponse.value?.data || [])
</script>

<template>
  <div class="bg-background min-h-screen">
    <div class="container mx-auto px-6 py-10 max-w-content">
      
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-primary mb-3">Đội Ngũ Giáo Viên Tài Năng</h1>
        <p class="text-gray-600 text-lg">
          Đội ngũ giáo viên giàu kinh nghiệm, tâm huyết và luôn đồng hành cùng các con trên hành trình chinh phục toán học
        </p>
      </div>

      <!-- Teachers Grid -->
      <div v-if="teachers.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TeacherCard 
          v-for="teacher in teachers" 
          :key="teacher.id" 
          :teacher="teacher" 
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20">
        <svg class="w-24 h-24 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h2 class="text-2xl font-bold text-gray-900 mb-3">Chưa có giáo viên nào</h2>
        <p class="text-gray-500">Thông tin giáo viên sẽ được cập nhật sớm</p>
      </div>

      <!-- Back to Home Button -->
      <div class="mt-12 text-center">
        <NuxtLink 
          to="/"
          class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-teal-600 hover:shadow-lg hover:scale-105 transition-all"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại trang chủ
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
