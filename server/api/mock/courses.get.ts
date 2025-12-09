import axios from 'axios'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  
  try {
    const response = await axios.get(`${apiBase}/courses/full`)
    
    const courses = response.data.data
    
    // Transform Strapi data to frontend format
    const transformedData = courses?.map((course: any) => ({
      id: course.id,
      documentId: course.documentId,
      title: course.title,
      slug: course.slug,
      description: course.description,
      content: course.content || null,
      isHot: course.isHot || false,
      // API /full trả về URL đầy đủ, không cần prefix
      image: course.image?.url || null,
      coverImage: course.cover_image?.url || null,
      // Thêm class, level và subject info
      class: course.class ? {
        id: course.class.id,
        documentId: course.class.documentId,
        name: course.class.name,
        is_highlight: course.class.is_highlight || false
      } : null,
      level: course.level ? {
        id: course.level.id,
        documentId: course.level.documentId,
        title: course.level.title,
        description: course.level.description
      } : null,
      subject: course.subject ? {
        id: course.subject.id,
        documentId: course.subject.documentId,
        name: course.subject.name,
        isDisplay: course.subject.isDisplay
      } : null,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      publishedAt: course.publishedAt
    })) || []
    
    return {
      status: 'ok',
      data: transformedData
    }
  } catch (error) {
    console.error('Error fetching courses data:', error)
    return {
      status: 'error',
      data: [],
      message: 'Failed to fetch courses data from API'
    }
  }
})
