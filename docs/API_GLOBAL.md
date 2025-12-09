# Global API Documentation

## Mô tả
API Global cung cấp thông tin cấu hình toàn cục cho website, bao gồm Header, Footer, SEO, Theme colors, và các tính năng.

## Endpoint
```
GET /api/mock/global
```

## Response Structure

### Header Configuration
```json
{
  "header": {
    "logo": {
      "text": "MATHFUN",
      "sub_text": "",
      "icon": "M",
      "link": "/"
    },
    "search": {
      "placeholder": "Tìm kiếm khóa học, bài tập, tài liệu...",
      "enabled": true
    },
    "navigation": [
      {
        "id": 1,
        "title": "Trang chủ",
        "slug": "/",
        "icon": "🏠"
      }
    ],
    "buttons": {
      "login": {
        "text": "Đăng nhập",
        "enabled": true
      },
      "consultation": {
        "text": "Yêu cầu tư vấn",
        "enabled": true
      }
    }
  }
}
```

### Footer Configuration
```json
{
  "footer": {
    "brand": {
      "name": "MathFun",
      "slogan": "Học Toán Thông Minh - Tư Duy Sáng Tạo",
      "description": "..."
    },
    "contact": {
      "address": "...",
      "phone": "...",
      "email": "...",
      "working_hours": "..."
    },
    "navigation": {
      "title": "Liên Kết",
      "items": []
    },
    "resources": {
      "title": "Tài Nguyên",
      "items": []
    },
    "policies": {
      "title": "Chính Sách",
      "items": []
    },
    "newsletter": {
      "title": "Đăng Ký Nhận Tin",
      "description": "...",
      "placeholder": "Email của bạn",
      "button_text": "Đăng ký",
      "enabled": true
    },
    "social": {
      "title": "Kết Nối Với Chúng Tôi",
      "links": []
    },
    "copyright": {
      "text": "© 2024 MathFun. All rights reserved.",
      "company": "Công ty TNHH Giáo Dục MathFun"
    }
  }
}
```

## Sử dụng trong Component

### 1. Sử dụng composable useGlobal()

```vue
<script setup lang="ts">
const { globalConfig } = useGlobal()
</script>

<template>
  <header>
    <!-- Logo -->
    <NuxtLink :to="globalConfig?.header.logo.link">
      {{ globalConfig?.header.logo.text }}
    </NuxtLink>
    
    <!-- Navigation -->
    <nav>
      <NuxtLink 
        v-for="item in globalConfig?.header.navigation" 
        :key="item.id"
        :to="item.slug"
      >
        {{ item.icon }} {{ item.title }}
      </NuxtLink>
    </nav>
  </header>
</template>
```

### 2. Cập nhật AppHeader.vue

Thay vì hard-code menu items, sử dụng data từ API:

```vue
<script setup lang="ts">
const { globalConfig } = useGlobal()
</script>

<template>
  <nav>
    <NuxtLink 
      v-for="item in globalConfig?.header.navigation"
      :key="item.id"
      :to="item.slug"
      :class="{ 'highlight': item.is_highlight }"
    >
      {{ item.title }}
    </NuxtLink>
  </nav>
</template>
```

### 3. Cập nhật AppFooter.vue

```vue
<script setup lang="ts">
const { globalConfig } = useGlobal()
</script>

<template>
  <footer>
    <!-- Brand -->
    <div>
      <h3>{{ globalConfig?.footer.brand.name }}</h3>
      <p>{{ globalConfig?.footer.brand.slogan }}</p>
    </div>
    
    <!-- Navigation Links -->
    <div>
      <h4>{{ globalConfig?.footer.navigation.title }}</h4>
      <NuxtLink
        v-for="item in globalConfig?.footer.navigation.items"
        :key="item.id"
        :to="item.slug"
      >
        {{ item.title }}
      </NuxtLink>
    </div>
    
    <!-- Social Links -->
    <div>
      <a
        v-for="social in globalConfig?.footer.social.links"
        :key="social.id"
        :href="social.url"
        target="_blank"
      >
        {{ social.name }}
      </a>
    </div>
  </footer>
</template>
```

## Features

### Theme Colors
Backend có thể control màu sắc theme:
```json
{
  "theme": {
    "primary_color": "#3FB3AA",
    "secondary_color": "#FF6B35",
    "success_color": "#27AE60"
  }
}
```

### Feature Flags
Bật/tắt tính năng:
```json
{
  "features": {
    "maintenance_mode": false,
    "show_promotion_banner": true,
    "enable_chat_support": true
  }
}
```

### SEO Configuration
Default SEO metadata:
```json
{
  "seo": {
    "default_title": "MathFun - Học Toán Thông Minh",
    "default_description": "...",
    "default_keywords": "...",
    "og_image": "..."
  }
}
```

## Lợi ích

✅ **Dynamic Configuration**: Backend control 100% nội dung Header/Footer
✅ **Single Source of Truth**: Một API cho toàn bộ site config
✅ **Easy Updates**: Thay đổi menu, links, colors mà không cần deploy frontend
✅ **Cached**: Config được cache trong useState, chỉ gọi API 1 lần
✅ **Type Safe**: Full TypeScript support với interface GlobalConfig
