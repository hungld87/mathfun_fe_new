# Cập Nhật Color Scheme - Teal Theme

## 🎨 Thay đổi màu sắc

### Màu Primary (Chính)
- **Trước:** `#2F80ED` (Blue)
- **Sau:** `#3FB3AA` (Teal) - Đồng bộ với màu Header

### Màu mới được thêm
- **Primary Dark:** `#359A91` - Dùng cho hover states
- **Secondary:** `#FF6B35` (Orange) - Dùng cho accents
- **Teal Shades:** 
  - `teal-50`: #F0FDFA (background nhẹ)
  - `teal-100`: #CCFBF1 (background hover)
  - `teal-500`: #14B8A6 (main teal)
  - `teal-600`: #0D9488 (darker teal for hover)

## 📁 Files đã cập nhật

### 1. Theme Configuration
- ✅ `/assets/css/theme.css` - CSS variables
- ✅ `/tailwind.config.js` - Tailwind colors
- ✅ `/server/mocks/global.json` - API global theme colors

### 2. Components
- ✅ `/components/AppFooter.vue` - Newsletter button
- ✅ `/components/HeroCarousel.vue` - CTA button
- ✅ `/components/CourseCard.vue` - "Xem chi tiết" button

### 3. Pages
- ✅ `/pages/courses/index.vue` - "Xem thêm" button
- ✅ `/pages/practice/index.vue` - "Xem thêm" button
- ✅ `/pages/news/index.vue` - "Xem thêm" button

## 🎯 Chi tiết thay đổi

### CSS Variables (theme.css)
```css
:root {
  --color-primary: #3FB3AA;        /* Teal */
  --color-primary-dark: #359A91;   /* Darker Teal */
  --color-secondary: #FF6B35;      /* Orange */
}
```

### Tailwind Config
```javascript
colors: {
  primary: '#3FB3AA',
  'primary-dark': '#359A91',
  secondary: '#FF6B35',
}
```

### Button Hover States
**Trước:**
```html
hover:bg-blue-600
hover:bg-blue-700
```

**Sau:**
```html
hover:bg-teal-600
hover:shadow-lg
transition-all
```

## 💡 Lợi ích

✅ **Đồng bộ màu sắc:** Tất cả buttons giờ dùng màu teal giống header
✅ **Consistent branding:** Màu sắc nhất quán trong toàn bộ website
✅ **Modern look:** Teal color tạo cảm giác hiện đại, chuyên nghiệp
✅ **Better UX:** Hover effects với shadow tạo feedback tốt hơn
✅ **Theme from API:** Backend có thể control màu sắc qua global.json

## 🔄 Mapping Màu Cũ -> Mới

| Component | Màu Cũ | Màu Mới | Hover State |
|-----------|--------|---------|-------------|
| Header | Teal | Teal | ✅ Giữ nguyên |
| Buttons | Blue | **Teal** | teal-600 + shadow |
| Links | Blue | **Teal** | text-teal-600 |
| Filters | Blue ring | **Teal ring** | teal-500 |
| Active Pills | Blue | **Teal gradient** | scale + shadow |

## 🚀 Sử dụng

### Trong HTML/Template
```html
<!-- Primary Button -->
<button class="bg-primary text-white hover:bg-teal-600 hover:shadow-lg transition-all">
  Button Text
</button>

<!-- Secondary Button -->
<button class="bg-secondary text-white hover:bg-orange-600 transition-all">
  Button Text
</button>

<!-- Link -->
<a class="text-primary hover:text-teal-600 transition">Link Text</a>

<!-- Filter/Pill Active -->
<button class="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
  Active Filter
</button>
```

### Trong CSS
```css
.my-element {
  color: var(--color-primary);
  background: var(--color-primary);
}

.my-element:hover {
  background: var(--color-primary-dark);
}
```

## 📱 Responsive & Accessibility

- ✅ Tất cả hover states đều có transition smooth
- ✅ Focus states với ring-2 ring-teal-500/20
- ✅ Contrast ratio đủ cho accessibility (WCAG AA)
- ✅ Touch-friendly với padding đủ lớn

## 🎨 Design Tokens

Backend có thể override colors qua API `/api/mock/global`:

```json
{
  "theme": {
    "primary_color": "#3FB3AA",
    "primary_dark_color": "#359A91",
    "secondary_color": "#FF6B35"
  }
}
```

Frontend sẽ tự động apply các màu này vào:
- CSS variables
- Tailwind classes
- Component styles
