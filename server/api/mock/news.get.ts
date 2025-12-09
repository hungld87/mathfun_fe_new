import axios from 'axios'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  const baseUrl = apiBase.replace('/api', '')
  
  try {
    const response = await axios.get(`${apiBase}/news-details?populate=*`)
    
    // Transform Strapi data to match frontend format
    const strapiData = response.data.data || []
    const transformedData = strapiData.map((item: any) => {
      // Get image URLs from Strapi
      const thumbUrl = item.thumb?.url 
        ? `${baseUrl}${item.thumb.url}` 
        : 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=400&fit=crop'
      
      const coverUrl = item.cover?.url 
        ? `${baseUrl}${item.cover.url}` 
        : 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200&h=400&fit=crop'
      
      // Get tags names
      const tagNames = item.tags?.map((tag: any) => tag.name) || []
      
      // Get category slug
      const categorySlug = item.news_category?.slug || null
      
      return {
        id: item.id,
        title: item.title,
        slug: item.slug,
        description: item.description || '',
        content: item.content || '',
        thumb: thumbUrl,
        cover: coverUrl,
        author: item.author || 'MathFun',
        datetime: item.datetime || item.publishedAt || item.createdAt,
        tags: tagNames,
        categorySlug: categorySlug
      }
    })
    
    return {
      status: 'ok',
      data: transformedData
    }
  } catch (error) {
    console.error('Error fetching news:', error)
    return {
      status: 'error',
      data: [],
      message: 'Failed to fetch news from API'
    }
  }
})
