import useMainStore from '@/stores/main'
import { useOnline } from '@/hooks/use-online'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  RefreshCw,
  WifiOff,
  Wifi,
  CheckCircle2,
  AlertTriangle,
  User,
  ShoppingCart,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function Sync() {
  const { clients, orders, syncData, isSyncing } = useMainStore()
  const isOnline = useOnline()

  const pendingClients = clients.filter((c) => c.status === 'pending')
  const pendingOrders = orders.filter((o) => o.status === 'pending')

  const totalPending = pendingClients.length + pendingOrders.length
  const isUpToDate = totalPending === 0

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="border-2 shadow-sm relative overflow-hidden">
        {/* Background decorative element */}
        <div
          className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10 transition-colors duration-1000 ${isUpToDate ? 'bg-secondary' : 'bg-primary'}`}
        />

        <CardContent className="p-6 sm:p-10 flex flex-col items-center text-center space-y-4 relative z-10">
          <div className="relative">
            {isSyncing ? (
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                <RefreshCw className="w-10 h-10 text-primary animate-spin" />
              </div>
            ) : isUpToDate ? (
              <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-secondary" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center relative">
                <RefreshCw className="w-10 h-10 text-destructive" />
                <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground font-bold text-sm w-7 h-7 rounded-full flex items-center justify-center shadow-sm">
                  {totalPending}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold">
              {isSyncing
                ? 'Sincronizando...'
                : isUpToDate
                  ? 'Tudo Atualizado'
                  : 'Alterações Pendentes'}
            </h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {isUpToDate
                ? 'Todos os seus dados locais estão salvos com segurança na nuvem.'
                : 'Você tem registros criados offline que precisam ser enviados para o servidor.'}
            </p>
          </div>

          {!isOnline && (
            <div className="flex items-center gap-2 text-destructive font-medium bg-destructive/10 px-4 py-2 rounded-full text-sm mt-2">
              <WifiOff size={16} /> Sem conexão com a internet
            </div>
          )}

          {isOnline && !isUpToDate && !isSyncing && (
            <div className="flex items-center gap-2 text-secondary font-medium bg-secondary/10 px-4 py-2 rounded-full text-sm mt-2">
              <Wifi size={16} /> Conexão estabilizada
            </div>
          )}

          <Button
            size="lg"
            className="w-full sm:w-auto min-w-[200px] mt-4"
            disabled={isUpToDate || isSyncing || !isOnline}
            onClick={syncData}
          >
            {isSyncing ? 'Enviando dados...' : 'Sincronizar Agora'}
          </Button>
        </CardContent>
      </Card>

      {!isUpToDate && (
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" /> Fila de Sincronização
            </CardTitle>
            <CardDescription>
              Os seguintes registros serão enviados ao servidor na próxima sincronização.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px]">
              <div className="divide-y">
                {pendingClients.map((client) => (
                  <div
                    key={client.id}
                    className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Cliente: {client.name}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        {client.document}
                      </p>
                    </div>
                  </div>
                ))}
                {pendingOrders.map((order) => {
                  const client = clients.find((c) => c.id === order.clientId)
                  return (
                    <div
                      key={order.id}
                      className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="bg-secondary/10 p-2 rounded-lg text-secondary">
                        <ShoppingCart size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          Pedido p/ {client?.name || 'Desconhecido'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {order.items.length} item(s) - R$ {order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
