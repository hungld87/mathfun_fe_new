import axios from 'axios'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  
  try {
    const response = await axios.get(`${apiBase}/levels`)
    
    const levels = response.data.data
    
    // Transform Strapi data to frontend format
    const transformedData = levels?.map((level: any) => ({
      id: level.id,
      documentId: level.documentId,
      title: level.title,
      description: level.description
    })) || []
    
    return {
      status: 'ok',
      data: transformedData
    }
  } catch (error) {
    console.error('Error fetching levels data:', error)
    return {
      status: 'error',
      data: [],
      message: 'Failed to fetch levels data from API'
    }
  }
})
