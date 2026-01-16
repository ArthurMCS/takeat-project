export interface Product {
  id: string
  name: string
  price: number
  category: string
  available: boolean
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface OrderError {
  productId: string
  productName: string
  message: string
}

export interface OrderResponse {
  success: boolean
  errors?: OrderError[]
  message?: string
}
