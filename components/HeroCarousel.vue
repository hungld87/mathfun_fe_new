<template>
  <section class="relative w-full bg-gray-900 overflow-hidden" style="height: 500px;">
    <div v-if="items && items.length > 0" class="relative h-full">
      <!-- Slides -->
      <TransitionGroup name="fade">
        <div 
          v-for="(item, idx) in items"
          v-show="idx === currentIndex"
          :key="item.id"
          class="absolute inset-0"
        >
          <NuxtImg 
            :src="item.image" 
            :alt="item.title"
            class="w-full h-full object-cover"
            loading="eager"
            :quality="80"
          />
          <!-- Overlay Gradient -->
          <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        </div>
      </TransitionGroup>

      <!-- Content -->
      <div class="absolute inset-0 flex items-center">
        <div class="container mx-auto px-6 max-w-content">
          <div class="max-w-2xl">
            <h1 class="text-white text-5xl md:text-6xl font-bold mb-4 leading-tight animate-fade-in">
              {{ items[currentIndex].title }}
            </h1>
            <p class="text-white/90 text-xl md:text-2xl mb-8 leading-relaxed animate-fade-in-delay">
              {{ items[currentIndex].description }}
            </p>
            <NuxtLink 
              :to="items[currentIndex].link_internal"
              class="inline-flex items-center gap-2 text-white text-lg font-bold hover:text-primary transition-all animate-fade-in-delay-2 group"
            >
              <span class="border-b-2 border-white group-hover:border-primary transition-all">Khám phá ngay</span>
              <svg class="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <button 
        @click.stop="prevSlide"
        class="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white w-12 h-12 rounded-full transition-all shadow-lg flex items-center justify-center group z-20"
        aria-label="Previous slide"
      >
        <svg class="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      <button 
        @click.stop="nextSlide"
        class="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white w-12 h-12 rounded-full transition-all shadow-lg flex items-center justify-center group z-20"
        aria-label="Next slide"
      >
        <svg class="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>

      <!-- Dots Indicator -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
        <button
          v-for="(item, idx) in items"
          :key="idx"
          @click.stop="goToSlide(idx)"
          :class="[
            'transition-all duration-300',
            idx === currentIndex 
              ? 'w-12 h-3 bg-white rounded-full' 
              : 'w-3 h-3 bg-white/50 hover:bg-white/70 rounded-full'
          ]"
          :aria-label="`Go to slide ${idx + 1}`"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="flex items-center justify-center h-full">
      <div class="spinner"></div>
    </div>
  </section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

.animate-fade-in-delay {
  animation: fadeIn 0.8s ease-out 0.2s both;
}

.animate-fade-in-delay-2 {
  animation: fadeIn 0.8s ease-out 0.4s both;
}
</style>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Banner } from '~/types'

const props = defineProps<{
  items?: Banner[]
}>()

const currentIndex = ref(0)
let interval: ReturnType<typeof setInterval> | null = null

const nextSlide = () => {
  if (props.items && props.items.length > 0) {
    currentIndex.value = (currentIndex.value + 1) % props.items.length
  }
}

const prevSlide = () => {
  if (props.items && props.items.length > 0) {
    currentIndex.value = (currentIndex.value - 1 + props.items.length) % props.items.length
  }
}

const goToSlide = (index: number) => {
  currentIndex.value = index
  // Reset auto-advance timer
  if (interval) {
    clearInterval(interval)
    interval = setInterval(nextSlide, 5000)
  }
}

// Auto-advance carousel every 5 seconds
onMounted(() => {
  if (props.items && props.items.length > 1) {
    interval = setInterval(nextSlide, 5000)
  }
})

onUnmounted(() => {
  if (interval) {
    clearInterval(interval)
    interval = null
  }
})
</script>
