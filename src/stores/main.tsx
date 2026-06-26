import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react'
import { Client, Product, Order, SyncStatus } from '@/lib/types'
import { toast } from 'sonner'

interface MainStore {
  clients: Client[]
  products: Product[]
  orders: Order[]
  addClient: (client: Omit<Client, 'id' | 'status' | 'createdAt'>) => void
  updateClient: (id: string, client: Partial<Client>) => void
  deleteClient: (id: string) => void
  addOrder: (order: Omit<Order, 'id' | 'status' | 'date'>) => void
  syncData: () => Promise<void>
  isSyncing: boolean
}

const mockProducts: Product[] = [
  {
    id: 'p1',
    code: 'PROD-001',
    name: 'Notebook Pro 15"',
    description: 'Notebook de alta performance para profissionais.',
    price: 4500.0,
    stock: 12,
    image: 'https://img.usecurling.com/p/400/400?q=laptop',
  },
  {
    id: 'p2',
    code: 'PROD-002',
    name: 'Smartphone Z Alpha',
    description: 'Último lançamento com câmera de 108MP.',
    price: 3200.0,
    stock: 45,
    image: 'https://img.usecurling.com/p/400/400?q=smartphone',
  },
  {
    id: 'p3',
    code: 'PROD-003',
    name: 'Fone de Ouvido Noise Cancelling',
    description: 'Isolamento acústico premium.',
    price: 850.0,
    stock: 30,
    image: 'https://img.usecurling.com/p/400/400?q=headphones',
  },
  {
    id: 'p4',
    code: 'PROD-004',
    name: 'Teclado Mecânico RGB',
    description: 'Switches blue, ideal para digitação e jogos.',
    price: 420.0,
    stock: 15,
    image: 'https://img.usecurling.com/p/400/400?q=keyboard',
  },
  {
    id: 'p5',
    code: 'PROD-005',
    name: 'Mouse Wireless Ergonômico',
    description: 'Design vertical para evitar LER.',
    price: 150.0,
    stock: 50,
    image: 'https://img.usecurling.com/p/400/400?q=mouse',
  },
  {
    id: 'p6',
    code: 'PROD-006',
    name: 'Monitor Ultrawide 34"',
    description: 'Multitarefa sem limites.',
    price: 2800.0,
    stock: 8,
    image: 'https://img.usecurling.com/p/400/400?q=monitor',
  },
  {
    id: 'p7',
    code: 'PROD-007',
    name: 'Tablet Pro 11"',
    description: 'Para criativos em movimento.',
    price: 3100.0,
    stock: 22,
    image: 'https://img.usecurling.com/p/400/400?q=tablet',
  },
  {
    id: 'p8',
    code: 'PROD-008',
    name: 'Smartwatch Fitness',
    description: 'Monitoramento cardíaco e GPS integrado.',
    price: 900.0,
    stock: 40,
    image: 'https://img.usecurling.com/p/400/400?q=smartwatch',
  },
  {
    id: 'p9',
    code: 'PROD-009',
    name: 'Câmera Mirrorless 4K',
    description: 'Qualidade profissional em tamanho compacto.',
    price: 5600.0,
    stock: 5,
    image: 'https://img.usecurling.com/p/400/400?q=camera',
  },
  {
    id: 'p10',
    code: 'PROD-010',
    name: 'Impressora Multifuncional Eco',
    description: 'Tanque de tinta de alto rendimento.',
    price: 1100.0,
    stock: 18,
    image: 'https://img.usecurling.com/p/400/400?q=printer',
  },
]

const mockClients: Client[] = [
  {
    id: 'c1',
    name: 'Empresa Alpha Ltda',
    document: '12.345.678/0001-90',
    email: 'contato@alpha.com',
    phone: '(11) 98765-4321',
    address: 'Rua Principal, 100 - São Paulo',
    status: 'synced',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'c2',
    name: 'João Silva',
    document: '123.456.789-00',
    email: 'joao.silva@email.com',
    phone: '(21) 99999-8888',
    address: 'Av. Atlântica, 500 - Rio de Janeiro',
    status: 'synced',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
]

const mockOrders: Order[] = [
  {
    id: 'o1',
    clientId: 'c1',
    items: [{ productId: 'p1', quantity: 2, unitPrice: 4500 }],
    total: 9000,
    date: new Date(Date.now() - 86400000).toISOString(),
    status: 'synced',
  },
]

const AppContext = createContext<MainStore | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize from LocalStorage
  useEffect(() => {
    const storedClients = localStorage.getItem('sfa_clients')
    const storedOrders = localStorage.getItem('sfa_orders')

    if (storedClients) {
      setClients(JSON.parse(storedClients))
    } else {
      setClients(mockClients)
      localStorage.setItem('sfa_clients', JSON.stringify(mockClients))
    }

    if (storedOrders) {
      setOrders(JSON.parse(storedOrders))
    } else {
      setOrders(mockOrders)
      localStorage.setItem('sfa_orders', JSON.stringify(mockOrders))
    }

    setProducts(mockProducts) // Static catalog for this demo
    setIsInitialized(true)
  }, [])

  // Sync to LocalStorage on change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('sfa_clients', JSON.stringify(clients))
    }
  }, [clients, isInitialized])

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('sfa_orders', JSON.stringify(orders))
    }
  }, [orders, isInitialized])

  const addClient = useCallback((clientData: Omit<Client, 'id' | 'status' | 'createdAt'>) => {
    const newClient: Client = {
      ...clientData,
      id: crypto.randomUUID(),
      status: navigator.onLine ? 'synced' : 'pending',
      createdAt: new Date().toISOString(),
    }
    setClients((prev) => [newClient, ...prev])
    toast.success('Cliente cadastrado com sucesso!')
  }, [])

  const updateClient = useCallback((id: string, clientData: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...clientData, status: 'pending' } : c)),
    )
    toast.success('Cliente atualizado!')
  }, [])

  const deleteClient = useCallback((id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id))
    toast.success('Cliente removido!')
  }, [])

  const addOrder = useCallback((orderData: Omit<Order, 'id' | 'status' | 'date'>) => {
    const newOrder: Order = {
      ...orderData,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      status: navigator.onLine ? 'synced' : 'pending',
    }
    setOrders((prev) => [newOrder, ...prev])
    toast.success('Pedido finalizado com sucesso!')
  }, [])

  const syncData = useCallback(async () => {
    if (!navigator.onLine) {
      toast.error('Sem conexão. Impossível sincronizar no momento.')
      return
    }

    setIsSyncing(true)

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setClients((prev) => prev.map((c) => ({ ...c, status: 'synced' })))
    setOrders((prev) => prev.map((o) => ({ ...o, status: 'synced' })))

    setIsSyncing(false)
    toast.success('Sincronização concluída com sucesso!')
  }, [])

  // Background auto-sync
  useEffect(() => {
    const interval = setInterval(
      () => {
        const hasPending =
          clients.some((c) => c.status === 'pending') || orders.some((o) => o.status === 'pending')
        if (navigator.onLine && hasPending && !isSyncing) {
          syncData()
        }
      },
      5 * 60 * 1000,
    ) // 5 minutes

    return () => clearInterval(interval)
  }, [clients, orders, isSyncing, syncData])

  if (!isInitialized) return null // Prevent UI flicker

  return (
    <AppContext.Provider
      value={{
        clients,
        products,
        orders,
        addClient,
        updateClient,
        deleteClient,
        addOrder,
        syncData,
        isSyncing,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export default function useMainStore() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useMainStore must be used within an AppProvider')
  }
  return context
}
