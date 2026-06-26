import { Outlet, Link, useLocation } from 'react-router-dom'
import { useOnline } from '@/hooks/use-online'
import useMainStore from '@/stores/main'
import {
  WifiOff,
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  RefreshCw,
  PlusCircle,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { useState } from 'react'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/clientes', label: 'Clientes', icon: Users },
  { path: '/produtos', label: 'Produtos', icon: Package },
  { path: '/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { path: '/sincronizacao', label: 'Sincronização', icon: RefreshCw },
]

export default function Layout() {
  const isOnline = useOnline()
  const location = useLocation()
  const { clients, orders } = useMainStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const pendingCount =
    clients.filter((c) => c.status === 'pending').length +
    orders.filter((o) => o.status === 'pending').length

  const currentRouteName =
    navItems.find((item) => item.path === location.pathname)?.label || 'App Força de Vendas'

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card fixed inset-y-0 z-20">
        <div className="p-6 flex items-center gap-3 border-b">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <Package size={24} />
          </div>
          <span className="font-bold text-lg text-foreground">Skip Vendas</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 gap-1 flex flex-col">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <div
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-md transition-colors',
                  location.pathname === item.path
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
                {item.path === '/sincronizacao' && pendingCount > 0 && (
                  <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:ml-64 min-h-screen pb-16 md:pb-0">
        {/* Offline Banner */}
        {!isOnline && (
          <div className="bg-destructive text-destructive-foreground px-4 py-2 text-sm flex items-center justify-center gap-2 font-medium z-50 sticky top-0 w-full animate-fade-in-down">
            <WifiOff size={16} />
            Modo Offline. As alterações serão salvas localmente.
          </div>
        )}

        {/* Header */}
        <header
          className={cn(
            'sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b flex items-center justify-between px-4 h-16',
            !isOnline && 'top-9',
          )}
        >
          <div className="flex items-center gap-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
                <SheetDescription className="sr-only">
                  Navegue pelas páginas do aplicativo
                </SheetDescription>
                <div className="p-6 flex items-center gap-3 border-b">
                  <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                    <Package size={24} />
                  </div>
                  <span className="font-bold text-lg">Skip Vendas</span>
                </div>
                <nav className="p-3 gap-1 flex flex-col">
                  {navItems.map((item) => (
                    <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                      <div
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-md transition-colors',
                          location.pathname === item.path
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                        )}
                      >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                        {item.path === '/sincronizacao' && pendingCount > 0 && (
                          <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                            {pendingCount}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <h1 className="font-semibold text-lg hidden sm:block">{currentRouteName}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                {isOnline ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                )}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            <Link to="/novo-pedido">
              <Button size="sm" className="gap-2">
                <PlusCircle size={16} />
                <span className="hidden sm:inline">Novo Pedido</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in overflow-x-hidden">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-card border-t flex items-center justify-around h-16 z-40 px-2 pb-safe">
        {navItems
          .filter((i) => ['/', '/clientes', '/produtos', '/pedidos'].includes(i.path))
          .map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link key={item.path} to={item.path} className="flex-1">
                <div className="flex flex-col items-center justify-center w-full h-full gap-1">
                  <item.icon
                    size={22}
                    className={cn(
                      'transition-colors',
                      isActive ? 'text-primary' : 'text-muted-foreground',
                    )}
                  />
                  <span
                    className={cn(
                      'text-[10px] font-medium transition-colors',
                      isActive ? 'text-primary' : 'text-muted-foreground',
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            )
          })}
      </nav>
    </div>
  )
}
