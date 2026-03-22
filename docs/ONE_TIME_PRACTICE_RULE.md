# Tính năng: 1 User chỉ được làm 1 Đề thi 1 lần

## Tổng quan

Đây là logic nghiệp vụ quan trọng để đảm bảo tính công bằng và chính xác của hệ thống thi: **Mỗi user chỉ được làm mỗi đề thi 1 lần duy nhất**.

## Luồng hoạt động

### 1. Kiểm tra khi vào trang Practice

```typescript
// Check if user has already submitted this practice
const hasSubmittedBefore = ref(false)
const previousSubmission = ref<any>(null)

const checkPreviousSubmission = async () => {
  if (!isAuthenticated.value || !documentId.value) return
  
  try {
    const headers: any = {}
    if (process.client) {
      const token = localStorage.getItem('jwt')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }
    
    // Gọi API lấy lịch sử làm bài
    const response = await $fetch('/api/practice-scorings/my-history', {
      headers,
      params: {
        practiceDocumentId: documentId.value
      }
    })
    
    // Nếu có submission rồi → Hiện kết quả cũ
    if (response.data && response.data.length > 0) {
      hasSubmittedBefore.value = true
      previousSubmission.value = response.data[0]
      
      // Load previous submission detail to show results
      gradingResult.value = previousSubmission.value
      showResult.value = true
      canLeave.value = true
      showSuccessModal.value = true
      
      // Clear localStorage
      clearStorage()
    }
  } catch (error) {
    console.error('Error checking previous submission:', error)
  }
}
```

### 2. Gọi check ở 2 thời điểm

#### a) Khi component mount (nếu đã login)

```typescript
onMounted(() => {
  // Check if user has submitted this practice before
  if (isAuthenticated.value) {
    checkPreviousSubmission()
  }
  
  loadSavedData()
  if (timeLeft.value > 0 && !hasSubmittedBefore.value) {
    startTimer()
  }
  
  if (process.client) {
    window.addEventListener('beforeunload', handleBeforeUnload)
  }
})
```

#### b) Sau khi login thành công

```typescript
const handleAuthSuccess = async () => {
  isAuthModalOpen.value = false
  
  // Update auth state
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
  
  // Check if user has already submitted this practice
  await checkPreviousSubmission()
  
  // If user hasn't submitted before, allow them to start the test
  if (!hasSubmittedBefore.value) {
    loadSavedData()
    if (timeLeft.value > 0) {
      startTimer()
    }
  }
}
```

## Các trường hợp sử dụng

### Trường hợp 1: User đã làm bài này rồi
1. User login và vào trang practice
2. `checkPreviousSubmission()` được gọi
3. API trả về submission cũ
4. `hasSubmittedBefore.value = true`
5. Hiển thị Result Modal với điểm số cũ
6. **KHÔNG cho phép làm lại**

### Trường hợp 2: User chưa làm bài này
1. User login và vào trang practice
2. `checkPreviousSubmission()` được gọi
3. API trả về empty array (chưa có submission)
4. `hasSubmittedBefore.value = false`
5. Cho phép làm bài như bình thường
6. Timer bắt đầu, có thể trả lời câu hỏi

### Trường hợp 3: User làm dở, logout, rồi login lại
1. User làm dở bài, logout
2. Data được lưu trong localStorage với key chứa email
3. User login lại với cùng account
4. `checkPreviousSubmission()` check → chưa submit
5. `loadSavedData()` load lại progress từ localStorage
6. User tiếp tục làm từ chỗ đang dở

### Trường hợp 4: User cố tình làm lại
1. User đã làm và submit bài rồi
2. Vào lại trang practice
3. `checkPreviousSubmission()` phát hiện đã làm rồi
4. Tự động hiện Result Modal
5. Chỉ có nút "Quay lại danh sách", **KHÔNG** có nút "Làm lại"

## API Backend

### Endpoint: GET /api/practice-scorings/my-history

**Request:**
```
GET /api/practice-scorings/my-history?practiceDocumentId={documentId}
Headers:
  Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "documentId": "abc123",
      "practice": {
        "documentId": "practice_123",
        "title": "Đề thi Toán lớp 10"
      },
      "summary": {
        "totalScore": 85,
        "maxScore": 100,
        "percentage": 85,
        "correctCount": 17,
        "totalQuestions": 20,
        "isPassed": true
      },
      "details": [
        {
          "question": "q1",
          "solution": "42",
          "score": 5,
          "max_score": 5,
          "is_correct": true,
          "correct_answer": "42"
        }
      ],
      "durationtime": 1800,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Empty Response (chưa làm):**
```json
{
  "success": true,
  "data": []
}
```

## Lợi ích

### 1. Công bằng
- ✅ Mọi user đều có cùng số lần làm bài (1 lần)
- ✅ Không ai có thể làm nhiều lần để cải thiện điểm

### 2. Dữ liệu chính xác
- ✅ Điểm số phản ánh đúng năng lực thực tế
- ✅ Không bị méo mó do làm đi làm lại

### 3. Giảm tải server
- ✅ Giảm số lượng submission
- ✅ Tiết kiệm storage

### 4. UX tốt hơn
- ✅ User biết rõ họ đã làm rồi
- ✅ Hiển thị kết quả cũ ngay lập tức
- ✅ Không tốn thời gian làm lại

## Lưu ý quan trọng

### ⚠️ LocalStorage vs Database

**LocalStorage:**
- Chỉ lưu progress (bài đang làm dở)
- Bị clear sau khi submit thành công
- Có thể bị xóa bởi user
- **KHÔNG** dùng để kiểm tra đã làm chưa

**Database (Backend):**
- Lưu submission chính thức
- Là nguồn dữ liệu tin cậy
- **SỬ DỤNG** để kiểm tra đã làm chưa

### ⚠️ Race Condition

Có thể xảy ra race condition nếu:
1. User mở 2 tab cùng lúc
2. Submit ở tab 1
3. Tab 2 vẫn cho làm bài

**Giải pháp:**
- Backend phải validate: 1 user + 1 practice = max 1 submission
- Frontend periodically check (mỗi 30s) xem đã submit chưa

### ⚠️ Refresh Page

Nếu user refresh sau khi đã submit:
- ✅ `checkPreviousSubmission()` sẽ chạy lại
- ✅ Phát hiện đã làm rồi
- ✅ Hiện Result Modal

## Testing

### Test cases cần kiểm tra:

1. ✅ User chưa làm → Cho phép làm bài
2. ✅ User đã làm → Hiện kết quả cũ, không cho làm lại
3. ✅ User làm dở, logout, login lại → Tiếp tục từ chỗ cũ
4. ✅ User làm dở, đổi account → Bắt đầu mới (vì khác user)
5. ✅ User submit xong, refresh → Vẫn hiện kết quả cũ
6. ✅ User submit xong, vào lại → Vẫn hiện kết quả cũ
7. ✅ User cố tình clear localStorage → API vẫn check đúng

## Kết luận

Tính năng "1 user - 1 lần làm bài" đảm bảo:
- ✅ Tính công bằng cho tất cả user
- ✅ Dữ liệu điểm số chính xác
- ✅ UX tốt với thông báo rõ ràng
- ✅ Backend là nguồn dữ liệu tin cậy duy nhất
