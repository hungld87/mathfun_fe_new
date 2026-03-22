<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { marked } from 'marked'

const route = useRoute()
const slug = route.params.slug as string

definePageMeta({
  title: 'Làm bài thi · MathFun'
})

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
})

// Helper function to convert YouTube links to embedded iframe
const processYouTubeLinks = (html: string): string => {
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&].*)?/g
  
  return html.replace(youtubeRegex, (match, videoId) => {
    return `<div class="video-container my-4">
      <iframe 
        width="100%" 
        height="360" 
        src="https://www.youtube.com/embed/${videoId}" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen
        class="rounded-lg shadow-lg"
      ></iframe>
    </div>`
  })
}

// Function to parse question markdown
const parseQuestion = (question: string): string => {
  if (!question) return ''
  let html = marked.parse(question) as string
  html = processYouTubeLinks(html)
  return html
}

// Auth state
const isAuthModalOpen = ref(false)
const isAuthenticated = ref(false)
const jwtToken = ref<string | null>(null)
const currentUser = ref<any>(null)

// Check authentication and load current user
if (process.client) {
  jwtToken.value = localStorage.getItem('jwt')
  isAuthenticated.value = !!jwtToken.value
  
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      currentUser.value = JSON.parse(userStr)
    } catch (e) {
      console.error('Failed to parse user data:', e)
    }
  }
  
  // IMPORTANT: Force login if not authenticated
  if (!jwtToken.value) {
    isAuthModalOpen.value = true
  }
}

// Fetch practice detail using slug
const { data: practiceResponse, error: practiceError, refresh: refreshPractice } = await useAsyncData(
  `practice-detail-${slug}`, 
  async () => {
    const headers: any = {}
    
    // Add JWT token to headers if available
    if (process.client) {
      const token = localStorage.getItem('jwt')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }
    
    return await $fetch('/api/mock/practice-detail', {
      params: { slug },
      headers
    })
  },
  {
    server: false
  }
)

const practice = computed(() => practiceResponse.value?.data)

// Check if user has already submitted this practice
const hasSubmittedBefore = ref(false)
const previousSubmission = ref<any>(null)

// Fetch user's submission history for this practice
const checkPreviousSubmission = async () => {
  if (!isAuthenticated.value || !documentId.value) return
  
  try {
    const headers: any = {}
    if (process.client) {
      const token = localStorage.getItem('jwt')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }
    
    // Call Strapi API directly
    const apiBase = 'http://127.0.0.1:1337/api'
    const response = await $fetch(`${apiBase}/practice-scorings/my-history`, {
      headers,
      params: {
        practiceDocumentId: documentId.value
      }
    })
    
    // If user has submissions for this practice, get the first one
    if (response.data && response.data.length > 0) {
      hasSubmittedBefore.value = true
      previousSubmission.value = response.data[0]
      
      // Build gradingResult from the submission history
      const submission = previousSubmission.value
      gradingResult.value = {
        summary: {
          totalScore: submission.totalScore,
          maxScore: submission.maxScore,
          percentage: submission.percentage,
          correctCount: submission.correctCount,
          totalQuestions: submission.totalQuestions,
          isPassed: submission.isPassed
        },
        // We don't have details in history, so show summary only
        details: null
      }
      
      showResult.value = true
      canLeave.value = true
      showSuccessModal.value = true
      
      // Clear localStorage since test is already completed
      clearStorage()
    }
  } catch (error) {
    console.error('Error checking previous submission:', error)
  }
}

// Watch for 403 error and show auth modal immediately
watch(practiceError, (error) => {
  // console.log('practiceError changed:', error)
  // console.log('error?.statusCode:', error?.statusCode)
  // console.log('error?.status:', error?.status)
  // console.log('Full error object:', JSON.stringify(error, null, 2))
  
  if (error?.statusCode === 403 || error?.status === 403) {
    // console.log('🔴 403 detected! Opening auth modal...')
    isAuthModalOpen.value = true
  }
}, { immediate: true })

const documentId = computed(() => practice.value?.documentId || slug)

// Get user email for unique storage key
const userEmail = computed(() => {
  if (!currentUser.value) return 'guest'
  return currentUser.value.email || currentUser.value.id || 'guest'
})

// LocalStorage keys using documentId AND userEmail for uniqueness per user
const STORAGE_KEY_TIME = computed(() => `practice_time_${userEmail.value}_${documentId.value}`)
const STORAGE_KEY_ANSWERS = computed(() => `practice_answers_${userEmail.value}_${documentId.value}`)
const STORAGE_KEY_START_TIME = computed(() => `practice_start_${userEmail.value}_${documentId.value}`)

// User answers state
const userAnswers = ref<Record<number, string>>({})

// Timer
const timeLeft = ref(0)
const timerInterval = ref<NodeJS.Timeout | null>(null)

