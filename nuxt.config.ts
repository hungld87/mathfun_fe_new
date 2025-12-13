export default defineNuxtConfig({
  ssr: true,
  modules: [
    '@pinia/nuxt',
    '@nuxt/image',
    '@nuxtjs/tailwindcss',
    'nuxt-simple-sitemap'
  ],
  nitro: {
    compatibilityDate: '2025-11-30'
  },
  css: [
    '~/assets/css/theme.css',
    '~/assets/css/common.css'
  ],
  app: {
    head: {
      link: [
        {
          rel: 'icon',
          type: 'image/png',
          href: '/favicon.png'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: 'anonymous'
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap'
        }
      ]
    }
  },
  runtimeConfig: {
    public: {
      useMock: process.env.NUXT_PUBLIC_USE_MOCK === 'true',
      apiBase: process.env.NUXT_PUBLIC_API_BASE || ''
    }
  }
})
