<script setup lang="ts">
interface Award {
  id: number
  documentId: string
  slug: string
  title: string
  description: string
  content: string
  image?: string
}

interface Props {
  title?: string
  icon?: string
  awards?: Award[]
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Bảng Vàng Thành Tích',
  icon: '',
  awards: () => []
})

// Extract image from markdown content
const extractImageFromContent = (content: string) => {
  const imgRegex = /!\[.*?\]\((.*?)\)/
  const match = content.match(imgRegex)
  return match ? match[1] : null
}

// Format awards with images
const formattedAwards = computed(() => {
  return props.awards?.map(award => ({
    ...award,
    image: extractImageFromContent(award.content)
  })) || []
})

// Carousel state
const currentIndex = ref(0)

// Items per slide - 4 items per slide on desktop, 2 on tablet, 1 on mobile
const itemsPerSlide = ref(4)
const totalSlides = computed(() => Math.ceil(formattedAwards.value.length / itemsPerSlide.value))

// Show carousel only when there are more items than one slide
const showCarousel = computed(() => formattedAwards.value.length > itemsPerSlide.value)

// Navigation methods
const goToNext = () => {
  if (currentIndex.value < totalSlides.value - 1) {
    currentIndex.value++
  }
}

const goToPrev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

// Auto adjust items per slide on resize
const updateItemsPerSlide = () => {
  if (typeof window !== 'undefined') {
    if (window.innerWidth < 768) {
      itemsPerSlide.value = 1 // 1 item per slide on mobile
    } else if (window.innerWidth < 1024) {
      itemsPerSlide.value = 2 // 2 items per slide on tablet
    } else {
      itemsPerSlide.value = 4 // 4 items per slide on desktop
    }
    // Reset to first slide when resizing
    if (currentIndex.value >= totalSlides.value) {
      currentIndex.value = Math.max(0, totalSlides.value - 1)
    }
  }
}

// Initialize and listen to resize
onMounted(() => {
  updateItemsPerSlide()
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', updateItemsPerSlide)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updateItemsPerSlide)
  }
})

// Group awards into slides
const slides = computed(() => {
  const result = []
  for (let i = 0; i < formattedAwards.value.length; i += itemsPerSlide.value) {
    result.push(formattedAwards.value.slice(i, i + itemsPerSlide.value))
  }
  return result
})
</script>

