export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  
  console.log('=== PRACTICE SCORING SUBMIT API CALLED ===')
  console.log('Body:', JSON.stringify(body, null, 2))
  console.log('API Base:', config.public.apiBase)
  console.log('Use Mock:', config.public.useMock)
  
  // Get JWT token from headers
  const authHeader = getHeader(event, 'authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (token) {
    console.log('Token found:', token.substring(0, 20) + '...')
  } else {
    console.log('No token in request')
  }
  
  // If using mock mode
  if (config.public.useMock) {
    // Mock response for practice scoring submission
    return {
      success: true,
      data: {
        id: Math.random().toString(36).substring(7),
        practiceDocumentId: body.practiceDocumentId,
        durationtime: body.durationtime,
        totalQuestions: body.scores?.length || 0,
        correctAnswers: Math.floor((body.scores?.length || 0) * 0.7), // Mock 70% correct
        totalScore: Math.floor((body.scores?.length || 0) * 7), // Mock 70 points if 10 questions
        submittedAt: new Date().toISOString(),
        scores: body.scores
      },
      message: 'Nộp bài thành công!'
    }
  }
  
  // If using real API, forward to Strapi
  console.log('Forwarding to real Strapi API...')
  
  try {
    const headers: any = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const apiUrl = `${config.public.apiBase}/practice-scorings/submit`
    console.log('Calling Strapi:', apiUrl)
    
    const response = await $fetch(apiUrl, {
      method: 'POST',
      headers,
      body
    })
    
    console.log('Strapi response:', response)
    return response
  } catch (error: any) {
    console.error('=== ERROR SUBMITTING TO STRAPI ===')
    console.error('Error:', error)
    console.error('Status:', error.response?.status)
    console.error('Message:', error.message)
    
    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: error.message || 'Failed to submit practice scoring'
    })
  }
})
