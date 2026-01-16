"use client"

import { useState, useMemo, useEffect } from "react"
import { MenuGrid } from "./menu-grid"
import { Cart } from "./cart"
import { ErrorDialog } from "./error-dialog"
import { fetchProducts, createOrder } from "@/lib/api"
import type { CartItem, OrderError, Product } from "@/lib/types"
import { ShoppingCart, Utensils, PanelRightOpen, PanelRightClose, Wifi, WifiOff, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useOfflineQueue } from "@/hooks/use-offline-queue"
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

export function WaiterInterface() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [errors, setErrors] = useState<OrderError[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  const { queue, isOnline, addToQueue, syncErrors, clearSyncErrors } = useOfflineQueue()

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(console.error)
  }, [])


  useEffect(() => {
    if (syncErrors.length > 0) {
      const allErrors = syncErrors.flatMap(s => s.errors)
      setErrors(allErrors)
      setShowErrorDialog(true)
      clearSyncErrors() 
    }
  }, [syncErrors, clearSyncErrors])

  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category))]
    return cats
  }, [products])

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart((prev) => prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item)))
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
    setErrors((prev) => prev.filter((e) => e.productId !== productId))
  }

  const removeErrorItems = () => {
    const errorIds = errors.map((e) => e.productId)
    setCart((prev) => prev.filter((item) => !errorIds.includes(item.product.id)))
    setErrors([])
    setShowErrorDialog(false)
  }

  const submitOrder = async () => {
    if (cart.length === 0) return

    setIsSubmitting(true)
    setErrors([])

    const items = cart.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }))

    const response = await createOrder(items)

    setIsSubmitting(false)

    if (response.success) {
      setCart([])
      alert("Pedido enviado com sucesso!")
    } else if (response.isNetworkError) {
      addToQueue(items)
      setCart([])
      alert("Sem conexão. Pedido salvo na fila e será enviado automaticamente.")
    } else if (response.errors) {
      setErrors(response.errors)
      setShowErrorDialog(true)
    } else if (response.message) {
      alert(response.message)
    }
  }

  const retryWithoutErrors = async () => {
    removeErrorItems()
    setShowErrorDialog(false)
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background">
      <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary">
            <Utensils className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-foreground leading-none">Pedidos</h1>
            <div className="flex items-center gap-1 mt-1">
              {!isOnline ? (
                <span className="text-xs text-destructive flex items-center gap-1 font-medium">
                   <WifiOff className="h-3 w-3" /> Offline
                </span>
              ) : (
                <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
                   <Wifi className="h-3 w-3" /> Online
                </span>
              )}
              {queue.length > 0 && (
                <span className="text-xs text-amber-600 flex items-center gap-1 ml-2 font-medium">
                   <RefreshCw className="h-3 w-3 animate-spin" /> {queue.length} na fila
                </span>
              )}
            </div>
          </div>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="default" size="sm" className="gap-2">
              <ShoppingCart className="h-5 w-5" />
              <Badge variant="secondary" className="bg-primary-foreground text-primary">
                {cartItemCount}
              </Badge>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-[400px] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Carrinho</SheetTitle>
            </SheetHeader>
            <Cart
              items={cart}
              errors={errors}
              total={cartTotal}
              isSubmitting={isSubmitting}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
              onSubmit={submitOrder}
            />
          </SheetContent>
        </Sheet>
      </header>

      {/* Menu Section */}
      <div className={cn("flex-1 overflow-auto transition-all duration-300", sidebarOpen ? "lg:mr-0" : "lg:mr-0")}>
        <div className="hidden lg:flex items-center justify-between p-6 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary">
              <Utensils className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Cardapio</h1>
              <p className="text-sm text-muted-foreground">Selecione os itens do pedido</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {queue.length > 0 && (
                <Badge variant="outline" className="gap-2 border-amber-500 text-amber-600">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  {queue.length} Sincronizando
                </Badge>
              )}
             {!isOnline ? (
               <Badge variant="destructive" className="gap-2">
                 <WifiOff className="h-4 w-4" /> Offline
               </Badge>
             ) : (
               <Badge variant="outline" className="gap-2 text-green-600 border-green-200 bg-green-50">
                 <Wifi className="h-4 w-4" /> Online
               </Badge>
             )}
          </div>
        </div>
        <MenuGrid
          products={products}
          categories={categories}
          onAddToCart={addToCart}
          errorProductIds={errors.map((e) => e.productId)}
        />
      </div>

      <aside
        className={cn(
          "hidden lg:flex flex-col border-l border-border bg-card transition-all duration-300 ease-in-out relative",
          sidebarOpen ? "w-[380px]" : "w-0",
        )}
      >
        {/* Botão de toggle fixo na borda */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={cn(
            "absolute -left-4 top-6 z-50 h-8 w-8 rounded-full border bg-card shadow-md hover:bg-accent",
            "transition-transform duration-300",
          )}
        >
          {sidebarOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
        </Button>

        {/* Conteúdo do carrinho */}
        <div
          className={cn(
            "flex-1 overflow-hidden transition-opacity duration-300",
            sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          <Cart
            items={cart}
            errors={errors}
            total={cartTotal}
            isSubmitting={isSubmitting}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
            onSubmit={submitOrder}
          />
        </div>
      </aside>

      {!sidebarOpen && (
        <Button
          variant="default"
          size="lg"
          onClick={() => setSidebarOpen(true)}
          className="hidden lg:flex fixed bottom-6 right-6 h-14 gap-2 shadow-lg z-50"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="font-semibold">Carrinho</span>
          <Badge variant="secondary" className="bg-primary-foreground text-primary">
            {cartItemCount}
          </Badge>
        </Button>
      )}

      {/* Error Dialog */}
      <ErrorDialog
        open={showErrorDialog}
        errors={errors}
        onClose={() => setShowErrorDialog(false)}
        onRemoveItems={retryWithoutErrors}
      />
    </div>
  )
}