// Load saved data from localStorage
const loadSavedData = () => {
  if (process.client) {
    // Load answers
    const savedAnswers = localStorage.getItem(STORAGE_KEY_ANSWERS.value)
    if (savedAnswers) {
      try {
        userAnswers.value = JSON.parse(savedAnswers)
      } catch (e) {
        console.error('Failed to parse saved answers:', e)
      }
    }

    // Load time
    const savedTime = localStorage.getItem(STORAGE_KEY_TIME.value)
    const startTime = localStorage.getItem(STORAGE_KEY_START_TIME.value)
    
    if (savedTime && startTime) {
      const elapsed = Math.floor((Date.now() - parseInt(startTime)) / 1000)
      const remainingTime = parseInt(savedTime) - elapsed
      
      if (remainingTime > 0) {
        timeLeft.value = remainingTime
      } else {
        // Time's up, show timeout modal
        timeLeft.value = 0
        showTimeoutModal.value = true
      }
    } else if (practice.value?.duration_time) {
      // First time, set full duration
      timeLeft.value = practice.value.duration_time * 60
      localStorage.setItem(STORAGE_KEY_TIME.value, timeLeft.value.toString())
      localStorage.setItem(STORAGE_KEY_START_TIME.value, Date.now().toString())
    }
  }
}

// Save data to localStorage
const saveData = () => {
  if (process.client) {
    localStorage.setItem(STORAGE_KEY_ANSWERS.value, JSON.stringify(userAnswers.value))
    localStorage.setItem(STORAGE_KEY_TIME.value, timeLeft.value.toString())
  }
}

// Clear storage
const clearStorage = () => {
  if (process.client) {
    localStorage.removeItem(STORAGE_KEY_TIME.value)
    localStorage.removeItem(STORAGE_KEY_ANSWERS.value)
    localStorage.removeItem(STORAGE_KEY_START_TIME.value)
  }
}

// Prevent navigation when test is active
const canLeave = ref(false)

// Browser beforeunload - prevent refresh/close tab
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (!showResult.value && !canLeave.value) {
    e.preventDefault()
    e.returnValue = ''
    return ''
  }
}

// Start timer when component mounts
onMounted(() => {
  // Check if user has submitted this practice before
  if (isAuthenticated.value) {
    checkPreviousSubmission()
  }
  
  loadSavedData()
  if (timeLeft.value > 0 && !hasSubmittedBefore.value) {
    startTimer()
  }
  
  // Add beforeunload listener
  if (process.client) {
    window.addEventListener('beforeunload', handleBeforeUnload)
  }
})

onUnmounted(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
  // Save current state before leaving
  if (!showResult.value) {
    saveData()
  }
  
  // Remove beforeunload listener
  if (process.client) {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
})

// Route guard - prevent navigation within app
onBeforeRouteLeave((to, from, next) => {
  if (!showResult.value && !canLeave.value) {
    // Show leave modal
    showLeaveModal.value = true
    next(false)
  } else {
    next()
  }
})

const startTimer = () => {
  // Require authentication to start timer
  if (!isAuthenticated.value) {
    isAuthModalOpen.value = true
    return
  }
  
  timerInterval.value = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
      // Save time every 5 seconds
      if (timeLeft.value % 5 === 0) {
        saveData()
      }
    } else {
      if (timerInterval.value) {
        clearInterval(timerInterval.value)
      }
      // Show timeout modal when time is up
      showTimeoutModal.value = true
    }
  }, 1000)
}

// Watch userAnswers and save to localStorage
watch(userAnswers, () => {
  if (process.client && !showResult.value) {
    saveData()
  }
}, { deep: true })

const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const timePercentage = computed(() => {
  if (!practice.value?.duration_time) return 100
  const totalSeconds = practice.value.duration_time * 60
  return (timeLeft.value / totalSeconds) * 100
})

const timeColor = computed(() => {
  if (timePercentage.value > 50) return 'text-green-600'
  if (timePercentage.value > 25) return 'text-orange-600'
  return 'text-red-600'
})

// Answer handlers
const selectAnswer = (questionId: number, answer: string) => {
  // Require authentication to answer
  if (!isAuthenticated.value) {
    isAuthModalOpen.value = true
    return
  }
  
  userAnswers.value[questionId] = answer
}

// Checkbox handler
const toggleCheckbox = (questionId: number, answer: string) => {
  // Require authentication to answer
  if (!isAuthenticated.value) {
    isAuthModalOpen.value = true
    return
  }
  
  const currentAnswers = userAnswers.value[questionId] ? userAnswers.value[questionId].split(',') : []
  const index = currentAnswers.indexOf(answer)
  
  if (index > -1) {
    currentAnswers.splice(index, 1)
  } else {
    currentAnswers.push(answer)
  }
  
  userAnswers.value[questionId] = currentAnswers.filter(a => a).join(',')
  
  // Remove key if empty
  if (!userAnswers.value[questionId]) {
    delete userAnswers.value[questionId]
  }
}

