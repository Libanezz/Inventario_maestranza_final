"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { MainLayout } from "@/components/main-layout"
import { DataTable } from "@/components/data-table"
import { LocalDatabase } from "@/lib/database"
import type { AuditLog } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, User, Package, ArrowUpDown, Truck, ShoppingCart } from "lucide-react"

function AuditContent() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  const db = LocalDatabase.getInstance()

  useEffect(() => {
    loadAuditLogs()
  }, [])

  const loadAuditLogs = () => {
    const logs = db.getAuditLogs()
    setAuditLogs(logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))
    setLoading(false)
  }

  const getActionBadge = (action: string) => {
    const actionColors = {
      login: "default",
      logout: "secondary",
      register: "default",
      create: "default",
      update: "secondary",
      delete: "destructive",
    }

    return (
      <Badge variant={actionColors[action as keyof typeof actionColors] || "outline"}>{action.toUpperCase()}</Badge>
    )
  }

  const getEntityIcon = (entity: string) => {
    const icons = {
      user: User,
      inventory_item: Package,
      movement: ArrowUpDown,
      supplier: Truck,
      purchase_order: ShoppingCart,
    }

    const Icon = icons[entity as keyof typeof icons] || Shield
    return <Icon className="h-4 w-4" />
  }

  const columns = [
    {
      key: "timestamp",
      header: "Fecha/Hora",
      render: (log: AuditLog) => (
        <div>
          <div className="font-medium">{new Date(log.timestamp).toLocaleDateString()}</div>
          <div className="text-sm text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</div>
        </div>
      ),
    },
    {
      key: "userId",
      header: "Usuario",
      render: (log: AuditLog) => {
        const users = db.getUsers()
        const user = users.find((u) => u.id === log.userId)
        return user ? user.username : "Usuario desconocido"
      },
    },
    {
      key: "action",
      header: "Acción",
      render: (log: AuditLog) => getActionBadge(log.action),
    },
    {
      key: "entity",
      header: "Entidad",
      render: (log: AuditLog) => (
        <div className="flex items-center gap-2">
          {getEntityIcon(log.entity)}
          <span className="capitalize">{log.entity.replace("_", " ")}</span>
        </div>
      ),
    },
    {
      key: "details",
      header: "Detalles",
      render: (log: AuditLog) => (
        <div className="max-w-xs truncate" title={log.details}>
          {log.details}
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

  // Calculate statistics
  const stats = {
    totalLogs: auditLogs.length,
    todayLogs: auditLogs.filter((log) => {
      const today = new Date()
      const logDate = new Date(log.timestamp)
      return logDate.toDateString() === today.toDateString()
    }).length,
    actionStats: auditLogs.reduce(
      (acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Registro de Auditoría</h1>
        <p className="text-gray-600">Historial de actividades del sistema</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLogs}</div>
            <p className="text-xs text-muted-foreground">Actividades registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actividad Hoy</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayLogs}</div>
            <p className="text-xs text-muted-foreground">Registros de hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acciones Más Frecuentes</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {Object.entries(stats.actionStats)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([action, count]) => (
                  <div key={action} className="flex justify-between text-sm">
                    <span className="capitalize">{action}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Actividades</CardTitle>
          <CardDescription>Historial completo de acciones realizadas en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={auditLogs}
            columns={columns}
            searchPlaceholder="Buscar por usuario, acción o detalles..."
            itemsPerPage={20}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuditPage() {
  return (
    <AuthGuard requiredPermission={{ entity: "audit", action: "view" }}>
      <MainLayout>
        <AuditContent />
      </MainLayout>
    </AuthGuard>
  )
}
