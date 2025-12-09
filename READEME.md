📘 MathFun — Nuxt 3 SSR Educational Website

MathFun là website giáo dục xây dựng bằng Nuxt 3 (Vue 3 + SSR), tối ưu cho SEO, tốc độ tải nhanh, triển khai dễ dàng trên Vercel / Cloudflare / Netlify, và phát triển theo kiến trúc hiện đại: Vite, Nitro, TypeScript, Pinia, TailwindCSS và Mock API Center.

🚀 Tech Stack
Framework:
Nuxt 3 — Vue 3 + Vite + SSR
Nitro Engine — chạy ở edge/serverless
TypeScript
Pinia — State management
TailwindCSS — Styling
@nuxt/image — Image optimization
@nuxtjs/sitemap — SEO
MSW (Mock Service Worker) — Optional frontend API mocking
Nuxt Server API Mock — server-side mock cho SSR


🎨 Design System (UI Guideline)
🎨 Màu sắc
Token	Value	Use
Primary	#2F80ED	Buttons, links, highlights
Success	#27AE60	Success messages, badges
Background	#F7FAFC	Page background
Card	#FFFFFF	Card UI, surfaces
Text	#0B1B2B	Main text color
Text Muted	#64748B	Secondary text
✍️ Typography
Element	Size	Line height	Notes
h1	2rem	1.3	Section titles
h2	1.5rem	1.3	Subtitles
h3	1.25rem	1.3	Headings nhỏ
Body text	default	1.6	Dễ đọc, spacing thoáng
Font family	System fonts: SF Pro, Segoe UI, Roboto, sans-serif		
📐 Layout
Component	Value
Header height	64px
Sidebar width	280px
Max content width	1200px
Border radius (medium)	8px
Border radius (large)	12px

## Spec:
### Web gồm các menu chính: Home, Khoá học, Luyện đề, Tài liệu, Tin tức
1) Tóm tắt bố cục Home (sections)

Trang Home gồm những section chính (theo thứ tự hiển thị):

Slide banner (HeroCarousel) — danh sách banner { title, description, image, slug, link_internal }

Đội ngũ thầy cô (TeachersGrid) — card teacher { name, image, description }

Khoá học nổi bật (FeaturedCourses) — grid các course isHot: true { title, slug, image, cover_image, description, level, lessons, class }

Bảng xếp hạng tuần này (Leaderboard) — top students / courses

Tin tức nổi bật (NewsHighlights) — list items

- Kiến trúc component (đề xuất)

pages/index.vue — container page, fetch data SSR (useAsyncData)

components/HeroCarousel.vue

components/TeacherCard.vue, components/TeachersGrid.vue

components/CourseCard.vue, components/FeaturedCourses.vue

components/Leaderboard.vue

components/NewsList.vue

composables/useApi.ts (bạn đã có)

stores/user.ts (đã có)