// Check if checkbox is selected
const isCheckboxSelected = (questionId: number, answer: string) => {
  const currentAnswers = userAnswers.value[questionId] ? userAnswers.value[questionId].split(',') : []
  return currentAnswers.includes(answer)
}

// Progress tracking
const answeredCount = computed(() => {
  return Object.keys(userAnswers.value).length
})

const totalQuestions = computed(() => {
  return practice.value?.question_answer?.length || 0
})

const progressPercentage = computed(() => {
  if (totalQuestions.value === 0) return 0
  return (answeredCount.value / totalQuestions.value) * 100
})

// Submit
const isSubmitting = ref(false)
const showResult = ref(false)
const showConfirmModal = ref(false)
const showLeaveModal = ref(false)
const showTimeoutModal = ref(false)
const showSuccessModal = ref(false)

// Result data from auto-grading
const gradingResult = ref<any>(null)

const handleSubmit = () => {
  // Require authentication to submit
  if (!isAuthenticated.value) {
    isAuthModalOpen.value = true
    return
  }
  
  if (answeredCount.value === 0) {
    alert('Bạn chưa trả lời câu hỏi nào!')
    return
  }

  // Show confirmation modal
  showConfirmModal.value = true
}

const handleLeave = () => {
  // Show leave confirmation modal
  showLeaveModal.value = true
}

const confirmLeave = () => {
  showLeaveModal.value = false
  // Allow navigation
  canLeave.value = true
  // Navigate to practice list
  navigateTo('/practice')
}

const cancelLeave = () => {
  showLeaveModal.value = false
}

const handleTimeoutRetry = () => {
  showTimeoutModal.value = false
  resetTest()
}

const handleTimeoutExit = () => {
  showTimeoutModal.value = false
  clearStorage()
  canLeave.value = true
  navigateTo('/practice')
}

const confirmSubmit = async () => {
  showConfirmModal.value = false
  isSubmitting.value = true

  // Stop timer
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }

  // Calculate time spent (in seconds)
  const totalDuration = (practice.value?.duration_time || 0) * 60
  const timeSpent = totalDuration - timeLeft.value

  // console.log('=== PREPARING SCORES ===')
  // console.log('userAnswers:', userAnswers.value)
  // console.log('Total questions:', practice.value?.question_answer?.length)

  // Prepare scores payload with question documentId, solution, and score
  const scores = practice.value?.question_answer?.map((qa: any, index: number) => {
    // IMPORTANT: Use qa.id as key (consistent with input/radio/checkbox v-model)
    const userAnswer = userAnswers.value[qa.id]
    
    // console.log(`Question ${index + 1} (id: ${qa.id}):`, { 
    //   answerType: qa.answer_type,
    //   documentId: qa.documentId,
    //   qaId: qa.id,
    //   userAnswer: userAnswer,
    //   hasAnswer: !!userAnswer 
    // })
    
    // Skip if no answer
    if (!userAnswer || userAnswer.toString().trim() === '') return null
    
    // Process solution based on answer type
    let solutionValue = userAnswer.toString().trim()
    
    // For checkbox: convert comma-separated string to formatted string
    if (qa.answer_type === 'checkbox' && solutionValue.includes(',')) {
      solutionValue = solutionValue.split(',').filter((a: string) => a.trim()).join(', ')
    }
    
    // Calculate score (you can adjust this logic based on your needs)
    // For now, we'll set score to 0 (backend should calculate actual score)
    const score = 0
    
    return {
      question: qa.documentId || `q${qa.id}`,
      solution: solutionValue,
      score: score
    }
  }).filter((item: any) => item !== null)

  // Prepare submission payload according to new API format
  const payload = {
    practiceDocumentId: documentId.value,
    durationtime: timeSpent,
    scores: scores
  }

  // console.log('=== SUBMITTING PRACTICE ===')
  // console.log('Payload:', JSON.stringify(payload, null, 2))
  // console.log('Number of scores:', scores.length)

  try {
    // Call submit API - directly to Strapi
    const headers: any = {
      'Content-Type': 'application/json'
    }
    
    // Add JWT token if available
    if (process.client) {
      const token = localStorage.getItem('jwt')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      } else {
        console.log('No JWT token found')
      }
    }

    const apiBase = 'http://127.0.0.1:1337/api'
    const response = await $fetch(`${apiBase}/practice-scorings/submit`, {
      method: 'POST',
      headers: headers,
      body: payload
    })

    console.log('Submit response:', response)

    // Save grading result
    gradingResult.value = response.data
    
    // Debug: log the grading result structure
    console.log('Grading Result Structure:', {
      hasSummary: !!gradingResult.value?.summary,
      hasDetails: !!gradingResult.value?.details,
      summary: gradingResult.value?.summary,
      detailsCount: gradingResult.value?.details?.length
    })

    // Clear localStorage after successful submit
    clearStorage()

    isSubmitting.value = false
    showResult.value = true
    canLeave.value = true
    
    // Show success modal with results
    showSuccessModal.value = true
  } catch (error: any) {
    console.error('Error submitting practice:', error)
    
    // Check if it's 403 Forbidden (not authenticated)
    if (error?.statusCode === 403 || error?.status === 403) {
      isSubmitting.value = false
      isAuthModalOpen.value = true
      return
    }
    
    isSubmitting.value = false
    
    // Show error message to user
    alert('Có lỗi khi gửi bài thi: ' + (error?.message || 'Vui lòng thử lại sau.'))
  }
}

