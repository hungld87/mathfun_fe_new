export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  try {
    const response = await $fetch(`${config.public.apiBase}/teachers?populate=*`)
    
    return {
      data: response.data.map((teacher: any) => ({
        id: teacher.id,
        documentId: teacher.documentId,
        name: teacher.name,
        description: teacher.description,
        avatar: teacher.image?.url ? `http://171.244.140.108:1337${teacher.image.url}` : null,
        image: teacher.image?.url ? `http://171.244.140.108:1337${teacher.image.url}` : null,
        createdAt: teacher.createdAt,
        updatedAt: teacher.updatedAt
      }))
    }
  } catch (error) {
    console.error('Error fetching teachers from Strapi:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch teachers'
    })
  }
})
