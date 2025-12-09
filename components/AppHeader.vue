<template>
  <header class="sticky top-0 z-50 shadow-md">
    <!-- Top Bar - Teal Background -->
    <div class="bg-gradient-to-r from-teal-500 to-teal-600" style="background: linear-gradient(90deg, #3FB3AA 0%, #45BEB5 100%);">
      <div class="container mx-auto px-6 max-w-content flex items-center justify-between py-3">
        <!-- Mobile Menu Button -->
        <button 
          @click="toggleMenu" 
          class="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition"
          aria-label="Toggle menu"
        >
          <svg v-if="!isMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <!-- Logo -->
        <NuxtLink :to="logo.link || '/'" class="flex items-center gap-2 hover:opacity-90 transition">
          <div v-if="logo.icon" class="bg-white rounded-lg p-1.5 shadow-sm">
            <img :src="logo.icon" :alt="logo.text" class="w-8 h-8 object-contain" />
          </div>
          <div v-else class="bg-white rounded-lg p-1.5 shadow-sm">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
              <span class="font-bold text-white text-lg">{{ (logo.text || 'M').charAt(0) }}</span>
            </div>
          </div>
          <div class="text-white">
            <div v-if="logo.sub_text" class="text-xs font-medium opacity-90">{{ logo.sub_text }}</div>
            <div class="text-lg font-bold" :class="{ '-mt-1': logo.sub_text }">{{ logo.text || 'MATHFUN' }}</div>
          </div>
        </NuxtLink>

        <!-- Search Bar -->
        <div class="hidden md:flex flex-1 max-w-2xl mx-8">
          <div class="relative w-full">
            <input 
              type="text" 
              :placeholder="search.placeholder || 'Tìm kiếm khóa học, bài tập, tài liệu...'"
              class="w-full px-5 py-3 pr-12 rounded-full text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 shadow-md"
            />
            <button class="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <!-- User Menu (when logged in) -->
          <div v-if="currentUser" class="relative hidden sm:block">
            <button 
              @click="toggleUserMenu"
              class="flex items-center gap-2 text-white hover:bg-white/10 px-4 py-2 rounded-full transition font-medium"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <span>{{ currentUser.username }}</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            <!-- Dropdown Menu -->
            <Transition name="fade">
              <div v-if="isUserMenuOpen" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                <div class="px-4 py-2 border-b border-gray-100">
                  <p class="text-sm font-semibold text-gray-900">{{ currentUser.username }}</p>
                  <p class="text-xs text-gray-500">{{ currentUser.email }}</p>
                </div>
                <button 
                  @click="handleLogout"
                  class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  Đăng xuất
                </button>
              </div>
            </Transition>
          </div>

          <!-- Login Button (when not logged in) -->
          <button 
            v-else-if="buttons.login.enabled"
            @click="openAuthModal"
            class="hidden sm:flex items-center gap-2 text-white hover:bg-white/10 px-4 py-2 rounded-full transition font-medium"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <span>{{ buttons.login.text }}</span>
          </button>

          <button 
            v-if="buttons.consultation.enabled"
            @click="openConsultationModal"
            class="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-5 py-2.5 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{{ buttons.consultation.text }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation Bar - Desktop Only -->
    <div class="hidden md:block bg-white border-b border-gray-200">
      <div class="container mx-auto px-6 max-w-content">
        <nav class="flex items-center gap-1 text-sm font-medium overflow-x-auto">
          <NuxtLink 
            v-for="item in navigation"
            :key="item.id"
            :to="item.link" 
            :exact="item.link === '/'"
            class="flex items-center gap-2 px-4 py-3 hover:text-teal-600 hover:bg-teal-50 transition whitespace-nowrap border-b-2 border-transparent hover:border-teal-600"
            :class="{ 
              'text-orange-600 font-semibold hover:bg-orange-50 hover:border-orange-600': item.highlight,
              'active-class': 'text-teal-600 bg-teal-50 border-teal-600'
            }"
            active-class="text-teal-600 bg-teal-50 border-teal-600"
          >
            <img v-if="item.icon?.url" :src="getImageUrl(item.icon.url)" :alt="item.label" class="w-5 h-5 object-contain" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </nav>
      </div>
    </div>

    <!-- Mobile Menu Overlay -->
    <Transition name="fade">
      <div 
        v-if="isMenuOpen" 
        class="fixed inset-0 bg-black/50 md:hidden z-40"
        @click="closeMenu"
      ></div>
    </Transition>

    <!-- Mobile Menu Slide-in -->
    <Transition name="slide">
      <div 
        v-if="isMenuOpen" 
        class="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl md:hidden z-50 overflow-y-auto"
      >
        <!-- Mobile Menu Header -->
        <div class="bg-gradient-to-r from-teal-500 to-teal-600 p-6 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div v-if="logo.icon" class="bg-white rounded-lg p-1.5 shadow-sm">
              <img :src="logo.icon" :alt="logo.text" class="w-8 h-8 object-contain" />
            </div>
            <div v-else class="bg-white rounded-lg p-1.5 shadow-sm">
              <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                <span class="font-bold text-white text-lg">{{ (logo.text || 'M').charAt(0) }}</span>
              </div>
            </div>
            <div class="text-white">
              <div v-if="logo.sub_text" class="text-xs font-medium opacity-90">{{ logo.sub_text }}</div>
              <div class="text-lg font-bold" :class="{ '-mt-1': logo.sub_text }">{{ logo.text || 'MATHFUN' }}</div>
            </div>
          </div>
          <button @click="closeMenu" class="text-white p-2 hover:bg-white/10 rounded-lg transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Mobile Menu Items -->
        <nav class="p-4">
          <NuxtLink 
            v-for="item in navigation"
            :key="item.id"
            :to="item.link" 
            :exact="item.link === '/'"
            @click="closeMenu"
            class="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-600 rounded-lg transition mb-1"
            :class="{ 
              'text-orange-600 bg-orange-50 hover:bg-orange-100': item.highlight,
              'font-semibold': item.highlight
            }"
            active-class="bg-teal-50 text-teal-600 font-semibold"
          >
            <img v-if="item.icon?.url" :src="getImageUrl(item.icon.url)" :alt="item.label" class="w-5 h-5 object-contain" />
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            <span :class="{ 'font-semibold': item.highlight, 'font-medium': !item.highlight }">{{ item.label }}</span>
          </NuxtLink>
        </nav>

        <!-- Mobile Menu Footer -->
        <div class="p-4 border-t border-gray-200 space-y-2">
          <button 
            v-if="buttons.login.enabled"
            @click="openAuthModal"
            class="w-full flex items-center justify-center gap-2 px-4 py-3 text-teal-600 border-2 border-teal-600 rounded-lg hover:bg-teal-50 transition font-medium"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <span>{{ buttons.login.text }}</span>
          </button>
          <button 
            v-if="buttons.consultation.enabled"
            @click="openConsultationModal"
            class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg hover:shadow-lg transition font-semibold"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{{ buttons.consultation.text }}</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Consultation Modal -->
    <ConsultationModal 
      v-model="isConsultationModalOpen"
      @submit="handleConsultationSubmit"
    />

    <!-- Auth Modal -->
    <AuthModal 
      :is-open="isAuthModalOpen"
      @close="isAuthModalOpen = false"
      @success="handleAuthSuccess"
    />
  </header>