const cancelSubmit = () => {
  showConfirmModal.value = false
}

const handleSuccessRetry = () => {
  showSuccessModal.value = false
  resetTest()
}

const handleSuccessExit = () => {
  showSuccessModal.value = false
  canLeave.value = true
  navigateTo('/practice')
}

// Helper to check if question is correct
const isQuestionCorrect = (questionIndex: number): boolean | null => {
  if (!gradingResult.value || !gradingResult.value.details) return null
  const detail = gradingResult.value.details[questionIndex]
  return detail?.is_correct || false
}

// Helper to get question result color
const getQuestionColor = (questionIndex: number): string => {
  const isCorrect = isQuestionCorrect(questionIndex)
  if (isCorrect === null) return 'border-gray-200'
  return isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
}

// Computed properties for score display
const displayTotalScore = computed(() => {
  // Try summary first
  if (gradingResult.value?.summary?.totalScore !== undefined) {
    return gradingResult.value.summary.totalScore
  }
  // Fallback: calculate from details
  if (gradingResult.value?.details) {
    return gradingResult.value.details.reduce((sum: number, detail: any) => sum + (detail.score || 0), 0)
  }
  return 0
})

const displayMaxScore = computed(() => {
  // Try summary first
  if (gradingResult.value?.summary?.maxScore !== undefined) {
    return gradingResult.value.summary.maxScore
  }
  // Fallback: calculate from details
  if (gradingResult.value?.details) {
    return gradingResult.value.details.reduce((sum: number, detail: any) => sum + (detail.max_score || 0), 0)
  }
  return 100
})

const displayPercentage = computed(() => {
  // Try summary first
  if (gradingResult.value?.summary?.percentage !== undefined) {
    return gradingResult.value.summary.percentage
  }
  // Fallback: calculate from scores
  if (displayMaxScore.value > 0) {
    return Math.round((displayTotalScore.value / displayMaxScore.value) * 100)
  }
  return 0
})

const displayCorrectCount = computed(() => {
  // Try summary first
  if (gradingResult.value?.summary?.correctCount !== undefined) {
    return gradingResult.value.summary.correctCount
  }
  // Fallback: count from details
  if (gradingResult.value?.details) {
    return gradingResult.value.details.filter((detail: any) => detail.is_correct).length
  }
  return 0
})

const displayTotalQuestions = computed(() => {
  // Try summary first
  if (gradingResult.value?.summary?.totalQuestions !== undefined) {
    return gradingResult.value.summary.totalQuestions
  }
  // Fallback: count details
  if (gradingResult.value?.details) {
    return gradingResult.value.details.length
  }
  return 0
})

const resetTest = () => {
  // Clear all answers
  userAnswers.value = {}
  showResult.value = false
  showSuccessModal.value = false
  canLeave.value = false
  
  // Clear storage completely
  clearStorage()
  
  // Reset timer and start fresh
  if (practice.value?.duration_time) {
    timeLeft.value = practice.value.duration_time * 60
    if (process.client) {
      localStorage.setItem(STORAGE_KEY_TIME.value, timeLeft.value.toString())
      localStorage.setItem(STORAGE_KEY_START_TIME.value, Date.now().toString())
    }
    startTimer()
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Handle auth close (without login)
const handleAuthClose = () => {
  isAuthModalOpen.value = false
  canLeave.value = true
  navigateTo('/practice')
}

// Handle auth success
const handleAuthSuccess = async () => {
  isAuthModalOpen.value = false
  
  // Update auth state and user info
  if (process.client) {
    jwtToken.value = localStorage.getItem('jwt')
    isAuthenticated.value = !!jwtToken.value
    
    // Load user info
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        currentUser.value = JSON.parse(userStr)
      } catch (e) {
        console.error('Failed to parse user data:', e)
      }
    }
  }
  
  // Check if user has already submitted this practice
  await checkPreviousSubmission()
  
  // If user hasn't submitted before, allow them to start the test
  if (!hasSubmittedBefore.value) {
    loadSavedData()
    if (timeLeft.value > 0) {
      startTimer()
    }
  }
}
</script>

