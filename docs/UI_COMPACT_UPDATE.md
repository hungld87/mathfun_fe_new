# Cập nhật UI - Thu gọn các Modal và Buttons

## Tổng quan thay đổi

Đã thu gọn toàn bộ UI của các modal và buttons trong trang Practice Test để giao diện gọn gàng, hiện đại và dễ sử dụng hơn.

## Chi tiết thay đổi

### 1. Result Modal (Popup Hoàn thành bài thi)

#### Header
**Trước:**
```vue
<div class="text-white px-6 py-6">
  <div class="flex items-center justify-center gap-3 mb-4">
    <svg class="w-16 h-16">...</svg>
  </div>
  <h2 class="text-3xl font-bold mb-2">...</h2>
  <div class="text-5xl font-bold mb-2">10/100</div>
  <div class="text-2xl font-semibold">10%</div>
</div>
```

**Sau:**
```vue
<div class="text-white px-6 py-4">
  <div class="flex items-center justify-center gap-2 mb-2">
    <svg class="w-10 h-10">...</svg>
    <h2 class="text-xl font-bold">...</h2>
  </div>
  <div class="flex items-baseline justify-center gap-2">
    <span class="text-3xl font-bold">10/100</span>
    <span class="text-lg font-semibold">(10%)</span>
  </div>
</div>
```

**Giảm:**
- Padding: `py-6` → `py-4`
- Icon size: `w-16 h-16` → `w-10 h-10`
- Title: `text-3xl` → `text-xl`
- Score: `text-5xl` → `text-3xl`
- Percentage: `text-2xl` → `text-lg` và ghép vào cùng dòng với score
- Gap: `gap-3 mb-4` → `gap-2 mb-2`

#### Body
**Trước:**
```vue
<div class="p-6">
  <div class="grid grid-cols-2 gap-4 mb-6">
    <div class="rounded-xl p-4">
      <div class="text-3xl">10</div>
      <div class="text-sm">Câu đúng</div>
    </div>
  </div>
</div>
```

**Sau:**
```vue
<div class="p-4">
  <div class="grid grid-cols-2 gap-3 mb-4">
    <div class="rounded-lg p-3">
      <div class="text-2xl">10</div>
      <div class="text-xs">Câu đúng</div>
    </div>
  </div>
</div>
```

**Giảm:**
- Container padding: `p-6` → `p-4`
- Grid gap: `gap-4 mb-6` → `gap-3 mb-4`
- Card border radius: `rounded-xl` → `rounded-lg`
- Card padding: `p-4` → `p-3`
- Number size: `text-3xl` → `text-2xl`
- Label size: `text-sm` → `text-xs`

#### Details Section
**Trước:**
```vue
<div class="mb-6">
  <h3 class="text-lg font-bold mb-3">
    <svg class="w-5 h-5">...</svg>
    Chi tiết từng câu
  </h3>
  <div class="max-h-64 overflow-y-auto">
    <div class="p-3 rounded-lg">
      <div class="w-8 h-8 text-sm">1</div>
      <div>
        <div class="text-sm mb-1">Câu 1</div>
        <div class="text-xs">Bạn trả lời: ...</div>
      </div>
      <span class="text-lg">10/10</span>
      <svg class="w-6 h-6">...</svg>
    </div>
  </div>
</div>
```

**Sau:**
```vue
<div class="mb-4">
  <h3 class="text-base font-bold mb-2">
    <svg class="w-4 h-4">...</svg>
    Chi tiết từng câu
  </h3>
  <div class="max-h-48 overflow-y-auto">
    <div class="p-2 rounded-lg">
      <div class="w-7 h-7 text-xs">1</div>
      <div>
        <div class="text-xs">Câu 1</div>
        <div class="text-xs">...</div>
      </div>
      <span class="text-base">10/10</span>
      <svg class="w-5 h-5">...</svg>
    </div>
  </div>
</div>
```

**Giảm:**
- Section margin: `mb-6` → `mb-4`
- Title: `text-lg mb-3` → `text-base mb-2`
- Icon: `w-5 h-5` → `w-4 h-4`
- Max height: `max-h-64` → `max-h-48`
- Item padding: `p-3` → `p-2`
- Badge: `w-8 h-8 text-sm` → `w-7 h-7 text-xs`
- Text: `text-sm mb-1` → `text-xs` (bỏ margin)
- Score: `text-lg` → `text-base`
- Check icon: `w-6 h-6` → `w-5 h-5`
- Bỏ text "Bạn trả lời:" để tiết kiệm không gian

#### Message & Buttons
**Trước:**
```vue
<div class="bg-blue-50 p-4 mb-6">
  <p class="font-semibold">...</p>
</div>

<div class="flex flex-col gap-3">
  <button class="px-6 py-3 rounded-xl font-bold">
    <svg class="w-5 h-5">...</svg>
    Quay lại danh sách đề thi
  </button>
  <button class="px-6 py-3 rounded-xl font-bold">
    <svg class="w-5 h-5">...</svg>
    Làm lại
  </button>
</div>
```

