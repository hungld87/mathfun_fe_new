<script setup lang="ts">
import { marked } from 'marked'

const route = useRoute()
const slug = route.params.slug

definePageMeta({
  title: 'Chi tiết thành tích · MathFun'
})

const { get } = useApi()
const { data: awardsList } = await useAsyncData('awards-list', () => get('/awards'))
const awardDetail = computed(() => {
  const found = awardsList.value?.find((a: any) => a.slug === slug)
  console.log('🔍 Found award:', found)
  return found
})

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
})

// Extract image from markdown content
const extractImageFromContent = (content: string) => {
  const imgRegex = /!\[.*?\]\((.*?)\)/
  const match = content?.match(imgRegex)
  return match ? match[1] : null
}

// Get featured image
const featuredImage = computed(() => {
  if (!awardDetail.value) return null
  return extractImageFromContent(awardDetail.value.content)
})

// Convert markdown to HTML
const contentHtml = computed(() => {
  if (!awardDetail.value?.content) return ''
  return marked(awardDetail.value.content)
})

// Format date
const formattedDate = computed(() => {
  if (!awardDetail.value?.publishedAt) return ''
  const date = new Date(awardDetail.value.publishedAt)
  return date.toLocaleDateString('vi-VN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
})

// Share functions
const linkCopied = ref(false)

const shareOnFacebook = () => {
  if (process.client) {
    const url = encodeURIComponent(window.location.href)
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
    window.open(facebookUrl, '_blank', 'width=600,height=400')
  }
}

const copyLink = async () => {
  if (process.client) {
    try {
      await navigator.clipboard.writeText(window.location.href)
      linkCopied.value = true
      setTimeout(() => {
        linkCopied.value = false
      }, 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }
}
</script>

<template>
  <main class="bg-background min-h-screen">
    <div class="container mx-auto px-6 py-8 max-w-4xl">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <NuxtLink to="/" class="hover:text-primary transition-colors">
          Trang chủ
        </NuxtLink>
        <span>/</span>
        <span class="text-gray-900 font-medium">{{ awardDetail?.title || 'Chi tiết thành tích' }}</span>
      </nav>

      <!-- Award Detail -->
      <article class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <!-- Header with gradient -->
        <div class="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 p-8 text-white">
          <div class="flex items-center gap-3 mb-4">
            <div class="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div>
              <p class="text-yellow-100 text-sm">Bảng Vàng Thành Tích</p>
              <p class="text-white/90 text-sm">{{ formattedDate }}</p>
            </div>
          </div>
          
          <h1 class="text-3xl md:text-4xl font-black mb-3">
            {{ awardDetail?.title }}
          </h1>
          
          <p v-if="awardDetail?.description" class="text-lg text-yellow-50 leading-relaxed">
            {{ awardDetail.description }}
          </p>
        </div>

        <!-- Featured Image -->
        <div v-if="featuredImage" class="relative h-96 bg-gradient-to-br from-yellow-100 to-orange-100">
          <img 
            :src="featuredImage" 
            :alt="awardDetail?.title"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Content -->
        <div class="p-8 md:p-12">
          <!-- Markdown Content -->
          <div 
            v-if="contentHtml" 
            class="prose prose-lg max-w-none
              prose-headings:font-bold prose-headings:text-gray-900
              prose-h1:text-3xl prose-h1:mb-6 prose-h1:pb-3 prose-h1:border-b-2 prose-h1:border-yellow-400
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-orange-600
              prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900 prose-strong:font-bold
              prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
              prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
              prose-li:text-gray-700 prose-li:mb-2
              prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
              prose-blockquote:border-l-4 prose-blockquote:border-yellow-400 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
              prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm"
            v-html="contentHtml"
          />

          <!-- Share buttons -->
          <div class="pt-6 border-t border-gray-200 mt-8">
            <p class="text-sm text-gray-600 mb-3 font-medium">Chia sẻ bài viết:</p>
            <div class="flex gap-3">
              <button 
                @click="shareOnFacebook"
                class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
              <button 
                @click="copyLink"
                class="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                {{ linkCopied ? 'Đã sao chép!' : 'Sao chép link' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <!-- <div class="px-8 pb-8 border-t border-gray-100 pt-6">
          <NuxtLink 
            to="/" 
            class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Quay lại
          </NuxtLink>
        </div> -->
      </article>
    </div>
  </main>
</template>

<style scoped>
/* Custom styles for markdown content */
</style>
