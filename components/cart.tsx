"use client"

import type { CartItem, OrderError } from "@/lib/types"
import { CartItemRow } from "./cart-item-row"
import { ShoppingCart, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CartProps {
  items: CartItem[]
  errors: OrderError[]
  total: number
  isSubmitting: boolean
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
  onSubmit: () => void
}

export function Cart({ items, errors, total, isSubmitting, onUpdateQuantity, onRemove, onSubmit }: CartProps) {
  const getError = (productId: string) => errors.find((e) => e.productId === productId)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-6 border-b border-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
          <ShoppingCart className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Carrinho</h2>
        <Badge variant="default" className="ml-auto">
          {items.length} {items.length === 1 ? "item" : "itens"}
        </Badge>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 lg:p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
                <ShoppingCart className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg font-medium">Carrinho vazio</p>
              <p className="text-muted-foreground text-sm">Adicione itens do cardapio</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <CartItemRow
                  key={item.product.id}
                  item={item}
                  error={getError(item.product.id)}
                  onUpdateQuantity={onUpdateQuantity}
                  onRemove={onRemove}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      {items.length > 0 && (
        <div className="border-t border-border p-4 lg:p-6 space-y-4 bg-card">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Total</span>
            <span className="font-bold text-3xl text-primary">R$ {total.toFixed(2).replace(".", ",")}</span>
          </div>

          <Button
            onClick={onSubmit}
            disabled={isSubmitting || items.length === 0}
            size="lg"
            className="w-full h-14 text-lg font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Enviar Pedido
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
