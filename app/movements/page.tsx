"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { MainLayout } from "@/components/main-layout"
import { DataTable } from "@/components/data-table"
import { LocalDatabase } from "@/lib/database"
import { AuthService } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import type { Movement, InventoryItem } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, ArrowUp, ArrowDown, RotateCcw } from "lucide-react"

function MovementsContent() {
  const [movements, setMovements] = useState<Movement[]>([])
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    itemId: "",
    type: "entrada" as "entrada" | "salida" | "ajuste",
    quantity: 0,
    location: "",
    reason: "",
  })

  const db = LocalDatabase.getInstance()
  const authService = AuthService.getInstance()
  const currentUser = authService.getCurrentUser()

  const canCreate = currentUser && hasPermission(currentUser.role, "movements", "create")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const movementsList = db.getMovements()
    const itemsList = db.getInventoryItems()
    setMovements(movementsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    setItems(itemsList)
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      itemId: "",
      type: "entrada",
      quantity: 0,
      location: "",
      reason: "",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const selectedItem = items.find((item) => item.id === formData.itemId)
    if (!selectedItem) return

    let newQuantity = selectedItem.quantity

    switch (formData.type) {
      case "entrada":
        newQuantity += formData.quantity
        break
      case "salida":
        newQuantity -= formData.quantity
        break
      case "ajuste":
        newQuantity = formData.quantity
        break
    }

    if (newQuantity < 0) {
      alert("La cantidad resultante no puede ser negativa")
      return
    }

    const movement = {
      itemId: formData.itemId,
      type: formData.type,
      quantity: formData.quantity,
      previousQuantity: selectedItem.quantity,
      newQuantity,
      location: formData.location,
      responsible: currentUser!.username,
      reason: formData.reason,
    }

    db.createMovement(movement)
    db.createAuditLog({
      userId: currentUser!.id,
      action: "create",
      entity: "movement",
      entityId: "new",
      details: `Movimiento ${formData.type}: ${selectedItem.name} - ${formData.quantity} ${selectedItem.unit}`,
    })

    loadData()
    setDialogOpen(false)
    resetForm()
  }

  const getItemName = (itemId: string) => {
    const item = items.find((i) => i.id === itemId)
    return item ? item.name : "Artículo no encontrado"
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "entrada":
        return <ArrowUp className="h-4 w-4 text-green-600" />
      case "salida":
        return <ArrowDown className="h-4 w-4 text-red-600" />
      case "ajuste":
        return <RotateCcw className="h-4 w-4 text-blue-600" />
      default:
        return null
    }
  }

  const getMovementBadge = (type: string) => {
    const variants = {
      entrada: "default" as const,
      salida: "destructive" as const,
      ajuste: "secondary" as const,
    }
    return <Badge variant={variants[type as keyof typeof variants]}>{type.toUpperCase()}</Badge>
  }

  const columns = [
    {
      key: "type",
      header: "Tipo",
      render: (movement: Movement) => (
        <div className="flex items-center gap-2">
          {getMovementIcon(movement.type)}
          {getMovementBadge(movement.type)}
        </div>
      ),
    },
    {
      key: "itemId",
      header: "Artículo",
      render: (movement: Movement) => getItemName(movement.itemId),
    },
    {
      key: "quantity",
      header: "Cantidad",
      render: (movement: Movement) => {
        const item = items.find((i) => i.id === movement.itemId)
        return `${movement.quantity} ${item?.unit || ""}`
      },
    },
    {
      key: "previousQuantity",
      header: "Stock Anterior",
      render: (movement: Movement) => {
        const item = items.find((i) => i.id === movement.itemId)
        return `${movement.previousQuantity} ${item?.unit || ""}`
      },
    },
    {
      key: "newQuantity",
      header: "Stock Nuevo",
      render: (movement: Movement) => {
        const item = items.find((i) => i.id === movement.itemId)
        return `${movement.newQuantity} ${item?.unit || ""}`
      },
    },
    { key: "location", header: "Ubicación" },
    { key: "responsible", header: "Responsable" },
    {
      key: "createdAt",
      header: "Fecha",
      render: (movement: Movement) => new Date(movement.createdAt).toLocaleString(),
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Movimientos</h1>
          <p className="text-gray-600">Historial de movimientos de inventario</p>
        </div>
        {canCreate && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Movimiento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nuevo Movimiento</DialogTitle>
                <DialogDescription>Registre una entrada, salida o ajuste de inventario</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="itemId">Artículo</Label>
                  <Select
                    value={formData.itemId}
                    onValueChange={(value) => setFormData({ ...formData, itemId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar artículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} - {item.sku} (Stock: {item.quantity} {item.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Movimiento</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "entrada" | "salida" | "ajuste") =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="salida">Salida</SelectItem>
                      <SelectItem value="ajuste">Ajuste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">{formData.type === "ajuste" ? "Nueva Cantidad" : "Cantidad"}</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) || 0 })}
                    required
                    min="0"
                  />
                  {formData.type === "ajuste" && (
                    <p className="text-xs text-gray-500">Ingrese la cantidad final que debe tener el artículo</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Motivo</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    required
                    placeholder="Describa el motivo del movimiento"
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Registrar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Movements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Movimientos</CardTitle>
          <CardDescription>Total: {movements.length} movimientos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={movements}
            columns={columns}
            searchPlaceholder="Buscar por artículo, responsable o ubicación..."
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default function MovementsPage() {
  return (
    <AuthGuard requiredPermission={{ entity: "movements", action: "view" }}>
      <MainLayout>
        <MovementsContent />
      </MainLayout>
    </AuthGuard>
  )
}
