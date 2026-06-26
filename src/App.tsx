import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppProvider } from '@/stores/main'

import Layout from './components/Layout'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Clients from './pages/Clients'
import Products from './pages/Products'
import Orders from './pages/Orders'
import NewOrder from './pages/NewOrder'
import Sync from './pages/Sync'

const App = () => (
  <AppProvider>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" richColors />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/clientes" element={<Clients />} />
            <Route path="/produtos" element={<Products />} />
            <Route path="/pedidos" element={<Orders />} />
            <Route path="/novo-pedido" element={<NewOrder />} />
            <Route path="/sincronizacao" element={<Sync />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AppProvider>
)

export default App
