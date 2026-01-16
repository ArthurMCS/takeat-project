"use client"

import type { CartItem, OrderError } from "@/lib/types"
import { Minus, Plus, Trash2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CartItemRowProps {
  item: CartItem
  error?: OrderError
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}

export function CartItemRow({ item, error, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const { product, quantity } = item
  const subtotal = product.price * quantity

  return (
    <Card className={error ? "border-destructive bg-destructive/5" : ""}>
      <CardContent className="p-4">
        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-3 py-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error.message}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-4">
          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
            <p className="text-sm text-muted-foreground">R$ {product.price.toFixed(2).replace(".", ",")} cada</p>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-transparent"
              onClick={() => onUpdateQuantity(product.id, quantity - 1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-10 text-center font-bold text-lg">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-transparent"
              onClick={() => onUpdateQuantity(product.id, quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Subtotal & Remove */}
          <div className="flex flex-col items-end gap-1">
            <span className="font-bold text-primary">R$ {subtotal.toFixed(2).replace(".", ",")}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onRemove(product.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
