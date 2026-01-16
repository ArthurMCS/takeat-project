"use client"

import { useState } from "react"
import type { Product } from "@/lib/types"
import { ProductCard } from "./product-card"
import { Button } from "@/components/ui/button"

interface MenuGridProps {
  products: Product[]
  categories: string[]
  onAddToCart: (product: Product) => void
  errorProductIds: string[]
}

export function MenuGrid({ products, categories, onAddToCart, errorProductIds }: MenuGridProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filteredProducts = activeCategory ? products.filter((p) => p.category === activeCategory) : products

  return (
    <div className="p-4 lg:p-6">
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Button
          onClick={() => setActiveCategory(null)}
          variant={activeCategory === null ? "default" : "outline"}
          className="whitespace-nowrap"
        >
          Todos
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            onClick={() => setActiveCategory(category)}
            variant={activeCategory === category ? "default" : "outline"}
            className="whitespace-nowrap"
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAdd={onAddToCart}
            hasError={errorProductIds.includes(product.id)}
          />
        ))}
      </div>
    </div>
  )
}
