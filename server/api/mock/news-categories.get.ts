import axios from 'axios'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  const baseUrl = apiBase.replace('/api', '')
  
  try {
    const response = await axios.get(`${apiBase}/news-categories?populate=*`)
    
    // Transform Strapi data to match frontend format
    const strapiData = response.data.data || []
    const transformedData = strapiData.map((item: any) => ({
      id: item.id,
      documentId: item.documentId,
      name: item.name,
      slug: item.slug,
      icon: item.icon ? {
        url: `${baseUrl}${item.icon.url}`,
        hash: item.icon.hash,
        ext: item.icon.ext,
        width: item.icon.width,
        height: item.icon.height
      } : null
    }))
    
    return {
      status: 'ok',
      data: transformedData
    }
  } catch (error) {
    console.error('Error fetching news categories:', error)
    return {
      status: 'error',
      data: [],
      message: 'Failed to fetch news categories from API'
    }
  }
})
