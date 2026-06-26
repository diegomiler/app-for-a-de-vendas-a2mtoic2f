import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react'
import { Client, Product, Order, DBCliente, DBProduto, DBPedido, DBItemPedido } from '@/lib/types'
import { toast } from 'sonner'
import * as db from '@/lib/db'
import { apiService } from '@/lib/api'

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

const AppContext = createContext<MainStore | null>(null)

const toDBCliente = (c: Client): DBCliente => ({
  id: c.id,
  nome: c.name,
  telefone: c.phone,
  email: c.email,
  endereco: c.address,
  cpf_cnpj: c.document,
  data_cadastro: c.createdAt,
  sincronizado: c.status === 'synced',
})

const fromDBCliente = (c: DBCliente): Client => ({
  id: c.id,
  name: c.nome,
  phone: c.telefone,
  email: c.email,
  address: c.endereco,
  document: c.cpf_cnpj,
  createdAt: c.data_cadastro,
  status: c.sincronizado ? 'synced' : 'pending',
})

const fromDBProduto = (p: DBProduto): Product => ({
  id: p.id,
  code: p.codigo,
  name: p.nome,
  description: p.descricao,
  price: p.preco,
  stock: p.estoque || 50,
  image: p.foto_url,
})

export function AppProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    let mounted = true
    const init = async () => {
      try {
        await db.openDB()
        const [dbClientes, dbProdutos, dbPedidos, dbItens] = await Promise.all([
          db.getAll<DBCliente>('clientes'),
          db.getAll<DBProduto>('produtos'),
          db.getAll<DBPedido>('pedidos'),
          db.getAll<DBItemPedido>('itens_pedido'),
        ])

        if (!mounted) return

        setClients(dbClientes.map(fromDBCliente))

        let loadedProducts = dbProdutos.map(fromDBProduto)
        if (loadedProducts.length === 0) {
          const mockDBProdutos: DBProduto[] = [
            {
              id: 'p1',
              codigo: 'PROD-001',
              nome: 'Notebook Pro 15"',
              descricao: 'Alta performance.',
              preco: 4500,
              foto_url: 'https://img.usecurling.com/p/400/400?q=laptop',
              sincronizado: true,
              estoque: 12,
            },
            {
              id: 'p2',
              codigo: 'PROD-002',
              nome: 'Smartphone Z Alpha',
              descricao: 'Câmera 108MP.',
              preco: 3200,
              foto_url: 'https://img.usecurling.com/p/400/400?q=smartphone',
              sincronizado: true,
              estoque: 45,
            },
            {
              id: 'p3',
              codigo: 'PROD-003',
              nome: 'Fone Noise Cancelling',
              descricao: 'Isolamento acústico.',
              preco: 850,
              foto_url: 'https://img.usecurling.com/p/400/400?q=headphones',
              sincronizado: true,
              estoque: 30,
            },
            {
              id: 'p4',
              codigo: 'PROD-004',
              nome: 'Teclado Mecânico RGB',
              descricao: 'Switches blue.',
              preco: 420,
              foto_url: 'https://img.usecurling.com/p/400/400?q=keyboard',
              sincronizado: true,
              estoque: 15,
            },
            {
              id: 'p5',
              codigo: 'PROD-005',
              nome: 'Mouse Ergonômico',
              descricao: 'Design vertical.',
              preco: 150,
              foto_url: 'https://img.usecurling.com/p/400/400?q=mouse',
              sincronizado: true,
              estoque: 50,
            },
            {
              id: 'p6',
              codigo: 'PROD-006',
              nome: 'Monitor Ultrawide 34"',
              descricao: 'Multitarefa sem limites.',
              preco: 2800,
              foto_url: 'https://img.usecurling.com/p/400/400?q=monitor',
              sincronizado: true,
              estoque: 8,
            },
            {
              id: 'p7',
              codigo: 'PROD-007',
              nome: 'Tablet Pro 11"',
              descricao: 'Para criativos.',
              preco: 3100,
              foto_url: 'https://img.usecurling.com/p/400/400?q=tablet',
              sincronizado: true,
              estoque: 22,
            },
            {
              id: 'p8',
              codigo: 'PROD-008',
              nome: 'Smartwatch Fitness',
              descricao: 'GPS integrado.',
              preco: 900,
              foto_url: 'https://img.usecurling.com/p/400/400?q=smartwatch',
              sincronizado: true,
              estoque: 40,
            },
            {
              id: 'p9',
              codigo: 'PROD-009',
              nome: 'Câmera Mirrorless 4K',
              descricao: 'Qualidade profissional.',
              preco: 5600,
              foto_url: 'https://img.usecurling.com/p/400/400?q=camera',
              sincronizado: true,
              estoque: 5,
            },
            {
              id: 'p10',
              codigo: 'PROD-010',
              nome: 'Impressora Multifuncional',
              descricao: 'Tanque de tinta.',
              preco: 1100,
              foto_url: 'https://img.usecurling.com/p/400/400?q=printer',
              sincronizado: true,
              estoque: 18,
            },
          ]
          await db.putMultiple('produtos', mockDBProdutos)
          loadedProducts = mockDBProdutos.map(fromDBProduto)
        }
        setProducts(loadedProducts)

        setOrders(
          dbPedidos.map((p) => ({
            id: p.id,
            clientId: p.cliente_id,
            date: p.data,
            total: p.valor_total,
            status: p.sincronizado ? 'synced' : 'pending',
            items: dbItens
              .filter((i) => i.pedido_id === p.id)
              .map((i) => ({
                productId: i.produto_id,
                quantity: i.quantidade,
                unitPrice: i.preco_unitario,
              })),
          })),
        )

        setIsInitialized(true)
      } catch (e) {
        console.error('Falha ao iniciar DB', e)
        setIsInitialized(true) // previne loop infinito de loading se falhar
      }
    }

    init()
    return () => {
      mounted = false
    }
  }, [])

  const addClient = useCallback((clientData: Omit<Client, 'id' | 'status' | 'createdAt'>) => {
    const newClient: Client = {
      ...clientData,
      id: crypto.randomUUID(),
      status: 'pending', // Fica pendente até rodar a sync API
      createdAt: new Date().toISOString(),
    }
    setClients((prev) => [newClient, ...prev])
    db.put('clientes', toDBCliente(newClient)).catch(console.error)
    toast.success('Cliente cadastrado com sucesso!')
  }, [])

  const updateClient = useCallback((id: string, clientData: Partial<Client>) => {
    setClients((prev) => {
      const next = prev.map((c) =>
        c.id === id ? { ...c, ...clientData, status: 'pending' as const } : c,
      )
      const updated = next.find((c) => c.id === id)
      if (updated) db.put('clientes', toDBCliente(updated)).catch(console.error)
      return next
    })
    toast.success('Cliente atualizado!')
  }, [])

  const deleteClient = useCallback((id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id))
    db.remove('clientes', id).catch(console.error)
    toast.success('Cliente removido!')
  }, [])

  const addOrder = useCallback((orderData: Omit<Order, 'id' | 'status' | 'date'>) => {
    const newOrder: Order = {
      ...orderData,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      status: 'pending', // Fica pendente até rodar a sync API
    }
    setOrders((prev) => [newOrder, ...prev])

    const dbPedido: DBPedido = {
      id: newOrder.id,
      cliente_id: newOrder.clientId,
      data: newOrder.date,
      valor_total: newOrder.total,
      status: 'pendente',
      sincronizado: false,
    }
    const dbItens: DBItemPedido[] = newOrder.items.map((i) => ({
      id: crypto.randomUUID(),
      pedido_id: newOrder.id,
      produto_id: i.productId,
      quantidade: i.quantity,
      preco_unitario: i.unitPrice,
      subtotal: i.quantity * i.unitPrice,
    }))

    db.put('pedidos', dbPedido)
      .then(() => db.putMultiple('itens_pedido', dbItens))
      .catch(console.error)

    toast.success('Pedido finalizado com sucesso!')
  }, [])

  const syncData = useCallback(async () => {
    if (!navigator.onLine) {
      toast.error('Sem conexão. Impossível sincronizar no momento.')
      return
    }
    setIsSyncing(true)
    try {
      const pendingClients = clients.filter((c) => c.status === 'pending')
      const pendingOrders = orders.filter((o) => o.status === 'pending')

      for (const c of pendingClients) {
        await apiService.post('/clientes', c)
        const updated = { ...c, status: 'synced' as const }
        await db.put('clientes', toDBCliente(updated))
      }

      for (const o of pendingOrders) {
        await apiService.post('/pedidos', o)
        const dbPedido: DBPedido = {
          id: o.id,
          cliente_id: o.clientId,
          data: o.date,
          valor_total: o.total,
          status: 'sincronizado',
          sincronizado: true,
        }
        await db.put('pedidos', dbPedido)
      }

      setClients((prev) => prev.map((c) => ({ ...c, status: 'synced' })))
      setOrders((prev) => prev.map((o) => ({ ...o, status: 'synced' })))
      toast.success('Sincronização concluída com sucesso!')
    } catch (err) {
      console.error(err)
      toast.error('Erro na sincronização')
    } finally {
      setIsSyncing(false)
    }
  }, [clients, orders])

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
    )
    return () => clearInterval(interval)
  }, [clients, orders, isSyncing, syncData])

  if (!isInitialized) return null

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
  if (!context) throw new Error('useMainStore must be used within AppProvider')
  return context
}
