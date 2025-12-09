import axios from 'axios'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase.replace('/api', '')
  
  const body = await readBody(event)
  const { fullName, email, password, phone, classId } = body
  
  // Validation
  if (!fullName || !email || !password) {
    return {
      status: 'error',
      message: 'Họ tên, Email và Mật khẩu là bắt buộc'
    }
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return {
      status: 'error',
      message: 'Email không hợp lệ'
    }
  }

  // Validate password length
  if (password.length < 6) {
    return {
      status: 'error',
      message: 'Mật khẩu phải có ít nhất 6 ký tự'
    }
  }
  
  try {
    // Call Strapi register API
    const response = await axios.post(`${apiBase}/api/auth/local/register`, {
      username: fullName, // Use fullName as username
      email: email,
      password: password
    })

    // Store user data in session/cookie if needed
    const user = response.data.user
    const jwt = response.data.jwt

    return {
      status: 'ok',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: fullName,
          phone: phone,
          classId: classId
        },
        jwt: jwt
      },
      message: 'Đăng ký thành công!'
    }
  } catch (error: any) {
    console.error('Registration error:', error.response?.data || error.message)
    
    const errorMessage = error.response?.data?.error?.message || 'Đăng ký thất bại'
    
    // Handle specific error cases
    if (errorMessage.includes('already taken') || errorMessage.includes('Email')) {
      return {
        status: 'error',
        message: 'Email này đã được đăng ký'
      }
    }
    
    return {
      status: 'error',
      message: errorMessage
    }
  }
})
