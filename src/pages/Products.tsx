import { useState } from 'react'
import useMainStore from '@/stores/main'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, PackageOpen, ShoppingCart } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function Products() {
  const { products } = useMainStore()
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<(typeof products)[0] | null>(null)

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()),
  )

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar produtos por nome ou código..."
            className="pl-9 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full py-16 text-center text-muted-foreground flex flex-col items-center">
            <PackageOpen className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-lg">Nenhum produto encontrado.</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors group flex flex-col"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="aspect-square bg-muted relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {product.stock <= 10 && (
                  <Badge
                    variant="destructive"
                    className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5"
                  >
                    Restam {product.stock}
                  </Badge>
                )}
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <p className="text-xs text-muted-foreground mb-1 font-mono">{product.code}</p>
                <h3 className="font-medium text-sm leading-tight line-clamp-2 flex-1 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <div className="mt-3 font-bold text-base text-primary">
                  {formatCurrency(product.price)}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        {selectedProduct && (
          <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
            <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
              <div className="w-full md:w-1/2 bg-muted relative min-h-[250px] md:min-h-full">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="object-cover w-full h-full absolute inset-0"
                />
              </div>
              <div className="w-full md:w-1/2 p-6 flex flex-col">
                <DialogHeader className="text-left mb-4">
                  <Badge className="w-fit mb-2 font-mono" variant="outline">
                    {selectedProduct.code}
                  </Badge>
                  <DialogTitle className="text-2xl leading-tight">
                    {selectedProduct.name}
                  </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 hide-scrollbar">
                  <div className="text-3xl font-bold text-primary mb-6">
                    {formatCurrency(selectedProduct.price)}
                  </div>

                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Descrição</h4>
                      <DialogDescription className="text-sm">
                        {selectedProduct.description}
                      </DialogDescription>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Disponibilidade</h4>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${selectedProduct.stock > 0 ? 'bg-secondary' : 'bg-destructive'}`}
                        />
                        <span className="text-muted-foreground">
                          {selectedProduct.stock > 0
                            ? `${selectedProduct.stock} unidades em estoque`
                            : 'Fora de estoque'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-auto border-t">
                  <Link to={`/novo-pedido`}>
                    <Button className="w-full gap-2" size="lg">
                      <ShoppingCart className="h-5 w-5" />
                      Iniciar Pedido com este item
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
