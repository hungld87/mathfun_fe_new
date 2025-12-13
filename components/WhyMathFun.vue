<script setup lang="ts">
interface Highlight {
  id: number
  title: string
  description: string
}

interface Props {
  title?: string
  highlights?: Highlight[]
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Tại sao phụ huynh nên lựa chọn MathFun',
  highlights: () => []
})

// Icons for each highlight (you can customize these)
const icons = [
  `<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
  </svg>`,
  `<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
  </svg>`,
  `<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
  </svg>`,
  `<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
  </svg>`,
  `<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
  </svg>`,
  `<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>`
]
</script>

<template>
  <section class="why-mathfun relative py-12 md:py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
    <!-- Animated background elements -->
    <div class="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
    <div class="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
    <div class="absolute -bottom-8 left-1/3 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

    <div class="container mx-auto px-6 max-w-content relative z-10">
      <!-- Section Title -->
      <div class="text-center mb-12">
        <div class="inline-block mb-3">
          <span class="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-full shadow-lg">
            ⭐ Điểm nổi bật
          </span>
        </div>
        <h2 class="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
          {{ title }}
        </h2>
        <p class="text-base text-gray-600 max-w-2xl mx-auto">
          Những lý do khiến hàng nghìn phụ huynh tin tưởng và lựa chọn MathFun cho con em mình
        </p>
      </div>

      <!-- Highlights Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="(highlight, index) in highlights" 
          :key="highlight.id"
          class="group relative bg-white rounded-xl p-6 shadow-lg hover:shadow-xl border-2 border-transparent hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1"
          :class="[
            'animate-fade-in-up',
            `animation-delay-${index * 100}`
          ]"
        >
          <!-- Subtle background gradient on hover -->
          <div class="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <!-- Number badge -->
          <div class="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-base shadow-lg transform group-hover:scale-110 transition-transform duration-300">
            {{ index + 1 }}
          </div>

          <!-- Icon -->
          <div class="relative mb-4 text-blue-600 transform group-hover:scale-105 transition-all duration-300" v-html="icons[index % icons.length]"></div>

          <!-- Content -->
          <h3 class="relative text-lg font-bold text-gray-900 mb-2 transition-colors duration-300">
            {{ highlight.title }}
          </h3>
          <p class="relative text-sm text-gray-600 leading-relaxed">
            {{ highlight.description }}
          </p>

          <!-- Decorative corner -->
          <div class="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-blue-100/30 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </div>

      <!-- Call to Action -->
      <!-- <div class="text-center mt-16">
        <div class="inline-flex flex-col md:flex-row items-center gap-4 p-8 bg-white rounded-2xl shadow-xl">
          <div class="text-left">
            <h3 class="text-2xl font-bold text-gray-900 mb-2">
              Sẵn sàng cho con bước vào hành trình học tập?
            </h3>
            <p class="text-gray-600">
              Đăng ký ngay để nhận tư vấn miễn phí và ưu đãi đặc biệt!
            </p>
          </div>
          <button class="whitespace-nowrap px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2">
            Đăng ký ngay
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </button>
        </div>
      </div> -->
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

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}

.animation-delay-0 { animation-delay: 0ms; }
.animation-delay-100 { animation-delay: 100ms; }
.animation-delay-200 { animation-delay: 200ms; }
.animation-delay-300 { animation-delay: 300ms; }
.animation-delay-400 { animation-delay: 400ms; }
.animation-delay-500 { animation-delay: 500ms; }
</style>