<template>
  <main class="bg-background min-h-screen">
    <!-- Loading State -->
    <div v-if="!practice" class="container mx-auto px-6 py-20 max-w-4xl">
      <div class="bg-white rounded-xl shadow-lg p-12 text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
        <p class="text-gray-600 text-lg">Đang tải bài thi...</p>
      </div>
    </div>

    <div v-if="practice" class="container mx-auto px-6 py-6 max-w-7xl">
      <!-- Header -->
      <div class="mb-6">
        <button
          v-if="!showResult"
          @click="handleLeave"
          class="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-3"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại
        </button>
        <NuxtLink
          v-else
          to="/practice" 
          class="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-3"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại
        </NuxtLink>

        <div class="bg-white rounded-xl shadow-lg p-6">
          <div class="flex items-start justify-between gap-4 flex-wrap">
            <div class="flex-1">
              <h1 class="text-2xl font-bold text-gray-900 mb-3">{{ practice.title }}</h1>
              <div class="flex flex-wrap gap-3">
                <span v-if="practice.subject" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {{ practice.subject.name }}
                </span>
                <span v-if="practice.class" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                  {{ practice.class.name }}
                </span>
                <span v-if="practice.level" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ practice.level.title }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content with Sidebar -->
      <div class="flex gap-6 relative">
        
        <!-- Auth Required Overlay -->
        <div v-if="!isAuthenticated" class="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
          <div class="text-center p-8 bg-white rounded-xl shadow-2xl max-w-md">
            <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Yêu cầu đăng nhập</h3>
            <p class="text-gray-600 mb-6">Bạn cần đăng nhập để làm bài thi này</p>
            <button
              @click="isAuthModalOpen = true"
              class="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>

        <!-- Questions - Left Side -->
        <div class="flex-1 space-y-6 min-w-0"
          :class="{ 
            'pointer-events-none select-none': !isAuthenticated,
            'opacity-60': hasSubmittedBefore && !showResult
          }"
        >
          <div 
            v-for="(qa, index) in practice.question_answer" 
            :key="qa.id"
            :id="`question-${index + 1}`"
            class="bg-white rounded-xl shadow-lg p-6"
          >
          <!-- Question Number & Text -->
          <div class="flex gap-4 mb-4">
            <div class="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
              {{ index + 1 }}
            </div>
            <div class="flex-1">
              <div class="markdown-content question-content" v-html="parseQuestion(qa.question)"></div>
              
              <!-- Question Image -->
              <img 
                v-if="qa.image" 
                :src="qa.image" 
                :alt="`Hình ảnh câu ${index + 1}`"
                class="max-w-full h-auto rounded-lg shadow-md mb-4"
              />
            </div>
          </div>

          <!-- Answer Type: Text Input -->
          <div v-if="qa.answer_type === 'text'" class="ml-14">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              {{ qa.answer.title }}
            </label>
            <textarea
              v-model="userAnswers[qa.id]"
              rows="2"
              :disabled="showResult"
              placeholder="Nhập câu trả lời của bạn"
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed resize-y"
            ></textarea>
          </div>

          <!-- Answer Type: Number Input -->
          <div v-if="qa.answer_type === 'number'" class="ml-14">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              {{ qa.answer.title }}
            </label>
            <input
              v-model="userAnswers[qa.id]"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              :disabled="showResult"
              placeholder="Nhập số"
              @input="(e) => {
                const target = e.target as HTMLInputElement
                target.value = target.value.replace(/[^0-9]/g, '')
                userAnswers[qa.id] = target.value
              }"
              class="w-full max-w-md px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <!-- Answer Type: Radio (Multiple Choice) -->
          <div v-if="qa.answer_type === 'radio'" class="ml-14">
            <p class="text-sm font-semibold text-gray-700 mb-3">{{ qa.answer.title }}</p>
            <div class="space-y-3">
              <label 
                v-for="item in qa.answer.items" 
                :key="item.id"
                class="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition hover:bg-teal-50"
                :class="{
                  'border-primary bg-teal-50': userAnswers[qa.id] === item.answer,
                  'border-gray-300': userAnswers[qa.id] !== item.answer,
                  'cursor-not-allowed opacity-60': showResult
                }"
              >
                <input
                  type="radio"
                  :name="`question-${qa.id}`"
                  :value="item.answer"
                  :checked="userAnswers[qa.id] === item.answer"
                  :disabled="showResult"
                  @change="selectAnswer(qa.id, item.answer)"
                  class="w-5 h-5 text-primary focus:ring-2 focus:ring-primary disabled:cursor-not-allowed"
                />
                <span class="text-gray-800 font-medium">{{ item.answer }}</span>
              </label>
            </div>
          </div>

          <!-- Answer Type: Checkbox (Multiple Selection) -->
          <div v-if="qa.answer_type === 'checkbox'" class="ml-14">
            <p class="text-sm font-semibold text-gray-700 mb-3">{{ qa.answer.title }}</p>
            <div class="space-y-3">
              <label 
                v-for="item in qa.answer.items" 
                :key="item.id"
                class="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition hover:bg-purple-50"
                :class="{
                  'border-purple-500 bg-purple-50': isCheckboxSelected(qa.id, item.answer),
                  'border-gray-300': !isCheckboxSelected(qa.id, item.answer),
                  'cursor-not-allowed opacity-60': showResult
                }"
              >
                <input
                  type="checkbox"
                  :name="`question-${qa.id}`"
                  :value="item.answer"
                  :checked="isCheckboxSelected(qa.id, item.answer)"
                  :disabled="showResult"
                  @change="toggleCheckbox(qa.id, item.answer)"
                  class="w-5 h-5 text-purple-600 focus:ring-2 focus:ring-purple-500 disabled:cursor-not-allowed rounded"
                />
                <span class="text-gray-800 font-medium">{{ item.answer }}</span>
              </label>
            </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div v-if="!showResult" class="mt-8 flex justify-center gap-4">
        <button
          @click="handleSubmit"
          :disabled="isSubmitting || answeredCount === 0"
          class="px-8 py-4 bg-gradient-to-r from-primary to-teal-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 inline-flex items-center gap-3"
        >
          <svg v-if="!isSubmitting" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else class="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isSubmitting ? 'Đang nộp bài...' : 'Nộp bài' }}
          </button>
          </div>


        </div>

        <!-- Sidebar - Right Side (Fixed) -->
        <div v-if="!showResult" class="hidden lg:block w-72 flex-shrink-0"
          :class="{ 'pointer-events-none select-none opacity-50': !isAuthenticated }"
        >
          <div class="sticky top-6 space-y-3">
            <!-- Timer Card -->
            <div class="bg-white rounded-xl shadow-lg p-4">
              <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border-2 border-orange-200">
                <div class="text-xs text-gray-600 mb-1 text-center font-semibold">Thời gian còn lại</div>
                <div :class="['text-2xl font-bold text-center', timeColor]">
                  {{ formattedTime }}
                </div>
                <div class="mt-2 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    class="h-full transition-all duration-1000"
                    :class="{
                      'bg-green-500': timePercentage > 50,
                      'bg-orange-500': timePercentage > 25 && timePercentage <= 50,
                      'bg-red-500': timePercentage <= 25
                    }"
                    :style="{ width: `${timePercentage}%` }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Progress Card -->
            <div class="bg-white rounded-xl shadow-lg p-4">
              <h3 class="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Tiến độ
              </h3>
              <div class="text-center mb-3">
                <div class="text-2xl font-bold text-primary">{{ answeredCount }}<span class="text-base text-gray-500">/{{ totalQuestions }}</span></div>
              </div>
              <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-primary to-teal-500 transition-all duration-300"
                  :style="{ width: `${progressPercentage}%` }"
                ></div>
              </div>
              <div class="mt-1 text-xs text-gray-500 text-center">
                {{ Math.round(progressPercentage) }}% hoàn thành
              </div>
            </div>

            <!-- Question List Card -->
            <div class="bg-white rounded-xl shadow-lg p-4">
              <h3 class="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Danh sách câu hỏi
              </h3>
              <div class="max-h-[calc(100vh-28rem)] overflow-y-auto space-y-1.5 pr-1">
                <a
                  v-for="(qa, index) in practice.question_answer"
                  :key="qa.id"
                  :href="`#question-${index + 1}`"
                  class="flex items-center justify-between p-2 rounded-lg border transition-all hover:border-primary hover:bg-teal-50"
                  :class="{
                    'border-green-500 bg-green-50': showResult && isQuestionCorrect(index),
                    'border-red-500 bg-red-50': showResult && isQuestionCorrect(index) === false,
                    'border-green-400 bg-green-50': !showResult && userAnswers[qa.id],
                    'border-gray-200': !showResult && !userAnswers[qa.id]
                  }"
                >
                  <div class="flex items-center gap-2">
                    <div 
                      class="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs"
                      :class="{
                        'bg-green-600 text-white': showResult && isQuestionCorrect(index),
                        'bg-red-600 text-white': showResult && isQuestionCorrect(index) === false,
                        'bg-green-500 text-white': !showResult && userAnswers[qa.id],
                        'bg-gray-200 text-gray-600': !showResult && !userAnswers[qa.id]
                      }"
                    >
                      {{ index + 1 }}
                    </div>
                    <span class="text-xs font-medium text-gray-700">Câu {{ index + 1 }}</span>
                  </div>
                  <div v-if="showResult && isQuestionCorrect(index) !== null">
                    <svg v-if="isQuestionCorrect(index)" class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <svg v-else class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div v-else-if="!showResult && userAnswers[qa.id]">
                    <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div v-else>
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="container mx-auto px-6 py-10 max-w-content">
      <div class="text-center">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-500 font-medium">Đang tải bài thi...</p>
      </div>
    </div>

    <!-- Confirm Submit Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div 
          v-if="showConfirmModal"
          class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          @click.self="cancelSubmit"
        >
          <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <!-- Header -->
            <div class="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4">
              <div class="flex items-center gap-3">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 class="text-xl font-bold">Xác nhận nộp bài</h2>
              </div>
            </div>

            <!-- Body -->
            <div class="p-6">
              <div class="mb-6">
                <p class="text-gray-700 text-lg mb-4">Bạn có chắc chắn muốn nộp bài?</p>
                <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div class="text-sm text-blue-800">
                      <p class="font-semibold mb-1">Thông tin bài làm:</p>
                      <ul class="space-y-1">
                        <li>• Số câu đã trả lời: <span class="font-bold">{{ answeredCount }}/{{ totalQuestions }}</span></li>
                        <li>• Số câu chưa làm: <span class="font-bold">{{ totalQuestions - answeredCount }}</span></li>
                        <li v-if="!showResult">• Thời gian còn lại: <span class="font-bold">{{ formattedTime }}</span></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Buttons -->
              <div class="flex gap-3">
                <button
                  @click="cancelSubmit"
                  class="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  @click="confirmSubmit"
                  class="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-all"
                >
                  Nộp bài
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Leave Confirmation Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div 
          v-if="showLeaveModal"
          class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          @click.self="cancelLeave"
        >
          <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <!-- Header -->
            <div class="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4">
              <div class="flex items-center gap-3">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 class="text-xl font-bold">Cảnh báo rời trang</h2>
              </div>
            </div>

            <!-- Body -->
            <div class="p-6">
              <div class="mb-6">
                <p class="text-gray-700 text-lg mb-4">Bạn có chắc chắn muốn rời khỏi bài thi?</p>
                <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div class="text-sm text-yellow-800">
                      <p class="font-semibold mb-2">Lưu ý quan trọng:</p>
                      <ul class="space-y-1">
                        <li>• Tiến độ của bạn đã được lưu tự động</li>
                        <li>• Bạn có thể quay lại tiếp tục làm bài</li>
                        <li>• Thời gian thi vẫn tiếp tục đếm ngược</li>
                        <li>• Hãy nộp bài trước khi rời để hoàn thành</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Buttons -->
              <div class="flex gap-3">
                <button
                  @click="cancelLeave"
                  class="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-all"
                >
                  Ở lại
                </button>
                <button
                  @click="confirmLeave"
                  class="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Rời khỏi
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Timeout Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div 
          v-if="showTimeoutModal"
          class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <!-- Header -->
            <div class="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4">
              <div class="flex items-center gap-3">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 class="text-xl font-bold">Hết thời gian làm bài</h2>
              </div>
            </div>

            <!-- Body -->
            <div class="p-6">
              <div class="mb-6">
                <p class="text-gray-700 text-lg mb-4 font-semibold">Đã hết thời gian làm bài!</p>
                <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div class="text-sm text-red-800">
                      <p class="font-semibold mb-1">Thông tin:</p>
                      <ul class="space-y-1">
                        <li>• Số câu đã trả lời: <span class="font-bold">{{ answeredCount }}/{{ totalQuestions }}</span></li>
                        <li>• Bạn có thể làm lại bài thi này</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Buttons -->
              <div class="flex gap-3">
                <button
                  @click="handleTimeoutRetry"
                  class="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-all"
                >
                  Làm lại
                </button>
                <button
                  @click="handleTimeoutExit"
                  class="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Thoát
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Success Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div 
          v-if="showSuccessModal"
          class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          @click.self="handleSuccessExit"
        >
          <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <!-- Header -->
            <div class="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4">
              <div class="flex items-center gap-3">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 class="text-xl font-bold">Hoàn thành bài thi</h2>
              </div>
            </div>

            <!-- Body with detailed results -->
            <div class="p-4">
              <!-- Score Display -->
              <div class="mb-4 text-center">
                <div class="flex items-baseline justify-center gap-2 mb-2">
                  <span class="text-5xl font-bold text-gray-900">{{ displayTotalScore }}</span>
                  <span class="text-2xl font-semibold text-gray-600">/{{ displayMaxScore }}</span>
                  <span class="text-xl font-medium text-gray-600">điểm</span>
                </div>
                <div class="text-sm text-gray-600">
                  {{ displayCorrectCount }}/{{ displayTotalQuestions }} câu đúng
                </div>
              </div>
              
              <!-- Summary Stats -->
              <div class="grid grid-cols-2 gap-3 mb-4">
                <div class="bg-green-50 border-2 border-green-200 rounded-lg p-3 text-center">
                  <div class="text-2xl font-bold text-green-600 mb-1">
                    {{ displayCorrectCount }}
                  </div>
                  <div class="text-xs text-green-800 font-semibold">Câu đúng</div>
                </div>
                <div class="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-center">
                  <div class="text-2xl font-bold text-red-600 mb-1">
                    {{ displayTotalQuestions - displayCorrectCount }}
                  </div>
                  <div class="text-xs text-red-800 font-semibold">Câu sai</div>
                </div>
              </div>

              <!-- Details Section -->
              <div v-if="gradingResult?.details" class="mb-4">
                <h3 class="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Chi tiết từng câu
                </h3>
                <div class="space-y-2 max-h-48 overflow-y-auto pr-2">
                  <div 
                    v-for="(detail, index) in gradingResult.details" 
                    :key="index"
                    class="flex items-center justify-between p-2 rounded-lg border-2"
                    :class="detail.is_correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'"
                  >
                    <div class="flex items-center gap-2 flex-1">
                      <div 
                        class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs"
                        :class="detail.is_correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'"
                      >
                        {{ Number(index) + 1 }}
                      </div>
                      <div class="flex-1">
                        <div class="text-xs font-medium text-gray-700">
                          Câu {{ Number(index) + 1 }}
                        </div>
                        <div class="text-xs text-gray-600">
                          <span class="font-semibold">{{ detail.solution }}</span>
                          <span v-if="!detail.is_correct" class="ml-1 text-green-600">
                            (Đáp án: {{ detail.correct_answer }})
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center gap-1">
                      <span class="text-base font-bold" :class="detail.is_correct ? 'text-green-600' : 'text-red-600'">
                        {{ detail.score }}/{{ detail.max_score }}
                      </span>
                      <svg v-if="detail.is_correct" class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <svg v-else class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Message -->
              <div class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded mb-4">
                <p class="text-blue-800 text-sm font-semibold">
                  {{ gradingResult?.message || 'Cảm ơn bạn đã hoàn thành bài thi!' }}
                </p>
              </div>

              <!-- Button -->
              <button
                @click="handleSuccessExit"
                class="w-full px-4 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-all inline-flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Quay lại danh sách
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Auth Modal -->
    <AuthModal 
      :isOpen="isAuthModalOpen"
      @close="handleAuthClose"
      @success="handleAuthSuccess"
    />
  </main>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9);
}

