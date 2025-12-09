import axios from 'axios'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  
  try {
    const response = await axios.get(`${apiBase}/classes`)
    
    const classes = response.data.data
    
    // Transform Strapi data to frontend format
    const transformedData = classes?.map((cls: any) => ({
      id: cls.id,
      documentId: cls.documentId,
      name: cls.name,
      is_highlight: cls.is_highlight || false
    })) || []
    
    return {
      status: 'ok',
      data: transformedData
    }
  } catch (error) {
    console.error('Error fetching classes data:', error)
    return {
      status: 'error',
      data: [],
      message: 'Failed to fetch classes data from API'
    }
  }
})
