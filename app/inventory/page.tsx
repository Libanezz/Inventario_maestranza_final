"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { MainLayout } from "@/components/main-layout"
import { DataTable } from "@/components/data-table"
import { LocalDatabase } from "@/lib/database"
import { AuthService } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import type { InventoryItem } from "@/lib/types"
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
import { Plus, Edit, Trash2, AlertTriangle } from "lucide-react"
import Image from "next/image"

function InventoryContent() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    category: "",
    quantity: 0,
    unit: "",
    price: 0,
    location: "",
    minStockLevel: 0,
    imageUrl: "",
  })

  const db = LocalDatabase.getInstance()
  const authService = AuthService.getInstance()
  const currentUser = authService.getCurrentUser()

  const canCreate = currentUser && hasPermission(currentUser.role, "inventory", "create")
  const canEdit = currentUser && hasPermission(currentUser.role, "inventory", "edit")
  const canDelete = currentUser && hasPermission(currentUser.role, "inventory", "delete")

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = () => {
    const inventoryItems = db.getInventoryItems()
    setItems(inventoryItems)
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      sku: "",
      name: "",
      category: "",
      quantity: 0,
      unit: "",
      price: 0,
      location: "",
      minStockLevel: 0,
      imageUrl: "",
    })
    setEditingItem(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingItem) {
      db.updateInventoryItem(editingItem.id, formData)
      db.createAuditLog({
        userId: currentUser!.id,
        action: "update",
        entity: "inventory_item",
        entityId: editingItem.id,
        details: `Artículo actualizado: ${formData.name}`,
      })
    } else {
      db.createInventoryItem(formData)
      db.createAuditLog({
        userId: currentUser!.id,
        action: "create",
        entity: "inventory_item",
        entityId: "new",
        details: `Nuevo artículo creado: ${formData.name}`,
      })
    }

    loadItems()
    setDialogOpen(false)
    resetForm()
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setFormData({
      sku: item.sku,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      location: item.location,
      minStockLevel: item.minStockLevel,
      imageUrl: item.imageUrl || "",
    })
    setDialogOpen(true)
  }

  const handleDelete = (item: InventoryItem) => {
    if (confirm(`¿Está seguro de eliminar el artículo "${item.name}"?`)) {
      db.deleteInventoryItem(item.id)
      db.createAuditLog({
        userId: currentUser!.id,
        action: "delete",
        entity: "inventory_item",
        entityId: item.id,
        details: `Artículo eliminado: ${item.name}`,
      })
      loadItems()
    }
  }

  const columns = [
    {
      key: "imageUrl",
      header: "Imagen",
      render: (item: InventoryItem) => (
        <Image
          src={item.imageUrl || "/placeholder.svg?height=40&width=40"}
          alt={item.name}
          width={40}
          height={40}
          className="rounded-md object-cover"
        />
      ),
    },
    { key: "sku", header: "SKU" },
    { key: "name", header: "Nombre" },
    { key: "category", header: "Categoría" },
    {
      key: "quantity",
      header: "Cantidad",
      render: (item: InventoryItem) => (
        <div className="flex items-center gap-2">
          <span>
            {item.quantity} {item.unit}
          </span>
          {item.quantity <= item.minStockLevel && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Bajo
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "price",
      header: "Precio",
      render: (item: InventoryItem) => `$${item.price.toLocaleString()}`,
    },
    { key: "location", header: "Ubicación" },
    {
      key: "actions",
      header: "Acciones",
      render: (item: InventoryItem) => (
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(item)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const lowStockItems = items.filter((item) => item.quantity <= item.minStockLevel)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-600">Gestión de artículos en stock</p>
        </div>
        {canCreate && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Artículo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Editar Artículo" : "Nuevo Artículo"}</DialogTitle>
                <DialogDescription>
                  {editingItem ? "Modifique los datos del artículo" : "Complete la información del nuevo artículo"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Cantidad</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unidad</Label>
                    <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unidad">Unidad</SelectItem>
                        <SelectItem value="paquete">Paquete</SelectItem>
                        <SelectItem value="caja">Caja</SelectItem>
                        <SelectItem value="kg">Kilogramo</SelectItem>
                        <SelectItem value="litro">Litro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minStockLevel">Stock Mínimo</Label>
                    <Input
                      id="minStockLevel"
                      type="number"
                      value={formData.minStockLevel}
                      onChange={(e) =>
                        setFormData({ ...formData, minStockLevel: Number.parseInt(e.target.value) || 0 })
                      }
                      required
                    />
                  </div>
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
                  <Label htmlFor="imageUrl">URL de Imagen (opcional)</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="/placeholder.svg?height=100&width=100"
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">{editingItem ? "Actualizar" : "Crear"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alerta de Stock Bajo
            </CardTitle>
            <CardDescription className="text-red-600">
              {lowStockItems.length} artículo(s) requieren reposición
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-white rounded border">
                  <span className="font-medium">{item.name}</span>
                  <Badge variant="destructive">
                    {item.quantity} / {item.minStockLevel} {item.unit}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Artículos en Inventario</CardTitle>
          <CardDescription>Total: {items.length} artículos</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable data={items} columns={columns} searchPlaceholder="Buscar por nombre, SKU o categoría..." />
        </CardContent>
      </Card>
    </div>
  )
}

export default function InventoryPage() {
  return (
    <AuthGuard requiredPermission={{ entity: "inventory", action: "view" }}>
      <MainLayout>
        <InventoryContent />
      </MainLayout>
    </AuthGuard>
  )
}
