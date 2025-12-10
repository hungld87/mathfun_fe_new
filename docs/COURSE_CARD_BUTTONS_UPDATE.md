# Cập nhật UI Button trong CourseCard

## Yêu cầu
Các button "Yêu cầu tư vấn" và "Xem khoá học" trong CourseCard cần có UI bo tròn giống button "Yêu cầu tư vấn" ở Header.

## Thay đổi đã thực hiện

### File: `components/CourseCard.vue`

#### Button "Yêu cầu tư vấn"

**Trước:**
```vue
<button 
  @click="openConsultationModal"
  class="flex-1 rounded-lg bg-orange-500 text-white px-3 py-2 text-center text-sm font-semibold hover:bg-orange-600 hover:shadow-md transition-all flex items-center justify-center gap-1"
>
```

**Sau:**
```vue
<button 
  @click="openConsultationModal"
  class="flex-1 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 text-white px-3 py-2 text-center text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-1"
>
```

**Chi tiết thay đổi:**
- ✅ `rounded-lg` → `rounded-full` (bo tròn hoàn toàn)
- ✅ `bg-orange-500` → `bg-gradient-to-r from-orange-400 to-orange-500` (gradient màu)
- ✅ `hover:bg-orange-600` → bỏ (không cần vì đã có gradient)
- ✅ `hover:shadow-md` → `hover:shadow-lg` (shadow đậm hơn)
- ✅ Thêm `hover:scale-105` (hiệu ứng phóng to khi hover)

---

#### Button "Xem khoá"

**Trước:**
```vue
<button 
  @click="openCourse"
  class="flex-1 rounded-lg bg-primary text-white px-3 py-2 text-center text-sm font-semibold hover:bg-teal-600 hover:shadow-md transition-all"
>
```

**Sau:**
```vue
<button 
  @click="openCourse"
  class="flex-1 rounded-full bg-primary text-white px-3 py-2 text-center text-sm font-semibold hover:bg-teal-600 hover:shadow-lg hover:scale-105 transition-all"
>
```

**Chi tiết thay đổi:**
- ✅ `rounded-lg` → `rounded-full` (bo tròn hoàn toàn)
- ✅ `hover:shadow-md` → `hover:shadow-lg` (shadow đậm hơn)
- ✅ Thêm `hover:scale-105` (hiệu ứng phóng to khi hover)

---

## So sánh với Button ở Header

### Button Header (mẫu tham khảo):
```vue
<button 
  class="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-5 py-2.5 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
>
```

### Điểm giống nhau sau khi sửa:
- ✅ `rounded-full` - Bo tròn hoàn toàn
- ✅ `bg-gradient-to-r from-orange-400 to-orange-500` - Gradient màu cam
- ✅ `hover:shadow-lg` - Shadow khi hover
- ✅ `hover:scale-105` - Phóng to nhẹ khi hover
- ✅ `transition-all` - Smooth transition

---

## Kết quả

### Button "Yêu cầu tư vấn":
- **Trước:** Bo góc vuông vắn (rounded-lg), màu cam đơn sắc
- **Sau:** Bo tròn hoàn toàn (rounded-full), gradient cam đẹp mắt, hiệu ứng phóng to khi hover

### Button "Xem khoá":
- **Trước:** Bo góc vuông vắn (rounded-lg)
- **Sau:** Bo tròn hoàn toàn (rounded-full), hiệu ứng phóng to khi hover

### Visual:
```
┌─────────────────────────────┐
│  [●  Yêu cầu tư vấn]  [Xem khoá ●]  │  ← rounded-full (Sau)
└─────────────────────────────┘

┌─────────────────────────────┐
│  [□  Yêu cầu tư vấn]  [Xem khoá □]  │  ← rounded-lg (Trước)
└─────────────────────────────┘
```

---

## UI/UX Improvements

1. **Consistency:** Giờ các button trong card khớp với button ở Header
2. **Modern Look:** Rounded-full + gradient tạo cảm giác hiện đại hơn
3. **Interactive:** Thêm scale effect khi hover tạo feedback tốt hơn cho user
4. **Visual Hierarchy:** Gradient orange nổi bật hơn cho button chính (Yêu cầu tư vấn)
