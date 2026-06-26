import { useState, useMemo } from 'react'
import useMainStore from '@/stores/main'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Search,
  ShoppingCart,
  Trash2,
  Check,
  UserPlus,
  Package,
  ArrowRight,
  Minus,
  Plus,
  CheckCircle2,
} from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useNavigate } from 'react-router-dom'

export default function NewOrder() {
  const { clients, products, addOrder } = useMainStore()
  const navigate = useNavigate()

  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [searchProduct, setSearchProduct] = useState('')
  const [cart, setCart] = useState<{ productId: string; quantity: number; unitPrice: number }[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [step, setStep] = useState<1 | 2>(1) // 1: Select Client, 2: Add Products

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0)
  }, [cart])

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0)

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
      p.code.toLowerCase().includes(searchProduct.toLowerCase()),
  )

  const handleAddToCart = (product: (typeof products)[0]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id)
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...prev, { productId: product.id, quantity: 1, unitPrice: product.price }]
    })
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQ = Math.max(0, item.quantity + delta)
            return { ...item, quantity: newQ }
          }
          return item
        })
        .filter((item) => item.quantity > 0),
    )
  }

  const finishOrder = () => {
    if (!selectedClientId || cart.length === 0) return
    addOrder({
      clientId: selectedClientId,
      items: cart,
      total: cartTotal,
    })
    navigate('/pedidos')
  }

  const CartList = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60 space-y-2">
            <ShoppingCart size={48} />
            <p>O carrinho está vazio</p>
          </div>
        ) : (
          cart.map((item) => {
            const product = products.find((p) => p.id === item.productId)
            if (!product) return null
            return (
              <div key={item.productId} className="flex gap-3 bg-muted/30 p-3 rounded-lg border">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 rounded object-cover"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <p className="text-sm font-medium line-clamp-2 leading-tight">{product.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-primary">{formatCurrency(item.unitPrice)}</span>
                    <div className="flex items-center gap-2 bg-background border rounded-md h-8">
                      <button
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="px-2 h-full text-muted-foreground hover:text-foreground"
                      >
                        {item.quantity === 1 ? (
                          <Trash2 size={14} className="text-destructive" />
                        ) : (
                          <Minus size={14} />
                        )}
                      </button>
                      <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="px-2 h-full text-muted-foreground hover:text-foreground"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="pt-4 mt-4 border-t space-y-4">
        <div className="flex justify-between items-center text-lg">
          <span className="text-muted-foreground">Total:</span>
          <span className="font-bold text-2xl text-primary">{formatCurrency(cartTotal)}</span>
        </div>
        <Button
          className="w-full py-6 text-lg rounded-xl shadow-lg"
          disabled={cart.length === 0 || !selectedClientId}
          onClick={finishOrder}
        >
          Finalizar Pedido <CheckCircle2 className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-6 -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8 overflow-hidden bg-muted/10">
      {/* Main Form Area */}
      <div className="flex-1 flex flex-col overflow-hidden max-w-5xl mx-auto w-full">
        {/* Step Indicator */}
        <div className="flex items-center mb-6 px-2">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            1
          </div>
          <div className={`h-1 flex-1 mx-2 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            2
          </div>
        </div>

        {step === 1 && (
          <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full animate-fade-in">
            <Card className="shadow-lg border-primary/20">
              <CardContent className="pt-6 space-y-6">
                <div className="text-center space-y-2">
                  <UserPlus className="w-12 h-12 mx-auto text-primary opacity-80" />
                  <h2 className="text-2xl font-bold">Selecionar Cliente</h2>
                  <p className="text-muted-foreground text-sm">Para quem é este pedido?</p>
                </div>

                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger className="h-14 text-lg bg-background">
                    <SelectValue placeholder="Selecione um cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}{' '}
                        <span className="text-muted-foreground text-sm ml-2">
                          {client.document}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  className="w-full h-12 text-lg"
                  disabled={!selectedClientId}
                  onClick={() => setStep(2)}
                >
                  Continuar <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">Adicionar Produtos</h2>
                <p className="text-sm text-muted-foreground">
                  Cliente:{' '}
                  <span className="font-medium text-foreground">
                    {clients.find((c) => c.id === selectedClientId)?.name}
                  </span>
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                Trocar Cliente
              </Button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar produtos..."
                className="pl-9 h-12 bg-background shadow-sm"
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
              />
            </div>

            <ScrollArea className="flex-1 -mx-2 px-2">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 pb-24 md:pb-4">
                {filteredProducts.map((product) => {
                  const qtyInCart = cart.find((i) => i.productId === product.id)?.quantity || 0
                  return (
                    <Card
                      key={product.id}
                      className="overflow-hidden flex flex-col bg-background relative border-muted-foreground/20"
                    >
                      {qtyInCart > 0 && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10 shadow-md">
                          {qtyInCart}
                        </div>
                      )}
                      <div className="aspect-[4/3] bg-muted overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3 flex-1 flex flex-col">
                        <p className="text-xs text-muted-foreground truncate">{product.code}</p>
                        <h3 className="font-medium text-sm leading-tight line-clamp-2 mt-1 mb-2">
                          {product.name}
                        </h3>
                        <div className="mt-auto flex items-center justify-between">
                          <span className="font-bold text-primary">
                            {formatCurrency(product.price)}
                          </span>
                          <Button
                            size="sm"
                            variant={qtyInCart > 0 ? 'secondary' : 'outline'}
                            className="h-8 px-2"
                            onClick={() => handleAddToCart(product)}
                          >
                            <Plus size={16} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Desktop Cart Sidebar */}
      {step === 2 && (
        <div className="hidden md:flex flex-col w-[350px] lg:w-[400px] bg-card border-l rounded-l-2xl shadow-2xl p-6 relative">
          <div className="flex items-center gap-2 mb-6 text-xl font-bold">
            <ShoppingCart className="text-primary" />
            <h2>Resumo do Pedido</h2>
          </div>
          <CartList />
        </div>
      )}

      {/* Mobile Cart Floating Action */}
      {step === 2 && (
        <div className="md:hidden fixed bottom-20 left-4 right-4 z-50">
          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
              <Button
                className="w-full h-14 rounded-2xl shadow-xl flex justify-between items-center px-6"
                size="lg"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <ShoppingCart />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                        {cartItemCount}
                      </span>
                    )}
                  </div>
                  <span className="font-semibold">Ver Carrinho</span>
                </div>
                <span className="font-bold text-lg">{formatCurrency(cartTotal)}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl flex flex-col pt-8">
              <SheetHeader className="mb-4">
                <SheetTitle className="text-left text-2xl font-bold flex items-center gap-2">
                  <Package className="text-primary" /> Seu Pedido
                </SheetTitle>
              </SheetHeader>
              <CartList />
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  )
}
