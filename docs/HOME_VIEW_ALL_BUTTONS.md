# Thêm Button "Xem tất cả" cho Home Page

## Yêu cầu
Ở trang Home, **trừ section Học sinh tiêu biểu ra**, thêm text button "Xem tất cả >" ngang hàng với title của mỗi section. Khi click sẽ route đến trang tương ứng.

## Các thay đổi đã thực hiện

### 1. ✅ TeachersGrid Component
**File:** `components/TeachersGrid.vue`

**Thay đổi:**
- Thay đổi layout header từ `flex items-center` → `flex items-center justify-between`
- Wrap icon + title vào div riêng
- Thêm button "Xem tất cả >" bên phải
- Route: `/courses`

**Code:**
```vue
<div class="flex items-center justify-between mb-8">
  <div class="flex items-center gap-3">
    <img v-if="icon" :src="icon" alt="icon" class="w-10 h-10 object-contain" />
    <h2 class="text-2xl font-bold text-primary">
      {{ title || 'Đội Ngũ Giáo Viên Tài Năng' }}
    </h2>
  </div>
  <NuxtLink 
    to="/courses"
    class="inline-flex items-center gap-1 text-primary hover:text-teal-600 font-semibold text-sm transition-colors group"
  >
    <span>Xem tất cả</span>
    <svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform">
      <!-- Arrow icon -->
    </svg>
  </NuxtLink>
</div>
```

---

### 2. ✅ FeaturedCourses Component
**File:** `components/FeaturedCourses.vue`

**Thay đổi:**
- Tương tự TeachersGrid
- Route: `/courses`

**Code:**
```vue
<div class="flex items-center justify-between mb-8">
  <div class="flex items-center gap-3">
    <img v-if="icon" :src="icon" alt="Icon" class="w-10 h-10 object-contain" />
    <h2 class="text-2xl font-bold text-primary">
      {{ title || 'Khoá Học Nổi Bật' }}
    </h2>
  </div>
  <NuxtLink 
    to="/courses"
    class="inline-flex items-center gap-1 text-primary hover:text-teal-600 font-semibold text-sm transition-colors group"
  >
    <span>Xem tất cả</span>
    <svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform">
      <!-- Arrow icon -->
    </svg>
  </NuxtLink>
</div>
```

---

### 3. ✅ NewsList Component
**File:** `components/NewsList.vue`

**Thay đổi:**
- Layout header từ `flex items-center` → `flex items-center justify-between`
- Route: `/news`

**Code:**
```vue
<div class="flex items-center justify-between mb-4">
  <div class="flex items-center gap-2">
    <img v-if="icon" :src="icon" alt="icon" class="w-8 h-8 object-contain" />
    <h3 class="text-xl font-bold text-primary">
      {{ title || 'Tin Tức Nổi Bật' }}
    </h3>
  </div>
  <NuxtLink 
    to="/news"
    class="inline-flex items-center gap-1 text-primary hover:text-teal-600 font-semibold text-sm transition-colors group"
  >
    <span>Xem tất cả</span>
    <svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform">
      <!-- Arrow icon -->
    </svg>
  </NuxtLink>
</div>
```

---

### 4. ⚠️ Leaderboard Component - KHÔNG SỬA
**File:** `components/Leaderboard.vue`

**Lý do:** Đây là section "Bảng Xếp Hạng Tuần Này" (Học sinh tiêu biểu), theo yêu cầu thì **KHÔNG** cần thêm button "Xem tất cả".

---

## Styling của Button "Xem tất cả"

### Design Pattern
- **Text button** (không có background)
- Màu chữ: `text-primary` (teal-500)
- Hover: `hover:text-teal-600`
- Font: `font-semibold text-sm`
- Icon: Arrow right với animation `translate-x-1` khi hover

### Layout
```
[Icon] [Title]  ← bên trái
                [Xem tất cả >] ← bên phải
```

### Responsive
- Button luôn hiển thị trên cả mobile và desktop
- Text button nhỏ gọn, không chiếm nhiều không gian
- Icon arrow có animation khi hover để thu hút sự chú ý

---

## Kết quả

✅ **3 sections đã được thêm button:**
1. Đội Ngũ Giáo Viên → `/courses`
2. Khoá Học Nổi Bật → `/courses`
3. Tin Tức Nổi Bật → `/news`

❌ **1 section KHÔNG thêm button:**
- Bảng Xếp Hạng Tuần Này (Học sinh tiêu biểu)

---

## UI/UX

**Trước:**
```
[Icon] [Title Section]
[Nội dung...]
```

**Sau:**
```
[Icon] [Title Section]          [Xem tất cả >]
[Nội dung...]
```

- Button nằm ngang hàng với title
- Có hiệu ứng hover (màu chữ + icon dịch chuyển)
- Consistent design cho tất cả các section
