import useMainStore from '@/stores/main'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Search, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

export default function Orders() {
  const { orders, clients, products } = useMainStore()
  const [search, setSearch] = useState('')

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const filteredOrders = orders
    .filter((o) => {
      const client = clients.find((c) => c.id === o.clientId)
      return client?.name.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search)
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por cliente ou ID do pedido..."
            className="pl-9 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground flex flex-col items-center bg-card rounded-xl border">
            <ShoppingCart className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-lg">Nenhum pedido encontrado.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const client = clients.find((c) => c.id === order.clientId)
            return (
              <Card key={order.id} className="overflow-hidden animate-slide-up">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {client?.name || 'Cliente Removido'}
                        <Badge variant="outline" className="text-xs font-normal">
                          {order.items.length} item(s)
                        </Badge>
                      </h3>
                      <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1">
                        <span>Emissão: {new Date(order.date).toLocaleString('pt-BR')}</span>
                        <span className="font-mono text-xs opacity-70">
                          ID: {order.id.split('-')[0]}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                      <div className="text-xl font-bold text-primary">
                        {formatCurrency(order.total)}
                      </div>
                      <Badge
                        className={
                          order.status === 'pending'
                            ? 'bg-destructive/10 text-destructive border-destructive hover:bg-destructive/20'
                            : 'bg-secondary/10 text-secondary border-secondary hover:bg-secondary/20'
                        }
                        variant="outline"
                      >
                        {order.status === 'synced' ? 'Sincronizado' : 'Pendente de Sincronia'}
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-3 space-y-2 mt-4">
                    {order.items.slice(0, 2).map((item, idx) => {
                      const product = products.find((p) => p.id === item.productId)
                      return (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="truncate pr-4 text-muted-foreground">
                            {item.quantity}x {product?.name || 'Produto Removido'}
                          </span>
                          <span className="font-medium shrink-0">
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      )
                    })}
                    {order.items.length > 2 && (
                      <div className="text-xs text-muted-foreground text-center pt-2 border-t mt-2">
                        + {order.items.length - 2} outro(s) produto(s)
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