</template>

<script setup>
// Use useState for persistent state across page navigation
const isMenuOpen = ref(false)
const isConsultationModalOpen = useState('consultation-modal-open', () => false)
const isAuthModalOpen = useState('auth-modal-open', () => false)
const isUserMenuOpen = ref(false)

// Current user state
const currentUser = ref(null)

// Load user from localStorage on mount
onMounted(() => {
  if (process.client) {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        currentUser.value = JSON.parse(userStr)
      } catch (e) {
        console.error('Failed to parse user data:', e)
      }
    }
  }
})

// Load global config
const { data: globalConfig } = await useAsyncData('global-config-header', () => $fetch('/api/mock/global'))

// console.log('===== HEADER GLOBAL CONFIG =====')
// console.log('globalConfig:', globalConfig.value)
// console.log('header:', globalConfig.value?.data?.header)
// console.log('search:', globalConfig.value?.data?.header?.search)
// console.log('search.placeholder:', globalConfig.value?.data?.header?.search?.placeholder)

// Helper to build full URL for images from Strapi
const config = useRuntimeConfig()
const strapiBaseUrl = config.public.apiBase?.replace('/api', '') || 'http://localhost:1337'

const getImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${strapiBaseUrl}${url}`
}

// Computed properties for header data
const header = computed(() => globalConfig.value?.data?.header || {})
const logo = computed(() => header.value.logo || { text: 'MATHFUN', sub_text: '', icon: '', link: '/' })
const search = computed(() => header.value.search || { placeholder: 'Tìm kiếm khóa học, bài tập, tài liệu...' })
const navigation = computed(() => header.value.navigation || [])
const buttons = computed(() => header.value.buttons || { login: { text: 'Đăng nhập', enabled: true }, consultation: { text: 'Yêu cầu tư vấn', enabled: true } })

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const openConsultationModal = () => {
  isConsultationModalOpen.value = true
  closeMenu() // Close mobile menu if open
}

const handleConsultationSubmit = (data) => {
  console.log('Consultation data:', data)
  // Here you can send data to your API
}

const openAuthModal = () => {
  isAuthModalOpen.value = true
  closeMenu() // Close mobile menu if open
}

const handleAuthSuccess = (data) => {
  // console.log('Auth success:', data)
  // Update current user from auth response
  if (data.user) {
    currentUser.value = data.user
  }
}

const handleLogout = () => {
  if (process.client) {
    localStorage.removeItem('jwt')
    localStorage.removeItem('user')
    currentUser.value = null
    isUserMenuOpen.value = false
  }
  // Optionally reload the page or redirect
  window.location.reload()
}

// Close user menu when clicking outside
if (process.client) {
  document.addEventListener('click', (e) => {
    if (isUserMenuOpen.value && !e.target.closest('.relative')) {
      isUserMenuOpen.value = false
    }
  })
}
</script>

<style scoped>
/* Fade transition for overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide transition for menu */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
