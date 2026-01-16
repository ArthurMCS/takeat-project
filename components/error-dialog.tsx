"use client"

import type { OrderError } from "@/lib/types"
import { AlertTriangle, Trash2, RotateCcw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ErrorDialogProps {
  open: boolean
  errors: OrderError[]
  onClose: () => void
  onRemoveItems: () => void
}

export function ErrorDialog({ open, errors, onClose, onRemoveItems }: ErrorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-destructive">Problema no Pedido</DialogTitle>
              <DialogDescription>
                {errors.length} {errors.length === 1 ? "item" : "itens"} com problema de estoque
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Error List */}
        <div className="space-y-3 max-h-64 overflow-auto py-4">
          {errors.map((error) => (
            <Alert key={error.productId} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{error.productName}</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          ))}
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <Button onClick={onRemoveItems} variant="destructive" className="w-full">
            <Trash2 className="h-4 w-4 mr-2" />
            Remover Itens e Continuar
          </Button>
          <Button onClick={onClose} variant="outline" className="w-full bg-transparent">
            <RotateCcw className="h-4 w-4 mr-2" />
            Voltar e Ajustar Pedido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
