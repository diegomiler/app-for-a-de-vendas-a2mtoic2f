import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import useMainStore from '@/stores/main'
import { Link } from 'react-router-dom'
import { ArrowRight, DollarSign, Users, RefreshCw, ShoppingBag } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Index() {
  const { orders, clients } = useMainStore()

  const today = new Date().toDateString()

  const todayOrders = orders.filter((o) => new Date(o.date).toDateString() === today)
  const todaySales = todayOrders.reduce((acc, curr) => acc + curr.total, 0)

  const todayClients = clients.filter((c) => new Date(c.createdAt).toDateString() === today)

  const pendingCount =
    clients.filter((c) => c.status === 'pending').length +
    orders.filter((o) => o.status === 'pending').length

  // Generate chart data (last 7 days)
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dayStr = d.toDateString()

    const dayTotal = orders
      .filter((o) => new Date(o.date).toDateString() === dayStr)
      .reduce((acc, curr) => acc + curr.total, 0)

    return {
      name: format(d, 'EEE', { locale: ptBR }),
      total: dayTotal,
    }
  })

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="space-y-6">
      {/* Quick Actions (Mobile emphasis) */}
      <div className="grid grid-cols-2 gap-4 md:hidden mb-6">
        <Link to="/novo-pedido">
          <Button className="w-full h-24 flex-col gap-2 shadow-sm rounded-xl" variant="default">
            <ShoppingBag size={28} />
            <span className="font-semibold text-base">Novo Pedido</span>
          </Button>
        </Link>
        <Link to="/clientes">
          <Button
            className="w-full h-24 flex-col gap-2 shadow-sm rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90"
            variant="outline"
          >
            <Users size={28} />
            <span className="font-semibold text-base">Novo Cliente</span>
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas de Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(todaySales)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {todayOrders.length} pedido(s) realizado(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Clientes (Hoje)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayClients.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Adicionados recentemente</p>
          </CardContent>
        </Card>

        <Card className={pendingCount > 0 ? 'border-destructive border-2 bg-destructive/5' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendências de Sincronização</CardTitle>
            <RefreshCw
              className={`h-4 w-4 ${pendingCount > 0 ? 'text-destructive animate-spin-slow' : 'text-muted-foreground'}`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount} registros</div>
            {pendingCount > 0 ? (
              <Link
                to="/sincronizacao"
                className="text-xs text-destructive hover:underline font-medium mt-1 inline-flex items-center gap-1"
              >
                Ver detalhes <ArrowRight size={12} />
              </Link>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">Tudo atualizado</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Visão Geral de Vendas</CardTitle>
          </CardHeader>
          <CardContent className="pl-0 pr-4">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    tickFormatter={(value) => `R$${value}`}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Total']}
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  />
                  <Bar
                    dataKey="total"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Últimos Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length > 0 ? (
              <div className="space-y-6">
                {orders.slice(0, 4).map((order) => {
                  const client = clients.find((c) => c.id === order.clientId)
                  return (
                    <div key={order.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {client?.name || 'Cliente Removido'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="font-medium text-sm">{formatCurrency(order.total)}</div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <ShoppingBag className="mb-2 h-8 w-8 opacity-20" />
                <p>Nenhum pedido realizado</p>
              </div>
            )}
            {orders.length > 4 && (
              <Button variant="link" className="w-full mt-4" asChild>
                <Link to="/pedidos">Ver todos os pedidos</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
