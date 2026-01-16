"use client"

import { useState, useMemo, useEffect } from "react"
import { MenuGrid } from "./menu-grid"
import { Cart } from "./cart"
import { ErrorDialog } from "./error-dialog"
import { fetchProducts, createOrder } from "@/lib/api"
import type { CartItem, OrderError, Product } from "@/lib/types"
import { ShoppingCart, Utensils, PanelRightOpen, PanelRightClose } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function WaiterInterface() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [errors, setErrors] = useState<OrderError[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(console.error)
  }, [])

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
          <h1 className="text-xl font-bold text-foreground">Pedidos</h1>
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
        <div className="hidden lg:flex items-center gap-3 p-6 border-b border-border bg-card">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary">
            <Utensils className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cardapio</h1>
            <p className="text-sm text-muted-foreground">Selecione os itens do pedido</p>
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
