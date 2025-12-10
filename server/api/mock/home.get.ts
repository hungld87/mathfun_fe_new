import axios from 'axios'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  const baseUrl = apiBase.replace('/api', '')
  
  try {
    const response = await axios.get(`${apiBase}/home/full`)
    
    const data = response.data.data
    
    // Transform Strapi data to frontend format
    const transformedData = {
      hero: {
        slides: data.hero_slides?.map((slide: any) => ({
          id: slide.id,
          title: slide.title,
          description: slide.subtitle || slide.description,
          image: slide.background_image?.url ? `${baseUrl}${slide.background_image.url}` : null,
          imageAlt: slide.image_alt || slide.title,
          link_internal: slide.link_internal || '/',
          link_external: slide.link_external || null
        })) || []
      },
      teachers: {
        title: data.title_block_teacher || 'Giáo viên',
        icon: data.block_teacher_icon?.url || null, // Already has full URL from Strapi
        items: data.teachers?.map((teacher: any) => ({
          id: teacher.id,
          documentId: teacher.documentId,
          name: teacher.name,
          description: teacher.description,
          image: teacher.image?.url ? `${baseUrl}${teacher.image.url}` : null
        })) || []
      },
      weeklyRanking: {
        title: data.title_weekly_ranking || 'Top trong tuần',
        icon: data.weekly_ranking_icon?.url || null, // Already has full URL from Strapi
        weekStart: data.weekly_ranking?.weekStart,
        items: data.weekly_ranking?.items?.map((item: any) => ({
          id: item.id,
          name: item.name,
          totalScore: item.totalScore,
          student: {
            id: item.student?.id,
            documentId: item.student?.documentId,
            name: item.student?.name,
            avatar: item.student?.avatar?.url ? `${baseUrl}${item.student.avatar.url}` : null,
            class: item.student?.class
          }
        })) || []
      },
      newsHot: {
        title: data.title_news_hot || 'Tin tức nổi bật',
        icon: data.news_hot_icon?.url || null, // Already has full URL from Strapi
        items: data.news_details?.map((news: any) => ({
          id: news.id,
          documentId: news.documentId,
          title: news.title,
          slug: news.slug,
          description: news.description,
          content: news.content,
          datetime: news.datetime,
          thumb: news.thumb?.url ? `${baseUrl}${news.thumb.url}` : null,
          cover: news.cover?.url ? `${baseUrl}${news.cover.url}` : null
        })) || []
      },
      coursesHot: {
        title: data.title_courses_hot || 'Khoá học tiêu biểu',
        icon: data.courses_hot_icon?.url || null, // Already has full URL from Strapi
        items: data.courses?.map((course: any) => ({
          id: course.id,
          documentId: course.documentId,
          title: course.title,
          slug: course.slug,
          description: course.description,
          content: course.content,
          isHot: course.isHot,
          image: course.image?.url ? `${baseUrl}${course.image.url}` : null,
          coverImage: course.cover_image?.url ? `${baseUrl}${course.cover_image.url}` : null,
          class: course.class ? {
            id: course.class.id,
            documentId: course.class.documentId,
            name: course.class.name,
            isHighlight: course.class.is_highlight
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
            isDisplay: course.subject.isDisplay,
            icon: course.subject.icon?.url ? `${baseUrl}${course.subject.icon.url}` : null
          } : null
        })) || []
      }
    }
    
    return {
      status: 'ok',
      data: transformedData
    }
  } catch (error) {
    console.error('Error fetching home data:', error)
    return {
      status: 'error',
      data: null,
      message: 'Failed to fetch home data from API'
    }
  }
})
