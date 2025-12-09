export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Mock course registration
  // TODO: Replace with real API call
  const { fullName, phone, classId, subjectId, levelId, note } = body
  
  if (!fullName || !phone) {
    return {
      status: 'error',
      message: 'Họ tên và Số điện thoại là bắt buộc'
    }
  }
  
  // Validate phone format
  const phoneRegex = /^[0-9]{10,11}$/
  if (!phoneRegex.test(phone)) {
    return {
      status: 'error',
      message: 'Số điện thoại không hợp lệ (10-11 số)'
    }
  }
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Mock successful registration
  return {
    status: 'ok',
    data: {
      id: Date.now(),
      fullName,
      phone,
      classId,
      subjectId,
      levelId,
      note,
      createdAt: new Date().toISOString()
    },
    message: 'Đăng ký khóa học thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.'
  }
})
