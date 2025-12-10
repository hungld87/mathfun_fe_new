# Practice User Storage - Phân biệt nhiều User trên cùng 1 máy

## Vấn đề
Trước đây, khi lưu trữ dữ liệu bài thi trong localStorage, chỉ sử dụng `documentId` (ID của bài thi) làm key:
```javascript
// CŨ - Có thể bị conflict khi nhiều user dùng chung máy
practice_time_abc123
practice_answers_abc123
practice_start_abc123
```

Điều này gây ra vấn đề:
- Nếu User A làm bài thi, sau đó đăng xuất
- User B đăng nhập và làm cùng bài thi đó
- Dữ liệu của User A sẽ bị ghi đè hoặc nhầm lẫn với User B

## Giải pháp
Thêm **email của user** vào localStorage key để phân biệt:

```javascript
// MỚI - Mỗi user có dữ liệu riêng
practice_time_user1@example.com_abc123
practice_answers_user1@example.com_abc123
practice_start_user1@example.com_abc123

practice_time_user2@example.com_abc123
practice_answers_user2@example.com_abc123
practice_start_user2@example.com_abc123
```

## Những thay đổi đã áp dụng

### 1. File: `pages/practice/[slug].vue`

#### Thêm state `currentUser`:
```javascript
const currentUser = ref<any>(null)

// Load user info from localStorage
if (process.client) {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      currentUser.value = JSON.parse(userStr)
    } catch (e) {
      console.error('Failed to parse user data:', e)
    }
  }
}
```

#### Tạo computed `userEmail`:
```javascript
const userEmail = computed(() => {
  if (!currentUser.value) return 'guest'
  return currentUser.value.email || currentUser.value.id || 'guest'
})
```

#### Cập nhật localStorage keys:
```javascript
// LocalStorage keys sử dụng cả userEmail VÀ documentId
const STORAGE_KEY_TIME = computed(() => 
  `practice_time_${userEmail.value}_${documentId.value}`
)
const STORAGE_KEY_ANSWERS = computed(() => 
  `practice_answers_${userEmail.value}_${documentId.value}`
)
const STORAGE_KEY_START_TIME = computed(() => 
  `practice_start_${userEmail.value}_${documentId.value}`
)
```

#### Cập nhật `handleAuthSuccess`:
```javascript
const handleAuthSuccess = async () => {
  isAuthModalOpen.value = false
  
  // Update current user info after login
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
  
  // Reload để cập nhật header và data với token mới
  window.location.reload()
}
```

### 2. File: `pages/practice/index.vue`

#### Cập nhật hàm `startPractice`:
```javascript
const startPractice = (slug: string, documentId: string) => {
  // Lấy email của user hiện tại
  let userEmail = 'guest'
  if (process.client) {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        userEmail = user.email || user.id || 'guest'
      } catch (e) {
        console.error('Failed to parse user data:', e)
      }
    }
    
    // Xóa localStorage với key có email
    localStorage.removeItem(`practice_time_${userEmail}_${documentId}`)
    localStorage.removeItem(`practice_answers_${userEmail}_${documentId}`)
    localStorage.removeItem(`practice_start_${userEmail}_${documentId}`)
  }
  
  navigateTo(`/practice/${slug}`)
}
```

## Kết quả

✅ **Mỗi user có dữ liệu bài thi riêng biệt**
- User A làm bài thi → dữ liệu lưu với email của A
- User B làm cùng bài thi → dữ liệu lưu với email của B
- Không bị conflict, không bị mất dữ liệu

✅ **User chưa login (guest) vẫn hoạt động bình thường**
- Key sử dụng `guest` thay vì email
- Ví dụ: `practice_time_guest_abc123`

✅ **Xóa dữ liệu cũ khi bắt đầu làm bài mới**
- Khi click nút "Vào thi", xóa đúng localStorage của user hiện tại
- Không ảnh hưởng đến dữ liệu của user khác

## Lưu ý khi test

1. **Test với 1 user:**
   - Đăng nhập với user A
   - Làm một phần bài thi (ví dụ 5/10 câu)
   - Refresh trang → dữ liệu vẫn còn ✓

2. **Test với nhiều user:**
   - Đăng nhập với user A → làm bài thi X đến câu 5
   - Đăng xuất
   - Đăng nhập với user B → làm cùng bài thi X
   - User B sẽ bắt đầu từ đầu (không thấy câu trả lời của A) ✓

3. **Test guest mode:**
   - Không đăng nhập → vào làm bài thi
   - Dữ liệu lưu với key `practice_time_guest_...` ✓

## API Submit cũng đã được cập nhật

File: `pages/practice/[slug].vue` - hàm `confirmSubmit`

Payload gửi lên server bao gồm:
```json
{
  "practiceDocumentId": "abc123xyz456",
  "timeSpent": 1200,
  "answers": [
    {
      "questionDocumentId": "q1_doc_id",
      "answer": "Đáp án câu 1"
    }
  ]
}
```

Server endpoint: `POST /api/practice-scorings/submit`
- Mock mode: trả về kết quả giả với 70% đúng
- Real API mode: forward request tới Strapi backend
