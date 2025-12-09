import axios from 'axios'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  const baseUrl = apiBase.replace('/api', '')
  
  const query = getQuery(event)
  
  try {
    // Build Strapi filters
    const params: any = {
      'populate': '*',
      'pagination[page]': query.page || 1,
      'pagination[pageSize]': query.pageSize || 25,
      'sort[0]': 'createdAt:desc'
    }
    
    // Filter by class
    if (query.classId) {
      params['filters[class][documentId][$eq]'] = query.classId
    }
    
    // Filter by subject
    if (query.subjectId) {
      params['filters[subject][documentId][$eq]'] = query.subjectId
    }
    
    // Filter by level
    if (query.levelId) {
      params['filters[level][documentId][$eq]'] = query.levelId
    }
    
    // Filter by type
    if (query.type) {
      params['filters[type][$eq]'] = query.type
    }
    
    const response = await axios.get(`${apiBase}/study-materials`, { params })
    
    const materials = response.data.data.map((material: any) => ({
      id: material.id,
      documentId: material.documentId,
      title: material.title,
      documentLink: material.document_link,
      type: material.type,
      class: material.class ? {
        id: material.class.id,
        documentId: material.class.documentId,
        name: material.class.name,
        isHighlight: material.class.is_highlight
      } : null,
      subject: material.subject ? {
        id: material.subject.id,
        documentId: material.subject.documentId,
        name: material.subject.name,
        isDisplay: material.subject.isDisplay
      } : null,
      level: material.level ? {
        id: material.level.id,
        documentId: material.level.documentId,
        title: material.level.title,
        description: material.level.description
      } : null
    }))
    
    return {
      status: 'ok',
      data: materials,
      meta: response.data.meta
    }
  } catch (error) {
    console.error('Error fetching study materials:', error)
    return {
      status: 'error',
      data: [],
      meta: null,
      message: 'Failed to fetch study materials from API'
    }
  }
})
