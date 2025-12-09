import axios from 'axios'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  
  try {
    const response = await axios.get(`${apiBase}/practices/full`)
    
    const practices = response.data.data
    
    // Transform Strapi data to frontend format
    const transformedData = practices?.map((practice: any) => ({
      id: practice.id,
      documentId: practice.documentId,
      slug: practice.slug,
      title: practice.title,
      duration_time: practice.duration_time,
      // API /full trả về URL đầy đủ
      thumb: practice.thumb?.url || null,
      // Class, Level, Subject info
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
        icon: practice.subject.icon?.url ? `${apiBase.replace('/api', '')}${practice.subject.icon.url}` : null
      } : null,
      createdAt: practice.createdAt,
      updatedAt: practice.updatedAt,
      publishedAt: practice.publishedAt
    })) || []
    
    return {
      status: 'ok',
      data: transformedData
    }
  } catch (error) {
    console.error('Error fetching practices data:', error)
    return {
      status: 'error',
      data: [],
      message: 'Failed to fetch practices data from API'
    }
  }
})
