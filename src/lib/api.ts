const BASE_URL = 'https://meuservidor.com/api'

export const apiService = {
  get: async (path: string) => {
    console.log(`Sincronizando GET ${path}`)
    return Promise.resolve()
  },
  post: async (path: string, data?: any) => {
    console.log(`Sincronizando POST ${path}`)
    return Promise.resolve()
  },
  put: async (path: string, data?: any) => {
    console.log(`Sincronizando PUT ${path}`)
    return Promise.resolve()
  },
  delete: async (path: string) => {
    console.log(`Sincronizando DELETE ${path}`)
    return Promise.resolve()
  },
}
