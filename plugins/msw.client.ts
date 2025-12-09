export default defineNuxtPlugin(async () => {
  if (process.env.NUXT_PUBLIC_USE_MSW !== 'true') return

  if (process.dev) {
    const { worker } = await import('../mocks/browser/browser')
    await worker.start({ onUnhandledRequest: 'warn' })
    console.log('[MSW] Mock Service Worker started')
  }
})
