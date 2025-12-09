export default defineNuxtPlugin(async () => {
  const { fetchGlobalConfig } = useGlobal()
  
  // Load global config khi app khởi động
  if (process.client) {
    await fetchGlobalConfig()
  }
})
