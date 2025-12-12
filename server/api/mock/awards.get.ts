export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  try {
    const response = await $fetch(`${apiBase}/awards`)
    
    // Transform Strapi response format to frontend format
    const strapiData = response?.data || []
    
    const transformedData = strapiData.map((item: any) => ({
      id: item.id,
      documentId: item.documentId,
      slug: item.slug,
      title: item.title || '',
      description: item.description || '',
      content: item.content || '',
      publishedAt: item.publishedAt || item.createdAt
    }))

    return transformedData
  } catch (error: any) {
    console.error('Error fetching awards:', error)
    
    // Return mock data as fallback
    return [
      {
        id: 1,
        documentId: 'mock-1',
        slug: 'bang-vang-1',
        title: 'Bảng vàng thành tích 2024',
        description: 'Thành tích xuất sắc của các học sinh trong kỳ thi Violympic',
        content: `# Bảng Vàng Thành Tích Violympic 2024

## Giải Nhất - Lớp 5

Chúc mừng các em học sinh đã đạt được thành tích xuất sắc trong kỳ thi Violympic toán quốc tế năm 2024!

### Danh sách học sinh đạt giải

1. **Nguyễn Văn A** - Lớp 5A - Điểm: 98/100 🥇
2. **Trần Thị B** - Lớp 5B - Điểm: 95/100 🥈
3. **Lê Văn C** - Lớp 5C - Điểm: 93/100 🥉

![Trao giải Violympic](http://localhost:1337/uploads/282563937_5182710281823233_1318746299275384183_n_adb6ff93c1.jpg)`,
        publishedAt: '2024-12-10T00:00:00.000Z'
      }
    ]
  }
})