<template>
  <section class="award-section relative pt-0 pb-8 md:pb-12 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 overflow-hidden">
    <!-- Decorative elements -->
    <div class="absolute top-0 left-0 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div class="absolute top-0 right-0 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div class="absolute -bottom-8 left-1/2 w-64 h-64 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
    
    <div class="container mx-auto px-6 max-w-content relative z-10">
      <!-- Title Section with Trophy Icon -->
      <div class="text-center mb-6 pt-8 md:pt-10">
        <div class="inline-flex items-center justify-center mb-3">
          <div class="relative">
            <!-- Glowing effect -->
            <div class="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
            
            <!-- Trophy icon container -->
            <div class="relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-full p-3 shadow-xl transform hover:scale-110 transition-transform duration-300">
              <img 
                v-if="icon" 
                :src="icon" 
                alt="Trophy"
                class="w-12 h-12 object-contain filter drop-shadow-lg"
              />
              <svg v-else class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 2h12v2h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-.5c-.5 2.5-2.5 4.5-5.5 5v2h2v2H8v-2h2v-2c-3-0.5-5-2.5-5.5-5H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2V2zm2 2v2H4v3h1.5c0.5 2 2 3.5 4.5 4 2.5-0.5 4-2 4.5-4H20V6h-4V4H8z"/>
              </svg>
            </div>
          </div>
        </div>
        
        <h2 class="text-3xl md:text-4xl font-black bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-2 animate-fade-in">
          {{ title }}
        </h2>
        <div class="flex items-center justify-center gap-2">
          <div class="h-1 w-16 bg-gradient-to-r from-transparent via-yellow-500 to-transparent rounded-full"></div>
          <span class="text-xl">⭐</span>
          <div class="h-1 w-16 bg-gradient-to-r from-transparent via-yellow-500 to-transparent rounded-full"></div>
        </div>
      </div>

      <!-- Awards Grid -->
      <div v-if="formattedAwards.length > 0" class="relative">
        <!-- Navigation Buttons (only show when more than items per slide) -->
        <div v-if="showCarousel" class="flex justify-center items-center gap-4 mb-6">
          <button 
            @click="goToPrev"
            :disabled="currentIndex === 0"
            :class="[
              'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg',
              currentIndex === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50' 
                : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-xl hover:scale-110 active:scale-95'
            ]"
            aria-label="Previous"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <!-- Dots indicator -->
          <div class="flex gap-2">
            <button
              v-for="(_, idx) in totalSlides"
              :key="idx"
              @click="currentIndex = idx"
              :class="[
                'transition-all duration-300 rounded-full',
                currentIndex === idx 
                  ? 'w-8 h-3 bg-gradient-to-r from-yellow-500 to-orange-500' 
                  : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
              ]"
              :aria-label="`Go to slide ${idx + 1}`"
            ></button>
          </div>

          <button 
            @click="goToNext"
            :disabled="currentIndex >= totalSlides - 1"
            :class="[
              'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg',
              currentIndex >= totalSlides - 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50' 
                : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-xl hover:scale-110 active:scale-95'
            ]"
            aria-label="Next"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <!-- Awards Slider -->
        <div class="overflow-hidden relative">
          <div 
            class="flex transition-transform duration-700 ease-in-out"
            :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
          >
            <!-- Each Slide -->
            <div 
              v-for="(slide, slideIdx) in slides" 
              :key="slideIdx"
              class="w-full flex-shrink-0"
            >
              <!-- Cards in slide -->
              <div 
                :class="[
                  'grid gap-4 mx-auto',
                  slide.length === 1 ? 'grid-cols-1 max-w-sm' : '',
                  slide.length === 2 ? 'grid-cols-2 max-w-3xl' : '',
                  slide.length === 3 ? 'grid-cols-3 max-w-5xl' : '',
                  slide.length >= 4 ? 'grid-cols-4 max-w-7xl' : ''
                ]"
              >
                <div 
                  v-for="award in slide" 
                  :key="award.id"
                  class="award-card group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden transform hover:-translate-y-1"
                >
          <!-- Shine effect on hover -->
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
          
          <!-- Award Image -->
          <div class="relative h-48 overflow-hidden bg-gradient-to-br from-yellow-100 to-orange-100">
            <img 
              v-if="award.image"
              :src="award.image" 
              :alt="award.title"
              class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <svg class="w-20 h-20 text-yellow-500 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            
            <!-- Floating stars decoration -->
            <div class="absolute top-3 right-3 flex gap-1">
              <span class="text-xl animate-bounce" style="animation-delay: 0s">⭐</span>
              <span class="text-base animate-bounce" style="animation-delay: 0.1s">✨</span>
              <span class="text-xl animate-bounce" style="animation-delay: 0.2s">🌟</span>
            </div>
          </div>

          <!-- Award Content -->
          <div class="p-4">
            <h3 class="text-lg font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors duration-300 line-clamp-2">
              {{ award.title }}
            </h3>
            <p class="text-sm text-gray-600 leading-relaxed line-clamp-2">
              {{ award.description }}
            </p>
            
            <!-- Decorative bottom border -->
            <div class="mt-4 pt-3 border-t border-yellow-200 flex items-center justify-between">
              <div class="flex gap-1 text-lg">
                <span>🏆</span>
                <span>🥇</span>
                <span>🎖️</span>
              </div>
              <NuxtLink 
                :to="`/awards/${award.slug}`"
                class="text-sm text-orange-600 font-semibold hover:text-orange-700 transition-colors flex items-center gap-1 group/btn"
              >
                Chi tiết
                <svg class="w-3 h-3 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </NuxtLink>
            </div>
          </div>

          <!-- Corner decoration -->
          <div class="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 opacity-20 transform -rotate-45 -translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500"></div>
        </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <div class="inline-block animate-bounce mb-4">
          <svg class="w-24 h-24 text-yellow-400 mx-auto" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <p class="text-gray-500 text-lg">Chưa có thành tích nào được công bố</p>
        <p class="text-gray-400 mt-2">Hãy cố gắng học tập để giành những thành tích tuyệt vời nhé! 💪</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .award-card {
    margin-bottom: 0.5rem;
  }
}

/* Line clamp utilities */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
