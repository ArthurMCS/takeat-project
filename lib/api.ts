import type { Product, OrderResponse } from "./types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/products`)
  if (!response.ok) {
    throw new Error("Failed to fetch products")
  }
  const data = await response.json()
  return data.map((p: any) => ({
    ...p,
    id: String(p.id),
    price: Number(p.price),
  }))
}

export async function createOrder(items: { productId: string; quantity: number }[]): Promise<OrderResponse> {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(items.map(i => ({ ...i, productId: Number(i.productId) }))),
    })

    if (response.ok) {
      return { success: true }
    }

    const data = await response.json()

    if (response.status === 409) {
      
      
      
      return {
        success: false,
        errors: data.details.map((d: any) => ({
          productId: String(d.productId),
          productName: d.name,
          message: `Estoque insuficiente (Disponível: ${d.stock_quantity})`,
        })),
      }
    }

    return {
      success: false,
      message: data.error || "Erro ao criar pedido",
    }
  } catch (error) {
    console.error("Order error:", error)
    return {
      success: false,
      message: "Erro de conexão com o servidor",
    }
  }
}
