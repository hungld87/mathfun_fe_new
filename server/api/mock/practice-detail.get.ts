import axios from 'axios'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  const baseUrl = apiBase.replace('/api', '')
  
  try {
    const query = getQuery(event)
    const slug = query.slug
    
    if (!slug) {
      return {
        status: 'error',
        data: null,
        message: 'slug is required'
      }
    }

    // Get JWT token from request headers
    const authHeader = getHeader(event, 'authorization')
    const headers: any = {}
    
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    const response = await axios.get(`${apiBase}/practices/detail`, {
      params: { slug },
      headers
    })
    
    const practice = response.data.data
    
    // Transform Strapi data to frontend format
    const transformedData = {
      id: practice.id,
      documentId: practice.documentId,
      slug: practice.slug,
      title: practice.title,
      duration_time: practice.duration_time,
      thumb: practice.thumb?.url || null,
      class: practice.class ? {
        id: practice.class.id,
        documentId: practice.class.documentId,
        name: practice.class.name,
        is_highlight: practice.class.is_highlight || false
      } : null,
      level: practice.level ? {
        id: practice.level.id,
        documentId: practice.level.documentId,
        title: practice.level.title,
        description: practice.level.description
      } : null,
      subject: practice.subject ? {
        id: practice.subject.id,
        documentId: practice.subject.documentId,
        name: practice.subject.name,
        isDisplay: practice.subject.isDisplay,
        icon: practice.subject.icon?.url ? `${baseUrl}${practice.subject.icon.url}` : null
      } : null,
      question_answer: practice.question_answer?.map((qa: any) => ({
        id: qa.id,
        answer_type: qa.answer_type,
        question: qa.question,
        image: qa.image?.url ? `${baseUrl}${qa.image.url}` : null,
        answer: {
          id: qa.answer?.id,
          title: qa.answer?.title || '',
          items: qa.answer?.items?.map((item: any) => ({
            id: item.id,
            answer: item.answer
          })) || []
        }
      })) || [],
      createdAt: practice.createdAt,
      updatedAt: practice.updatedAt,
      publishedAt: practice.publishedAt
    }
    
    return {
      status: 'ok',
      data: transformedData
    }
  } catch (error: any) {
    console.error('Error fetching practice detail:', error)
    
    // If 403 Forbidden, throw error with 403 status
    if (error.response?.status === 403) {
      throw createError({
        statusCode: 403,
        message: 'Authentication required'
      })
    }
    
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch practice detail from API'
    })
  }
})
