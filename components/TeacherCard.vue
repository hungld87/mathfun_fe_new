<template>
  <div class="bg-card rounded-lg shadow p-6 text-center">
    <img :src="teacher.image" :alt="teacher.name" class="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />
    <h3 class="text-lg font-semibold text-text mb-2">{{ teacher.name }}</h3>
    <p class="text-sm text-muted">{{ teacher.description }}</p>
  </div>
</template>

<script setup lang="ts">
import type { Teacher } from '~/types'

defineProps<{
  teacher: Teacher
}>()
</script>
