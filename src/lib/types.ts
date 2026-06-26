export type SyncStatus = 'synced' | 'pending'

export interface Client {
  id: string
  name: string
  document: string // CPF or CNPJ
  email: string
  phone: string
  address: string
  status: SyncStatus
  createdAt: string
}

export interface Product {
  id: string
  code: string
  name: string
  description: string
  price: number
  stock: number
  image: string
}

export interface OrderItem {
  productId: string
  quantity: number
  unitPrice: number
}

export interface Order {
  id: string
  clientId: string
  items: OrderItem[]
  total: number
  date: string
  status: SyncStatus
}
