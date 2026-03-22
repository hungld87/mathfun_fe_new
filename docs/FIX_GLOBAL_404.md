# 🐛 Fix: 404 Error /api/global

## ❌ Lỗi

```
[GET] "http://localhost:1337/api/global": 404 Not Found
```

## 🔍 Nguyên nhân

1. **Backend** có route: `/api/global/full` ✅
2. **Frontend** `useGlobal.ts` gọi: `/global` → biến thành `/api/global` ❌
3. **Không khớp** → 404 Error

## ✅ Giải pháp đã áp dụng

### 1. Thêm route `/api/global` trong Backend

**File**: `/src/api/global/routes/global.ts`

```typescript
export default {
  routes: [
    {
      method: 'GET',
      path: '/global',              // ← MỚI THÊM
      handler: 'api::global.global.full',
      config: {
        policies: [],
        middlewares: [],
        auth: false
      },
    },
    {
      method: 'GET',
      path: '/global/full',         // ← GIỮ NGUYÊN
      handler: 'api::global.global.full',
      config: {
        policies: [],
        middlewares: [],
        auth: false
      },
    },
  ],
};
```

### 2. Cập nhật Frontend

**File**: `/composables/useGlobal.ts`

```typescript
// Trước:
const data = await get('/global')      // ❌

// Sau:
const data = await get('/global/full') // ✅
```

## 🧪 Kiểm tra

Sau khi sửa, cả 2 URL đều hoạt động:

```bash
# URL 1 (mới thêm)
curl http://localhost:1337/api/global

# URL 2 (ban đầu)
curl http://localhost:1337/api/global/full
```

## 🔄 Restart

### Backend (Strapi)
```bash
cd mathfun_cms_new
# Ctrl+C để dừng
npm run develop
```

### Frontend (Nuxt)
```bash
cd mathfun_fe_new
# Ctrl+C để dừng
npm run dev
```

## 📊 Flow hiện tại

```
Frontend Component
  └─> useGlobal.ts
      └─> useApi.get('/global/full')
          └─> useMock=false → http://localhost:1337/api/global/full ✅
          └─> useMock=true  → http://localhost:3000/api/mock/global/full ✅

Frontend Component (nếu dùng trực tiếp)
  └─> $fetch('/api/mock/global')
      └─> server/api/mock/global.get.ts
          └─> $fetch(`${apiBase}/global/full`) ✅
```

## ✅ Kết quả

- ✅ Không còn lỗi 404
- ✅ Global config load được
- ✅ Header và Footer hiển thị đúng
- ✅ Tương thích cả mock và real API

---

**Fixed**: 28/02/2026  
**Files modified**: 
- `/mathfun_cms_new/src/api/global/routes/global.ts`
- `/mathfun_fe_new/composables/useGlobal.ts`
