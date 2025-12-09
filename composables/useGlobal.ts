import type { GlobalConfig } from '~/types'

export const useGlobal = () => {
  // Global state để cache config - phải gọi trong composable function
  const globalConfig = useState<GlobalConfig | null>('globalConfig', () => null)
  const { get } = useApi()

  // Fetch global config nếu chưa có
  const fetchGlobalConfig = async () => {
    if (!globalConfig.value) {
      const data = await get('/global')
      globalConfig.value = data as GlobalConfig
    }
    return globalConfig.value
  }

  return {
    globalConfig,
    fetchGlobalConfig
  }
}
