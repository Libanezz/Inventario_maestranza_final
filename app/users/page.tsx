"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { MainLayout } from "@/components/main-layout"
import { DataTable } from "@/components/data-table"
import { LocalDatabase } from "@/lib/database"
import { AuthService } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import type { User, UserRole } from "@/lib/types"
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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Eye } from "lucide-react"
import { useRouter } from "next/navigation"

function UsersContent() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [viewingUser, setViewingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "trabajador" as UserRole,
    status: "active" as "active" | "inactive",
  })

  const db = LocalDatabase.getInstance()
  const authService = AuthService.getInstance()
  const currentUser = authService.getCurrentUser()
  const router = useRouter()

  const canCreate = currentUser && hasPermission(currentUser.role, "users", "create")
  const canEdit = currentUser && hasPermission(currentUser.role, "users", "edit")
  const canDelete = currentUser && hasPermission(currentUser.role, "users", "delete")

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = () => {
    const usersList = db.getUsers()
    setUsers(usersList)
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      role: "trabajador",
      status: "active",
    })
    setEditingUser(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingUser) {
      const updateData: Partial<User> = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        status: formData.status,
      }

      if (formData.password) {
        updateData.password = formData.password
      }

      db.updateUser(editingUser.id, updateData)
      db.createAuditLog({
        userId: currentUser!.id,
        action: "update",
        entity: "user",
        entityId: editingUser.id,
        details: `Usuario actualizado: ${formData.username}`,
      })
    } else {
      db.createUser(formData)
      db.createAuditLog({
        userId: currentUser!.id,
        action: "create",
        entity: "user",
        entityId: "new",
        details: `Nuevo usuario creado: ${formData.username}`,
      })
    }

    loadUsers()
    setDialogOpen(false)
    resetForm()
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      role: user.role,
      status: user.status,
    })
    setDialogOpen(true)
  }

  const handleView = (user: User) => {
    setViewingUser(user)
    setViewDialogOpen(true)
  }

  const handleDelete = (user: User) => {
    if (user.id === currentUser?.id) {
      alert("No puedes eliminar tu propio usuario")
      return
    }

    if (confirm(`¿Está seguro de eliminar el usuario "${user.username}"?`)) {
      db.deleteUser(user.id)
      db.createAuditLog({
        userId: currentUser!.id,
        action: "delete",
        entity: "user",
        entityId: user.id,
        details: `Usuario eliminado: ${user.username}`,
      })
      loadUsers()
    }
  }

  const getRoleBadge = (role: UserRole) => {
    const roleColors = {
      admin: "destructive",
      bodeguero: "default",
      comprador: "secondary",
      logistico: "outline",
      produccion: "default",
      auditor: "secondary",
      project_manager: "default",
      trabajador: "outline",
    }

    return <Badge variant={roleColors[role] as any}>{role.replace("_", " ").toUpperCase()}</Badge>
  }

  const getStatusBadge = (status: "active" | "inactive") => {
    return (
      <Badge variant={status === "active" ? "default" : "secondary"}>
        {status === "active" ? "ACTIVO" : "INACTIVO"}
      </Badge>
    )
  }

  const roles: { value: UserRole; label: string }[] = [
    { value: "trabajador", label: "Trabajador" },
    { value: "bodeguero", label: "Bodeguero" },
    { value: "comprador", label: "Comprador" },
    { value: "logistico", label: "Logístico" },
    { value: "produccion", label: "Producción" },
    { value: "auditor", label: "Auditor" },
    { value: "project_manager", label: "Project Manager" },
    { value: "admin", label: "Administrador" },
  ]

  const columns = [
    { key: "username", header: "Usuario" },
    { key: "email", header: "Email" },
    {
      key: "role",
      header: "Rol",
      render: (user: User) => getRoleBadge(user.role),
    },
    {
      key: "status",
      header: "Estado",
      render: (user: User) => getStatusBadge(user.status),
    },
    {
      key: "createdAt",
      header: "Creado",
      render: (user: User) => new Date(user.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Acciones",
      render: (user: User) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleView(user)}>
            <Eye className="h-4 w-4" />
          </Button>
          {canEdit && (
            <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {canDelete && user.id !== currentUser?.id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(user)}
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-600">Gestión de usuarios del sistema</p>
        </div>
        {canCreate && (
          <Button onClick={() => router.push("/register")}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Usuario
          </Button>
        )}
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>Total: {users.length} usuarios registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable data={users} columns={columns} searchPlaceholder="Buscar por nombre, email o rol..." />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>Modifique los datos del usuario</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Nueva Contraseña (opcional)</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Dejar vacío para mantener la actual"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Actualizar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles del Usuario</DialogTitle>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Usuario</Label>
                <p className="text-sm">{viewingUser.username}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Email</Label>
                <p className="text-sm">{viewingUser.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Rol</Label>
                <div className="mt-1">{getRoleBadge(viewingUser.role)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Estado</Label>
                <div className="mt-1">{getStatusBadge(viewingUser.status)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Fecha de Creación</Label>
                <p className="text-sm">{new Date(viewingUser.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Última Actualización</Label>
                <p className="text-sm">{new Date(viewingUser.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function UsersPage() {
  return (
    <AuthGuard requiredPermission={{ entity: "users", action: "view" }}>
      <MainLayout>
        <UsersContent />
      </MainLayout>
    </AuthGuard>
  )
}