server/api/mock/*.get.ts (mock endpoints)

- Data fetching (SSR) — pages/index.vue (skeleton)
```java
<script setup lang="ts">
import type { Banner, Teacher, Course, LeaderboardEntry, NewsItem } from '~/types'

const { get } = useApi()

const { data: banners } = await useAsyncData<Banner[]>('home-banners', () => get('/banners'))
const { data: teachers } = await useAsyncData<Teacher[]>('home-teachers', () => get('/teachers'))
const { data: courses } = await useAsyncData<Course[]>('home-courses', () => get('/courses?filter=hot'))
const { data: leaderboard } = await useAsyncData<LeaderboardEntry[]>('home-leaderboard', () => get('/leaderboard'))
const { data: news } = await useAsyncData<NewsItem[]>('home-news', () => get('/news?limit=4'))

definePageMeta({
  title: 'Trang chủ · EduWeb',
  meta: [
    { name: 'description', content: 'Trang chủ EduWeb — khoá học toán, đội ngũ giảng viên, tin tức nổi bật' }
  ]
})
</script>

<template>
  <main class="bg-background">
    <HeroCarousel :items="banners" />
    <section class="container mx-auto px-6 py-10 max-w-[1200px]">
      <TeachersGrid :teachers="teachers" />
    </section>

    <section class="container mx-auto px-6 py-10 max-w-[1200px]">
      <FeaturedCourses :courses="courses" />
    </section>

    <section class="container mx-auto px-6 py-10 max-w-[1200px] grid md:grid-cols-2 gap-8">
      <Leaderboard :items="leaderboard" />
      <NewsList :items="news" />
    </section>
  </main>
</template>
```

- Course card + nuxt link (đảm bảo routing & back)

Hành vi mong muốn: click 1 khoá học → /courses/[slug]; khi back phải về Danh sách khoá học (không phải home) — bạn muốn back trả về danh sách khoá học. Mình đề xuất:

Có page /courses/index.vue (danh sách) và /courses/[slug].vue (detail).

Từ Home, khi click course có 2 lựa chọn UX:

Chuyển trực tiếp tới detail (link to /courses/slug) — user có thể bấm back (browser.back()) để về Home. Nếu bạn muốn back về Danh sách khoá học thay vì Home, hãy điều hướng tới /courses?from=home trước hoặc use history replace.

Tốt nhất: mở detail nhưng lưu trạng thái referrer/scroll & filters để nếu user nhấn Back (site-level), họ được chuyển tới /courses với state preserved.

- SEO & Accessibility (Home)

Meta: title, description, og:title, og:description, og:image cho homepage.

Hero: mỗi banner có an h1/h2 semantic (chỉ 1 h1 tổng thể trên page).

Image optimization: dùng @nuxt/image (<NuxtImg src="..." :width="..." />) lazy-loading.

Alt text: tất cả ảnh có alt.

Accessible buttons/links: keyboard focus, aria-labels cho carousel prev/next and for "Subscribe".

Structured data: schema.org WebSite, BreadcrumbList, and Course for course pages (JSON-LD rendered server-side).

- Performance & UX

SSR + Hydration: Data loaded via useAsyncData để HTML server render.

Code-splitting: lazy-load non-critical sections (e.g., Leaderboard can be client-only).

Skeleton loaders: show skeleton while client fetches additional data.

Prefetch: <NuxtLink> auto prefetch; for courses list, prefetch attribute for top items to speed navigation.

Image sizes: serve responsive images (use sizes & srcset) via @nuxt/image.

Cache: cache API responses with stale-while-revalidate headers (Nitro or CDN). Use useAsyncData with server cache options if needed.

- Example CourseCard.vue (Tailwind + NuxtImg + accessible)
```java
<template>
  <article class="bg-card rounded-md shadow-sm overflow-hidden">
    <NuxtImg :src="course.cover_image || course.image" alt="" class="w-full h-44 object-cover" />
    <div class="p-4">
      <h3 class="text-lg font-semibold text-text mb-2">{{ course.title }}</h3>
      <p class="text-sm text-muted line-clamp-2 mb-3">{{ course.description }}</p>
      <div class="flex items-center justify-between">
        <div class="text-xs text-muted">{{ course.level }} • {{ course.lessons }} bài</div>
        <button @click="openCourse" class="ml-2 rounded-lg bg-primary text-white px-3 py-1 text-sm">
          Xem khoá
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Course } from '~/types'
const props = defineProps<{ course: Course }>()
const router = useRouter()

function openCourse() {
  sessionStorage.setItem('courses-referrer', JSON.stringify({ from: 'home', scrollY: window.scrollY }))
  router.push({ name: 'courses-slug', params: { slug: props.course.slug } })
}
</script>
```

2. Khoá học sẽ gồm danh sách các khoá học được để sẵn fillter theo môn học và  lớp. Môn học thì mặc định là All (danh sách môn học (do API trả về: [{title, slug, description, icon}]); danh sách các lớp do api trả về gồm: [{slug, title, description, icon}]), mặc định là all. Mỗi trang sẽ mặc định hiển thị 6 card khoá học, nhiều hơn thì có button loadmore
    - Click vào 1 khoá học thì dùng slug khoá học trên url và chuyển đến page Chi tiết khoá học, back về thì chuyển về Danh sách khoá học 

3. Luyện đề gồm 
    - Bộ filler: Lớp (mặc định là all), Môn học (mặc định là all), Chủ đề; Ô tìm kiếm
    - Danh sách các bài giảng luyện đề dạng video, hiển thị dạng bảng thông tin gồm: title, description, class, topic, thumb --> mặc định hiển thị 20 rows, nhiều hơn thì có button Loadmore

4. Tài liệu sẽ gồm danh sách các loại tài liệu (đề thi, bài tập, bài giảng) hiển thị dạng bảng có các cột: Tên, Loại, Lượt download, Action (button download)

5. Tin tức gồm:
    - Danh sách các loại tin tức (Category) (Mặc định là All) + Danh sách các bài viết mới nhất của tất cả các loại. Thông tin 1 category: title, description, icon, slug
    - Click vào 1 loại thì hiển thị danh sách các bài viết của loại đó, order theo mới nhất lên đầu. Thông tin 1 bài sẽ gồm: title, slug, description, content, thumb, cover, author, datetime, tag; Dưới là 2 block: 1 block là danh sách các khoá học liên quan theo tag (tối đa 3 khoá), 1 blok là danh sách các bài viết liên quan theo tags (tối đa 5 bài)

## Mô tả UI
1. Header: 
"Thiết kế một header hiện đại, tối giản và rõ ràng cho website giáo dục. Header cao 64px, full width, nền màu trắng hoặc light background (#FFFFFF hoặc #F7FAFC) với subtle shadow rất nhẹ để tạo chiều sâu.

Nội dung nằm trong một container max-width 1200px và căn giữa trang, padding ngang 24px.

Bên trái là logo chữ 'MathFun' dùng màu primary #2F80ED, font weight bold, kích thước lớn hơn body 1–2 bậc.

Ở giữa là thanh điều hướng ngang với spacing rộng rãi: Home, Courses, Blog, About. Text màu dark #0B1B2B, hover đổi thành primary. Font size khoảng 1rem, line-height 1.6, style thanh lịch và readable.

Bên phải là nhóm action: nút 'Login' dạng text button và nút 'Sign Up' dạng button bo tròn (radius 12px), nền màu primary #2F80ED, chữ trắng, hiệu ứng hover subtle.

Toàn bộ header clean, minimalistic, nhiều khoảng thở (white space), sử dụng system fonts (SF Pro / Segoe UI / Roboto), phù hợp tone giáo dục — thân thiện, chuyên nghiệp, dễ nhìn, dễ sử dụng.

Version mobile: logo bên trái, icon menu hamburger bên phải, menu ẩn trong drawer mượt khi mở ra."

2. Footer:
Bố cục chia thành 4 cột cân đối theo grid 4-column với khoảng cách đều nhau và max width 1200px, căn giữa trang.

Cột 1: Brand gồm logo dạng chữ (EduWeb / MathFun) dùng màu primary #2F80ED, kèm một đoạn mô tả ngắn 2 dòng với text muted #64748B.

Cột 2: Navigation gồm danh sách link: Courses, Blog, About, Contact — text size 0.95rem, font weight medium. Hover chuyển màu primary.

Cột 3: Resources gồm FAQ, Help Center, Student Dashboard, Teacher Portal.

Cột 4: Newsletter gồm tiêu đề 'Subscribe', một input bo tròn 12px (radius large), nền card trắng #FFFFFF, border mỏng, nút gửi màu primary #2F80ED.

Dưới cùng là một dải thanh nhỏ (bottom bar) có border-top 1px rất nhẹ (#E2E8F0), hiển thị © 2025 EduWeb. All rights reserved. và các icon social (Facebook, YouTube, Twitter) dạng outline, spacing thoáng.

Toàn bộ footer sử dụng typography hệ thống (SF Pro / Segoe UI / Roboto), line-height 1.6, các element có spacing thoáng, không rối mắt. Tone tổng thể sạch, đơn giản, premium và hiện đại.”

2. Tất cả css dùng chung thì để ở common.css, theme.css chứa Global styles and CSS variables


📁 Project Structure
```java
.
├── app/
├── assets/
├── components/
├── composables/
│   └── useApi.ts
├── layouts/
├── mocks/
│   ├── browser/
│   │   ├── handlers.ts
│   │   └── browser.ts
│   └── node/
│       ├── handlers.ts
│       └── server.ts
├── pages/
├── plugins/
│   └── msw.client.ts
├── public/
├── server/
│   ├── api/
│   │   ├── mock/
│   │   │   └── users.get.ts
│   │   └── proxy/[...].ts
│   └── mocks/
│       └── users.json
├── stores/
│   └── user.ts
└── nuxt.config.ts
```

🧩 API Layer & Mock Data Center

MathFun hỗ trợ 2 lớp mock API, giúp dev frontend độc lập backend, test dễ dàng, và SSR vẫn hoạt động đúng.

1. Server Mock API (Recommended — SSR Friendly)

Mock API được thực thi trong Nuxt Server Routes (/server/api/mock/*), hoạt động cho cả server lẫn client.

📁 Example
```java
server/
  api/
    mock/
      users.get.ts
  mocks/
    users.json
```

server/mocks/users.json
```java
[
  { "id": 1, "name": "Nguyen A", "email": "a@example.com" },
  { "id": 2, "name": "Tran B", "email": "b@example.com" }
]
```

server/api/mock/users.get.ts
```java
import { readFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async () => {
  const file = join(process.cwd(), 'server', 'mocks', 'users.json')
  return {
    status: 'ok',
    data: JSON.parse(await readFile(file, 'utf-8'))
  }
})
```

2. API Gateway & useApi() Composable
Tất cả request đi qua useApi.
Tự động điều hướng sang mock hoặc backend thật.

composables/useApi.ts
```java
export const useApi = () => {
  const config = useRuntimeConfig()
  const useMock = config.public.useMock

  async function get(path: string, opts = {}) {
    const url = useMock ? `/api/mock${path}` : config.public.apiBase + path
    return await $fetch(url, opts)
  }

  async function post(path: string, data: any, opts = {}) {
    const url = useMock ? `/api/mock${path}` : config.public.apiBase + path
    return await $fetch(url, { method: 'POST', body: data, ...opts })
  }

  return { get, post }
}
```

3. Optional: Client-side Mock với MSW

MSW bắt mọi request trên trình duyệt, rất tốt để simulate lỗi, latency, e2e.
plugins/msw.client.ts
```java
export default defineNuxtPlugin(async () => {
  if (process.env.NUXT_PUBLIC_USE_MSW !== 'true') return

  if (process.dev) {
    const { worker } = await import('../mocks/browser/browser')
    await worker.start({ onUnhandledRequest: 'warn' })
    console.log('[MSW] Mock Service Worker started')
  }
})
```

4. Bật/Tắt Mock API
.env
```java
NUXT_PUBLIC_USE_MOCK=true      # bật server mock
NUXT_PUBLIC_USE_MSW=false      # hoặc bật MSW nếu cần
NUXT_PUBLIC_API_BASE=http://localhost:1337
```


⚙️ Cấu hình Nuxt (nuxt.config.ts gợi ý)
```java
export default defineNuxtConfig({
  ssr: true,

  modules: [
    '@pinia/nuxt',
    '@nuxt/image',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/sitemap'
  ],

  runtimeConfig: {
    public: {
      useMock: process.env.NUXT_PUBLIC_USE_MOCK === 'true',
      apiBase: process.env.NUXT_PUBLIC_API_BASE || ''
    }
  }
})
```

🎯 SEO Optimization Checklist (Default Included)

✔️ SSR HTML for crawlers
✔️ definePageMeta() cho meta từng trang
✔️ Sitemap + robots.txt
✔️ OG Image + Social preview
✔️ Image optimization tự động
✔️ Preload fonts và critical CSS
✔️ Clean heading structure (H1-H3)

Ví dụ trong page:
```java
<script setup>
definePageMeta({
  title: 'Khóa học toán tư duy',
  meta: [
    { name: 'description', content: 'Học toán tư duy cho trẻ em từ lớp 1–5.' }
  ]
})
</script>
```

🧩 Tailwind Config (Mapping Design System)
```java
export default {
  theme: {
    extend: {
      colors: {
        primary: '#2F80ED',
        success: '#27AE60',
        background: '#F7FAFC',
        card: '#FFFFFF',
        text: '#0B1B2B',
        muted: '#64748B',
      },
      borderRadius: {
        md: '8px',
        lg: '12px'
      },
      maxWidth: {
        content: '1200px'
      }
    }
  }
}
```

▶️ Development
Install dependencies
npm install

Development server
npm run dev

Build production
npm run build

Preview build
npm run preview