**Sau:**
```vue
<div class="bg-blue-50 p-3 mb-4">
  <p class="text-sm font-semibold">...</p>
</div>

<button class="w-full px-4 py-2.5 rounded-lg font-semibold">
  <svg class="w-5 h-5">...</svg>
  Quay lại danh sách
</button>
```

**Giảm:**
- Message padding: `p-4 mb-6` → `p-3 mb-4`
- Message text: thêm `text-sm`
- **BỎ nút "Làm lại"** - chỉ giữ 1 nút duy nhất
- Button padding: `px-6 py-3` → `px-4 py-2.5`
- Border radius: `rounded-xl` → `rounded-lg`
- Font weight: `font-bold` → `font-semibold`
- Bỏ gradient background → chỉ dùng `bg-primary`
- Text: "Quay lại danh sách đề thi" → "Quay lại danh sách"

### 2. Confirm Submit Modal

**Trước:**
```vue
<button class="px-6 py-3 rounded-xl font-bold">Hủy</button>
<button class="px-6 py-3 rounded-xl font-bold">Xác nhận</button>
```

**Sau:**
```vue
<button class="px-4 py-2.5 rounded-lg font-semibold">Hủy</button>
<button class="px-4 py-2.5 rounded-lg font-semibold">Nộp bài</button>
```

**Giảm:**
- Padding: `px-6 py-3` → `px-4 py-2.5`
- Border radius: `rounded-xl` → `rounded-lg`
- Font: `font-bold` → `font-semibold`
- Bỏ gradient → `bg-primary`
- Text: "Xác nhận" → "Nộp bài" (ngắn gọn hơn)

### 3. Leave Confirmation Modal

**Trước:**
```vue
<button class="px-6 py-3 rounded-xl font-bold">Ở lại làm bài</button>
<button class="px-6 py-3 rounded-xl font-bold">Rời khỏi</button>
```

**Sau:**
```vue
<button class="px-4 py-2.5 rounded-lg font-semibold">Ở lại</button>
<button class="px-4 py-2.5 rounded-lg font-semibold">Rời khỏi</button>
```

**Giảm:**
- Padding: `px-6 py-3` → `px-4 py-2.5`
- Border radius: `rounded-xl` → `rounded-lg`
- Font: `font-bold` → `font-semibold`
- Bỏ gradient → `bg-primary`
- Text: "Ở lại làm bài" → "Ở lại"

### 4. Timeout Modal

**Trước:**
```vue
<button class="px-6 py-3 rounded-xl font-bold">Không</button>
<button class="px-6 py-3 rounded-xl font-bold">Có</button>
```

**Sau:**
```vue
<button class="px-4 py-2.5 rounded-lg font-semibold">Quay lại</button>
<button class="px-4 py-2.5 rounded-lg font-semibold">Thi lại</button>
```

**Giảm:**
- Padding: `px-6 py-3` → `px-4 py-2.5`
- Border radius: `rounded-xl` → `rounded-lg`
- Font: `font-bold` → `font-semibold`
- Bỏ gradient → `bg-primary`
- Text: "Không"/"Có" → "Quay lại"/"Thi lại" (rõ nghĩa hơn)

### 5. Header Back Button

**Trước:**
```vue
<button class="inline-flex items-center gap-2 text-primary hover:underline mb-4">
  <svg class="w-5 h-5">...</svg>
  Quay lại danh sách
</button>
```

**Sau:**
```vue
<button class="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-3">
  <svg class="w-4 h-4">...</svg>
  Quay lại
</button>
```

**Giảm:**
- Gap: `gap-2` → `gap-1.5`
- Thêm: `text-sm` để nhỏ hơn
- Icon: `w-5 h-5` → `w-4 h-4`
- Margin: `mb-4` → `mb-3`
- Text: "Quay lại danh sách" → "Quay lại"

## Tổng kết

### Thay đổi chính:
1. ✅ Thu gọn Result Modal (popup hoàn thành)
2. ✅ **BỎ nút "Làm lại bài thi"** trong Result Modal
3. ✅ Thu gọn tất cả các nút "Quay lại danh sách" thành "Quay lại"
4. ✅ Giảm padding, font size, icon size của tất cả buttons
5. ✅ Thay `rounded-xl` → `rounded-lg` để gọn hơn
6. ✅ Thay `font-bold` → `font-semibold` để nhẹ hơn
7. ✅ Bỏ gradient effects để đơn giản hơn

### Lợi ích:
- 📱 Giao diện gọn gàng, hiện đại hơn
- 👁️ Dễ đọc và tập trung vào thông tin chính
- 🎯 Giảm visual clutter
- ⚡ Nhanh hơn cho người dùng (ít phải đọc, ít phải scroll)
- 📏 Nhất quán về kích thước và style

### Files đã sửa:
- `/pages/practice/[slug].vue` - Tất cả modals và buttons

### Breaking changes:
- ❌ Không còn nút "Làm lại" trong Result Modal (theo yêu cầu)
- ⚠️ Text buttons đã thay đổi (ngắn gọn hơn)
