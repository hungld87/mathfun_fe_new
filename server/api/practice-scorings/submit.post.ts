export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  
  // Get JWT token from headers
  const authHeader = getHeader(event, 'authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  // If using mock mode
  if (config.public.useMock) {
    // Mock response for practice scoring submission
    return {
      success: true,
      data: {
        id: Math.random().toString(36).substring(7),
        practiceDocumentId: body.practiceDocumentId,
        timeSpent: body.timeSpent,
        totalQuestions: body.answers?.length || 0,
        correctAnswers: Math.floor((body.answers?.length || 0) * 0.7), // Mock 70% correct
        score: Math.floor(((body.answers?.length || 0) * 0.7) / (body.answers?.length || 1) * 100),
        submittedAt: new Date().toISOString(),
        answers: body.answers
      },
      message: 'Nộp bài thành công!'
    }
  }
  
  // If using real API, forward to Strapi
  try {
    const headers: any = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await $fetch(`${config.public.apiBase}/practice-scorings/submit`, {
      method: 'POST',
      headers,
      body
    })
    
    return response
  } catch (error: any) {
    console.error('Error submitting to Strapi:', error)
    
    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: error.message || 'Failed to submit practice scoring'
    })
  }
})
