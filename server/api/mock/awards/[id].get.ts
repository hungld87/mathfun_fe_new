export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  try {
    const response = await $fetch(`${apiBase}/awards/${id}`, {
      params: {
        populate: '*'
      }
    })

    // Transform Strapi response format to frontend format
    const award = response?.data
    
    if (!award) {
      throw createError({
        statusCode: 404,
        message: 'Award not found'
      })
    }

    return {
      data: {
        id: award.id,
        documentId: award.documentId,
        slug: award.slug || id,
        title: award.title || '',
        description: award.description || '',
        content: award.content || '',
        publishedAt: award.publishedAt || new Date().toISOString()
      }
    }
  } catch (error: any) {
    console.error('Error fetching award detail:', error)
    
    // Return mock data as fallback
    return {
      data: {
        id: 1,
        documentId: id,
        slug: id,
        title: 'Bảng vàng thành tích 2024',
        description: 'Thành tích xuất sắc của các học sinh trong kỳ thi Violympic toán quốc tế',
        content: `# Bảng Vàng Thành Tích Violympic 2024

## Giải Nhất - Lớp 5

Chúc mừng các em học sinh đã đạt được thành tích xuất sắc trong kỳ thi Violympic toán quốc tế năm 2024!

### Danh sách học sinh đạt giải

1. **Nguyễn Văn A** - Lớp 5A - Điểm: 98/100 🥇
2. **Trần Thị B** - Lớp 5B - Điểm: 95/100 🥈
3. **Lê Văn C** - Lớp 5C - Điểm: 93/100 🥉

## Hình ảnh trao giải

![Trao giải Violympic](http://localhost:1337/uploads/282563937_5182710281823233_1318746299275384183_n_adb6ff93c1.jpg)

*Lễ trao giải cho các em học sinh xuất sắc*

## Nhận xét của Ban Giám Khảo

> "Các em học sinh đã thể hiện năng lực toán học vượt trội, tư duy logic sắc bén và khả năng giải quyết vấn đề xuất sắc. Đây là những tài năng trẻ đầy triển vọng của đất nước."

## Lời cảm ơn

Chúng tôi xin chân thành cảm ơn:

- ✨ **Các em học sinh** đã nỗ lực học tập và rèn luyện không ngừng
- 👨‍👩‍👧‍👦 **Phụ huynh** đã luôn đồng hành, động viên và hỗ trợ các em
- 👨‍🏫 **Đội ngũ giáo viên** đã tận tâm giảng dạy và truyền đạt kiến thức
- 🏫 **Nhà trường** đã tạo điều kiện tốt nhất cho các em phát triển

## Kế hoạch tiếp theo

Chúng tôi sẽ tiếp tục:
- Tổ chức các buổi bồi dưỡng chuyên sâu
- Tạo điều kiện cho các em tham gia các kỳ thi quốc tế
- Phát triển tài năng toán học của thế hệ trẻ

**Chúc mừng các em! Tiếp tục phát huy và đạt được nhiều thành tích cao hơn nữa!** 🎉🏆✨`,
        publishedAt: '2024-12-10T00:00:00.000Z'
      }
    }
  }
})
