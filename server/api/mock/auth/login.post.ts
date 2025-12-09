import axios from 'axios'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase.replace('/api', '')
  
  const body = await readBody(event)
  const { email, password } = body
  
  // Validation
  if (!email || !password) {
    return {
      status: 'error',
      message: 'Email và mật khẩu là bắt buộc'
    }
  }
  
  try {
    // Call Strapi login API
    const response = await axios.post(`${apiBase}/api/auth/local`, {
      identifier: email, // Strapi uses 'identifier' for email or username
      password: password
    })

    // Get user data and JWT token
    const user = response.data.user
    const jwt = response.data.jwt

    return {
      status: 'ok',
      data: {
        user: {
          id: user.id,
          documentId: user.documentId,
          username: user.username,
          email: user.email,
          confirmed: user.confirmed,
          blocked: user.blocked
        },
        jwt: jwt
      },
      message: 'Đăng nhập thành công!'
    }
  } catch (error: any) {
    console.error('Login error:', error.response?.data || error.message)
    
    const errorMessage = error.response?.data?.error?.message || 'Đăng nhập thất bại'
    
    // Handle specific error cases
    if (errorMessage.includes('Invalid identifier or password')) {
      return {
        status: 'error',
        message: 'Email hoặc mật khẩu không đúng'
      }
    }
    
    return {
      status: 'error',
      message: errorMessage
    }
  }
})
