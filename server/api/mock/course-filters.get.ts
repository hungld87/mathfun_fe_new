import axios from 'axios'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  const baseUrl = apiBase.replace('/api', '')
  
  try {
    const response = await axios.get(`${apiBase}/course-fillters/full`)
    
    const rawData = response.data.data[0]
    
    // Transform classes data
    const classes = rawData.classes.map((cls: any) => ({
      id: cls.id,
      documentId: cls.documentId,
      name: cls.name,
      is_highlight: cls.is_highlight,
      icon: cls.icon ? `${baseUrl}${cls.icon.url}` : null
    }))
    
    // Transform levels data
    const levels = rawData.levels.map((level: any) => ({
      id: level.id,
      documentId: level.documentId,
      title: level.title,
      description: level.description
    }))
    
    // Transform subjects data
    const subjects = rawData.subjects
      ?.filter((subject: any) => subject.isDisplay !== false)
      .map((subject: any) => ({
        id: subject.id,
        documentId: subject.documentId,
        name: subject.name,
        isDisplay: subject.isDisplay,
        icon: subject.icon ? `${baseUrl}${subject.icon.url}` : null
      })) || []
    
    return {
      status: 'ok',
      data: {
        classes,
        levels,
        subjects
      }
    }
  } catch (error) {
    console.error('Error fetching course filters:', error)
    return {
      status: 'error',
      message: 'Failed to fetch course filters',
      data: {
        classes: [],
        levels: []
      }
    }
  }
})
