export const useApi = () => {
  const config = useRuntimeConfig()
  const useMock = config.public.useMock

  async function get(path: string, opts = {}) {
    const url = useMock ? `/api/mock${path}` : config.public.apiBase + path
    const response: any = await $fetch(url, opts)
    // Mock API returns { status, data }, extract data
    return useMock && response?.data ? response.data : response
  }

  async function post(path: string, data: any, opts = {}) {
    const url = useMock ? `/api/mock${path}` : config.public.apiBase + path
    const response: any = await $fetch(url, { method: 'POST', body: data, ...opts })
    // Mock API returns { status, data }, extract data
    return useMock && response?.data ? response.data : response
  }

  return { get, post }
}