/* Custom scrollbar for sidebar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Markdown Content Styling for Questions */
.question-content :deep(p) {
  @apply text-lg font-semibold text-gray-900 mb-3;
}

.markdown-content {
  @apply text-gray-800 leading-relaxed;
  font-size: 16px;
  line-height: 1.7;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4) {
  @apply font-bold text-gray-900 mt-4 mb-2;
}

.markdown-content :deep(h1) {
  @apply text-2xl;
}

.markdown-content :deep(h2) {
  @apply text-xl;
}

.markdown-content :deep(h3) {
  @apply text-lg;
}

.markdown-content :deep(h4) {
  @apply text-base;
}

.markdown-content :deep(p) {
  @apply mb-3 text-base leading-7;
}

.markdown-content :deep(strong) {
  @apply font-bold text-gray-900;
}

.markdown-content :deep(em) {
  @apply italic;
}

.markdown-content :deep(a) {
  @apply text-primary hover:text-teal-600 underline font-medium transition-colors;
}

.markdown-content :deep(ul) {
  @apply list-disc list-inside mb-3 space-y-1 ml-4;
}

.markdown-content :deep(ol) {
  @apply list-decimal list-inside mb-3 space-y-1 ml-4;
}

.markdown-content :deep(li) {
  @apply text-base leading-6;
}

