# Trang Danh Sách Giáo Viên (/teachers)

## Tổng Quan
Trang hiển thị danh sách đầy đủ các giáo viên của MathFun với UI card đẹp mắt, sử dụng dữ liệu thật từ Strapi API.

## API Backend

### Endpoint
```
GET http://171.244.140.108:1337/api/teachers?populate=*
```

### Response Structure
```json
{
  "data": [
    {
      "id": 2,
      "documentId": "pgo9ka0jwk4tyytb9ulgja5m",
      "name": "Thầy chủ nhiệm Lê Hoà Hải",
      "description": "Với mong muốn lan tỏa niềm đam mê toán học...",
      "image": {
        "url": "/uploads/le_hoa_hai_ea00d34480.jpg",
        "formats": {...}
      }
    }
  ],
  "meta": {
    "pagination": {...}
  }
}
```

## Files Created/Modified

### 1. Server API Endpoint
**File:** `server/api/proxy/teachers.get.ts`

**Purpose:** Proxy API để fetch dữ liệu từ Strapi và transform data

**Code:**
```typescript
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
```

**Features:**
- ✅ Kết nối với Strapi backend
- ✅ Transform data để thêm full URL cho images
- ✅ Error handling
- ✅ TypeScript support

---

### 2. Teachers Page
**File:** `pages/teachers/index.vue`

**Route:** `/teachers`

**Features:**
- ✅ Page header với title và description
- ✅ Grid layout responsive (1 col mobile, 2 cols tablet, 3 cols desktop)
- ✅ Sử dụng component `TeacherCard` có sẵn
- ✅ Empty state khi không có giáo viên
- ✅ Back button về trang chủ
- ✅ SEO meta tags

**Code Structure:**
```vue
<script setup>
// Fetch teachers data from API
const { data: teachersResponse } = await useAsyncData(
  'teachers-list', 
  () => $fetch('/api/proxy/teachers')
)
const teachers = computed(() => teachersResponse.value?.data || [])
</script>

<template>
  <main>
    <!-- Page Header -->
    <h1>Đội Ngũ Giáo Viên Tài Năng</h1>
    
    <!-- Teachers Grid -->
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <TeacherCard v-for="teacher in teachers" :key="teacher.id" :teacher="teacher" />
    </div>
    
    <!-- Empty State -->
    <!-- Back Button -->
  </main>
</template>
```

---

### 3. Environment Configuration
**File:** `.env`

**Updated:**
```properties
# Production Strapi API
NUXT_PUBLIC_API_BASE=http://171.244.140.108:1337/api
```

**Note:** API base đã được chuyển sang server thật thay vì localhost.

---

## UI Design

### Layout
```
┌─────────────────────────────────────────┐
│  Đội Ngũ Giáo Viên Tài Năng             │
│  Description text...                     │
├─────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │ Card │  │ Card │  │ Card │  ← 3 cols│
│  └──────┘  └──────┘  └──────┘          │
│  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │ Card │  │ Card │  │ Card │          │
│  └──────┘  └──────┘  └──────┘          │
├─────────────────────────────────────────┤
│        [← Quay lại trang chủ]           │
└─────────────────────────────────────────┘
```

### Teacher Card (reused component)
**Component:** `components/TeacherCard.vue`

**Style:**
- White background card với shadow
- Rounded corners
- Avatar tròn (24x24) ở giữa
- Tên giáo viên (font-semibold)
- Mô tả ngắn (text-muted)
- Text centered

**Example:**
```
┌───────────────────────┐
│                       │
│      ┌───────┐        │
│      │ Photo │        │
│      └───────┘        │
│                       │
│   Thầy Lê Hoà Hải    │
│                       │
│  Với mong muốn lan    │
│  tỏa niềm đam mê...   │
│                       │
└───────────────────────┘
```

---

## Responsive Design

### Mobile (< 768px)
- 1 column grid
- Full width cards
- Stack vertically

### Tablet (768px - 1024px)
- 2 columns grid
- Cards side by side

### Desktop (> 1024px)
- 3 columns grid
- Optimal viewing experience

---

## Data Flow

```
1. User visits /teachers
   ↓
2. Page calls useAsyncData('teachers-list', ...)
   ↓
3. Fetch from /api/proxy/teachers
   ↓
4. Server API calls Strapi: http://171.244.140.108:1337/api/teachers?populate=*
   ↓
5. Transform data (add full image URLs)
   ↓
6. Return to page component
   ↓
7. Render TeacherCard components in grid
```

---

## Testing

### 1. Test API Endpoint
```bash
curl "http://171.244.140.108:1337/api/teachers?populate=*"
```

### 2. Test Page
```
Navigate to: http://localhost:3000/teachers
```

### Expected Result:
- ✅ 6 giáo viên hiển thị trong grid
- ✅ Ảnh load đúng từ Strapi
- ✅ Tên và mô tả hiển thị chính xác
- ✅ Responsive trên mobile/tablet/desktop

---

## Navigation

### Từ Home Page
Button "Xem tất cả" ở section "Đội Ngũ Giáo Viên Tài Năng" → `/teachers`

### From Header Navigation
Có thể thêm link vào navigation menu (nếu cần)

---

## Future Enhancements

1. **Pagination:** Khi có nhiều giáo viên
2. **Filter:** Lọc theo môn học, kinh nghiệm
3. **Search:** Tìm kiếm giáo viên theo tên
4. **Detail Page:** Click vào card → trang chi tiết giáo viên
5. **Animation:** Stagger animation khi load cards

---

## Notes

- ✅ Component `TeacherCard` đã tồn tại và được reuse
- ✅ API endpoint mới tạo tại `server/api/proxy/teachers.get.ts`
- ✅ Sử dụng dữ liệu thật từ Strapi (không mock)
- ✅ SEO friendly với meta tags
- ✅ Responsive design đầy đủ
- ⚠️ Cần restart dev server sau khi thay đổi .env
