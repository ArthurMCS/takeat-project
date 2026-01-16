"use client"

import { useState, useEffect, useCallback } from "react"
import { createOrder } from "@/lib/api"
import type { OrderResponse, OrderError } from "@/lib/types"

export interface QueuedOrder {
  id: string
  timestamp: number
  items: { productId: string; quantity: number }[]
  status: "pending" | "syncing" | "failed"
}

export function useOfflineQueue() {
  const [queue, setQueue] = useState<QueuedOrder[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const [syncErrors, setSyncErrors] = useState<{ orderId: string; errors: OrderError[] }[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    setIsOnline(navigator.onLine)
    
    const stored = localStorage.getItem("takeat_offline_queue")
    if (stored) {
      try {
        setQueue(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to parse offline queue", e)
      }
    }

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Persist to localStorage whenever queue changes
  useEffect(() => {
    localStorage.setItem("takeat_offline_queue", JSON.stringify(queue))
  }, [queue])

  // Auto-process queue when online
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      processQueue()
    }
  }, [isOnline])

  const addToQueue = (items: { productId: string; quantity: number }[]) => {
    const newOrder: QueuedOrder = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      items,
      status: "pending",
    }
    setQueue((prev) => [...prev, newOrder])
  }

  const removeFromQueue = (id: string) => {
    setQueue((prev) => prev.filter((o) => o.id !== id))
  }

  const processQueue = useCallback(async () => {
    const pendingOrders = queue.filter(o => o.status === "pending" || o.status === "failed")
    if (pendingOrders.length === 0) return

    // Mark all as syncing
    setQueue(prev => prev.map(o => 
      pendingOrders.find(p => p.id === o.id) ? { ...o, status: "syncing" } : o
    ))

    const newSyncErrors: { orderId: string; errors: OrderError[] }[] = []

    for (const order of pendingOrders) {
      try {
        const response: OrderResponse = await createOrder(order.items)

        if (response.success) {
          // Success: remove from queue
          setQueue(prev => prev.filter(o => o.id !== order.id))
        } else if (response.isNetworkError) {
          // Still offline or unstable: keep in queue, revert to pending
          setQueue(prev => prev.map(o => o.id === order.id ? { ...o, status: "pending" } : o))
        } else if (response.errors) {
          // Conflict (Stock): Remove from queue BUT add to sync errors to notify user
          setQueue(prev => prev.filter(o => o.id !== order.id))
          newSyncErrors.push({ orderId: order.id, errors: response.errors })
        } else {
            // Other error (generic): Keep in queue as failed? Or remove?
            // Safer to keep and let user retry manually or remove manually if implemented
            setQueue(prev => prev.map(o => o.id === order.id ? { ...o, status: "failed" } : o))
        }
      } catch (e) {
         setQueue(prev => prev.map(o => o.id === order.id ? { ...o, status: "pending" } : o))
      }
    }

    if (newSyncErrors.length > 0) {
        setSyncErrors(prev => [...prev, ...newSyncErrors])
    }
  }, [queue])

  const clearSyncErrors = () => setSyncErrors([])

  return {
    queue,
    isOnline,
    addToQueue,
    removeFromQueue,
    syncErrors,
    clearSyncErrors,
    processQueue
  }
}