.markdown-content :deep(li > ul),
.markdown-content :deep(li > ol) {
  @apply mt-1 ml-6;
}

.markdown-content :deep(blockquote) {
  @apply border-l-4 border-primary bg-teal-50 pl-4 pr-4 py-2 mb-3 italic text-gray-700;
}

.markdown-content :deep(code) {
  @apply bg-gray-100 text-pink-600 px-2 py-1 rounded text-sm font-mono;
}

.markdown-content :deep(pre) {
  @apply bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto mb-3;
}

.markdown-content :deep(pre code) {
  @apply bg-transparent text-gray-100 p-0;
}

.markdown-content :deep(img) {
  @apply max-w-full h-auto rounded-lg shadow-md my-4 mx-auto;
}

.markdown-content :deep(table) {
  @apply w-full border-collapse mb-3 shadow-sm rounded-lg overflow-hidden;
}

.markdown-content :deep(thead) {
  @apply bg-primary text-white;
}

.markdown-content :deep(th) {
  @apply p-2 text-left font-semibold text-sm;
}

.markdown-content :deep(td) {
  @apply p-2 border-b border-gray-200 text-sm;
}

.markdown-content :deep(tbody tr:hover) {
  @apply bg-gray-50;
}

.markdown-content :deep(hr) {
  @apply my-4 border-t-2 border-gray-200;
}

.markdown-content :deep(iframe) {
  @apply w-full rounded-lg shadow-md my-4;
}

.markdown-content :deep(.video-container) {
  @apply relative w-full my-4;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
}

.markdown-content :deep(.video-container iframe) {
  @apply absolute top-0 left-0 w-full h-full rounded-lg shadow-lg;
}
</style>
