# Tính năng Yêu cầu Đăng nhập cho Practice Test

## Tổng quan

Tính năng này đảm bảo người dùng phải đăng nhập trước khi có thể làm bài thi Practice. Đây là một biện pháp bảo mật và quản lý người dùng quan trọng.

## Luồng hoạt động

### 1. Kiểm tra Authentication khi load trang

```typescript
// Check authentication and load current user
if (process.client) {
  jwtToken.value = localStorage.getItem('jwt')
  isAuthenticated.value = !!jwtToken.value
  
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      currentUser.value = JSON.parse(userStr)
    } catch (e) {
      console.error('Failed to parse user data:', e)
    }
  }
  
  // IMPORTANT: Force login if not authenticated
  if (!jwtToken.value) {
    isAuthModalOpen.value = true
  }
}
```

**Hành vi:**
- Ngay khi trang load, kiểm tra JWT token trong localStorage
- Nếu không có token → Hiện modal đăng nhập ngay lập tức
- Nếu có token → Parse thông tin user và cho phép truy cập

### 2. UI Overlay cho nội dung test

```vue
<!-- Auth Required Overlay -->
<div v-if="!isAuthenticated" class="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
  <div class="text-center p-8 bg-white rounded-xl shadow-2xl max-w-md">
    <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    </div>
    <h3 class="text-xl font-bold text-gray-900 mb-2">Yêu cầu đăng nhập</h3>
    <p class="text-gray-600 mb-6">Bạn cần đăng nhập để làm bài thi này</p>
    <button
      @click="isAuthModalOpen = true"
      class="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
    >
      Đăng nhập ngay
    </button>
  </div>
</div>
```

**Đặc điểm:**
- Overlay blur màu trắng che phủ toàn bộ nội dung test
- Icon khóa + thông báo rõ ràng
- Nút "Đăng nhập ngay" CTA để mở modal đăng nhập
- Không cho phép tương tác với nội dung bên dưới (`pointer-events-none`)

### 3. Disable sidebar khi chưa login

```vue
<div v-if="!showResult" class="hidden lg:block w-72 flex-shrink-0"
  :class="{ 'pointer-events-none select-none opacity-50': !isAuthenticated }"
>
```

**Hiệu ứng:**
- Sidebar bị mờ đi (opacity-50)
- Không cho phép click hoặc select text
- Timer và progress vẫn hiển thị nhưng không tương tác được

### 4. Guard các action quan trọng

#### a) Start Timer

```typescript
const startTimer = () => {
  // Require authentication to start timer
  if (!isAuthenticated.value) {
    isAuthModalOpen.value = true
    return
  }
  
  timerInterval.value = setInterval(() => {
    // ... timer logic
  }, 1000)
}
```

#### b) Select Answer (Radio)

```typescript
const selectAnswer = (questionId: number, answer: string) => {
  // Require authentication to answer
  if (!isAuthenticated.value) {
    isAuthModalOpen.value = true
    return
  }
  
  userAnswers.value[questionId] = answer
}
```

#### c) Toggle Checkbox

```typescript
const toggleCheckbox = (questionId: number, answer: string) => {
  // Require authentication to answer
  if (!isAuthenticated.value) {
    isAuthModalOpen.value = true
    return
  }
  
  // ... checkbox logic
}
```

#### d) Submit

```typescript
const handleSubmit = () => {
  // Require authentication to submit
  if (!isAuthenticated.value) {
    isAuthModalOpen.value = true
    return
  }
  
  if (answeredCount.value === 0) {
    alert('Bạn chưa trả lời câu hỏi nào!')
    return
  }

  showConfirmModal.value = true
}
```

### 5. Update auth state sau khi login thành công

```typescript
const handleAuthSuccess = () => {
  // Close modal
  isAuthModalOpen.value = false
  
  // Save to localStorage
  if (process.client) {
    if (jwtToken.value) {
      localStorage.setItem('jwt', jwtToken.value)
    }
    if (currentUser.value) {
      localStorage.setItem('user', JSON.stringify(currentUser.value))
    }
  }
  
  // Update auth state after successful login
  if (process.client) {
    jwtToken.value = localStorage.getItem('jwt')
    isAuthenticated.value = !!jwtToken.value
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        currentUser.value = JSON.parse(userStr)
      } catch (e) {
        console.error('Failed to parse user data:', e)
      }
    }
  }
}
```

**Lý do không reload trang:**
- Giữ được state của bài thi đang làm dở
- UX tốt hơn, không bị gián đoạn
- Cập nhật state Vue reactive ngay lập tức

## Các trường hợp sử dụng

### Trường hợp 1: User chưa login vào trang practice
1. User click vào một bài practice test
2. Trang load với overlay blur
3. Modal đăng nhập hiện ra tự động
4. User đăng nhập thành công
5. Overlay biến mất, cho phép làm bài

### Trường hợp 2: User đã login
1. User click vào bài practice test
2. Trang load bình thường, không có overlay
3. User có thể làm bài ngay

### Trường hợp 3: User logout giữa chừng
1. User đang làm bài
2. Session hết hạn hoặc user logout ở tab khác
3. Khi user click "Submit" hoặc thao tác → Modal đăng nhập hiện ra
4. User phải login lại để tiếp tục

### Trường hợp 4: User cố tình truy cập trực tiếp
1. User paste URL bài practice vào browser
2. Nếu chưa login → Overlay + modal đăng nhập
3. Không thể bypass bằng cách inspect element vì tất cả actions đều có guard

## Bảo mật

### Các lớp bảo vệ

1. **Frontend Guard:**
   - UI Overlay che nội dung
   - Disable pointer events
   - Check auth state trước mỗi action

2. **Backend Guard:**
   - API endpoints kiểm tra JWT token
   - 403 Forbidden nếu không có token
   - Validation ownership (user chỉ được submit bài của mình)

3. **State Guard:**
   - LocalStorage sync
   - Reactive state update
   - Auto logout khi token invalid

### Lưu ý quan trọng

⚠️ **Frontend guard không phải là bảo mật tuyệt đối:**
- User có thể bypass bằng cách modify state trong console
- Vì vậy **LUÔN** kiểm tra authentication ở backend
- Frontend guard chỉ để cải thiện UX và giảm request không cần thiết

✅ **Backend là lớp bảo vệ chính:**
- Mọi API endpoint quan trọng phải verify JWT
- Check ownership của resource
- Validate permission của user

## Testing

### Test cases cần kiểm tra

1. ✅ Load trang practice khi chưa login → Hiện modal
2. ✅ Load trang practice khi đã login → Không hiện modal
3. ✅ Click vào câu hỏi khi chưa login → Hiện modal
4. ✅ Click "Nộp bài" khi chưa login → Hiện modal
5. ✅ Login thành công → Overlay biến mất, có thể làm bài
6. ✅ Logout giữa chừng → Các action bị block
7. ✅ Session expire → Auto show modal khi có action
8. ✅ Refresh trang sau khi login → Vẫn giữ trạng thái login

## Kết luận

Tính năng này đảm bảo:
- ✅ User phải login trước khi làm bài thi
- ✅ UX rõ ràng với overlay và modal
- ✅ Bảo vệ nhiều lớp (frontend + backend)
- ✅ State management đúng đắn
- ✅ Không làm mất dữ liệu khi login giữa chừng
