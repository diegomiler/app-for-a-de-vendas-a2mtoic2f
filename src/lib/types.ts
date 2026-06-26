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

export interface DBCliente {
  id: string
  nome: string
  telefone: string
  email: string
  endereco: string
  cpf_cnpj: string
  data_cadastro: string
  sincronizado: boolean
}

export interface DBProduto {
  id: string
  codigo: string
  nome: string
  descricao: string
  preco: number
  foto_url: string
  sincronizado: boolean
  estoque?: number
}

export interface DBPedido {
  id: string
  cliente_id: string
  data: string
  valor_total: number
  status: 'pendente' | 'sincronizado'
  sincronizado: boolean
}

export interface DBItemPedido {
  id: string
  pedido_id: string
  produto_id: string
  quantidade: number
  preco_unitario: number
  subtotal: number
}
