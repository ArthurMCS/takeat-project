"use client"

import type { Product } from "@/lib/types"
import { Plus, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ProductCardProps {
  product: Product
  onAdd: (product: Product) => void
  hasError: boolean
}

export function ProductCard({ product, onAdd, hasError }: ProductCardProps) {
  const isDisabled = !product.available || hasError

  return (
    <Card
      className={`relative overflow-hidden transition-all cursor-pointer hover:shadow-lg ${
        isDisabled ? "opacity-60" : "hover:border-primary"
      } ${hasError ? "ring-2 ring-destructive" : ""}`}
      onClick={() => !isDisabled && onAdd(product)}
    >
      <CardContent className="p-4 flex flex-col h-full">

        {!product.available && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            Esgotado
          </Badge>
        )}
        {hasError && product.available && (
          <span className="absolute top-2 right-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </span>
        )}


        <Badge variant="secondary" className="self-start mb-2 text-xs">
          {product.category}
        </Badge>
        <span className="font-semibold text-lg mb-2 leading-tight text-foreground">{product.name}</span>

        <div className="flex items-center justify-between mt-auto pt-3">
          <span className="text-primary font-bold text-xl">R$ {product.price.toFixed(2).replace(".", ",")}</span>
          {!isDisabled && (
            <Button size="icon" className="rounded-full h-10 w-10">
              <Plus className="h-5 w-5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
