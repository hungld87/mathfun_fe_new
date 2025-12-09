export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Mock Google login
  // TODO: Replace with real Google OAuth integration
  const { token } = body
  
  if (!token) {
    return {
      status: 'error',
      message: 'Google token is required'
    }
  }
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Mock successful Google login
  return {
    status: 'ok',
    data: {
      user: {
        id: Date.now(),
        email: 'user@gmail.com',
        name: 'Google User',
        avatar: 'https://via.placeholder.com/150'
      },
      token: 'mock-google-jwt-token-' + Date.now()
    },
    message: 'Đăng nhập bằng Google thành công'
  }
})
