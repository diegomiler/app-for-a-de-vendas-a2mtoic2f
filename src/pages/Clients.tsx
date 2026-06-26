import { useState } from 'react'
import useMainStore from '@/stores/main'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, MapPin, Phone, Mail, MoreVertical, Edit, Trash2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { ScrollArea } from '@/components/ui/scroll-area'

const clientSchema = z.object({
  name: z.string().min(3, 'Nome muito curto'),
  document: z.string().min(11, 'Documento inválido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  address: z.string().min(5, 'Endereço muito curto'),
})

type ClientFormValues = z.infer<typeof clientSchema>

export default function Clients() {
  const { clients, addClient, deleteClient, updateClient } = useMainStore()
  const [search, setSearch] = useState('')
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<string | null>(null)

  const filteredClients = clients
    .filter(
      (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.document.includes(search),
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      document: '',
      email: '',
      phone: '',
      address: '',
    },
  })

  const onSubmit = (data: ClientFormValues) => {
    if (editingClient) {
      updateClient(editingClient, data)
    } else {
      addClient(data)
    }
    setIsSheetOpen(false)
    form.reset()
    setEditingClient(null)
  }

  const handleEdit = (client: any) => {
    setEditingClient(client.id)
    form.reset({
      name: client.name,
      document: client.document,
      email: client.email,
      phone: client.phone,
      address: client.address,
    })
    setIsSheetOpen(true)
  }

  const handleOpenNew = () => {
    setEditingClient(null)
    form.reset({ name: '', document: '', email: '', phone: '', address: '' })
    setIsSheetOpen(true)
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nome ou CPF/CNPJ..."
            className="pl-9 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Button onClick={handleOpenNew} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" /> Novo Cliente
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
        {filteredClients.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground flex flex-col items-center">
            <Users className="h-12 w-12 mb-4 opacity-20" />
            <p>Nenhum cliente encontrado.</p>
          </div>
        ) : (
          filteredClients.map((client) => (
            <Card key={client.id} className="overflow-hidden flex flex-col animate-slide-up">
              <div className="p-5 flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-1" title={client.name}>
                      {client.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{client.document}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="-mr-2 -mt-2 h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(client)}>
                        <Edit className="h-4 w-4 mr-2" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteClient(client.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="line-clamp-2">{client.address}</span>
                  </div>
                </div>
              </div>
              <div className="bg-muted/50 px-5 py-3 border-t flex justify-between items-center text-xs">
                <span className="text-muted-foreground">
                  Cadastrado em {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                </span>
                <Badge
                  variant={client.status === 'synced' ? 'secondary' : 'outline'}
                  className={
                    client.status === 'pending'
                      ? 'border-destructive text-destructive'
                      : 'bg-secondary text-secondary-foreground'
                  }
                >
                  {client.status === 'synced' ? 'Sincronizado' : 'Pendente'}
                </Badge>
              </div>
            </Card>
          ))
        )}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
          <SheetHeader className="p-6 border-b">
            <SheetTitle>{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</SheetTitle>
            <SheetDescription>
              Preencha os dados do cliente. As informações serão salvas localmente caso esteja
              offline.
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo / Razão Social</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: João da Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="document"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF / CNPJ</FormLabel>
                      <FormControl>
                        <Input placeholder="Apenas números" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 00000-0000" type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input placeholder="contato@email.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua, Número, Bairro, Cidade - UF" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4 sticky bottom-0 bg-background pb-4">
                  <Button type="submit" className="w-full">
                    {editingClient ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                  </Button>
                </div>
              </form>
            </Form>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  )
}
