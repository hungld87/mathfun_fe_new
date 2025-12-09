import axios from 'axios'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  
  try {
    const response = await axios.get(`${apiBase}/subjects`)
    
    const subjects = response.data.data
    
    // Transform Strapi data to frontend format
    const transformedData = subjects
      ?.filter((subject: any) => subject.isDisplay !== false)
      .map((subject: any) => ({
        id: subject.id,
        documentId: subject.documentId,
        name: subject.name,
        isDisplay: subject.isDisplay
      })) || []
    
    return {
      status: 'ok',
      data: transformedData
    }
  } catch (error) {
    console.error('Error fetching subjects data:', error)
    return {
      status: 'error',
      data: [],
      message: 'Failed to fetch subjects data from API'
    }
  }
})
