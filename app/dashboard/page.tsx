"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { MainLayout } from "@/components/main-layout"
import { LocalDatabase } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, TrendingUp, AlertTriangle, DollarSign, ArrowUpDown } from "lucide-react"

interface Stats {
  totalItems: number
  totalQuantity: number
  lowStockItems: number
  totalValue: number
  recentMovements: any[]
}

function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  color = "blue",
}: {
  title: string
  value: string | number
  description: string
  icon: any
  color?: string
}) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    red: "text-red-600 bg-red-100",
    yellow: "text-yellow-600 bg-yellow-100",
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function DashboardContent() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const db = LocalDatabase.getInstance()
    const inventoryStats = db.getInventoryStats()
    setStats(inventoryStats)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!stats) {
    return <div>Error al cargar las estadísticas</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Resumen del sistema de inventario</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Artículos"
          value={stats.totalItems}
          description="Productos únicos en inventario"
          icon={Package}
          color="blue"
        />
        <StatsCard
          title="Cantidad Total"
          value={stats.totalQuantity}
          description="Unidades en stock"
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Stock Bajo"
          value={stats.lowStockItems}
          description="Artículos que requieren reposición"
          icon={AlertTriangle}
          color="red"
        />
        <StatsCard
          title="Valor Total"
          value={`$${stats.totalValue.toLocaleString()}`}
          description="Valor total del inventario"
          icon={DollarSign}
          color="yellow"
        />
      </div>

      {/* Recent Movements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Movimientos Recientes
          </CardTitle>
          <CardDescription>Últimos movimientos de inventario</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentMovements.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay movimientos recientes</p>
          ) : (
            <div className="space-y-3">
              {stats.recentMovements.slice(0, 5).map((movement) => (
                <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{movement.type.toUpperCase()}</p>
                    <p className="text-sm text-gray-600">
                      Cantidad: {movement.quantity} | Responsable: {movement.responsible}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{new Date(movement.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Accesos directos a funciones principales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
              <Package className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-medium">Agregar Producto</h3>
              <p className="text-sm text-gray-600">Añadir nuevo artículo al inventario</p>
            </button>
            <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
              <ArrowUpDown className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-medium">Registrar Movimiento</h3>
              <p className="text-sm text-gray-600">Entrada, salida o ajuste de stock</p>
            </button>
            <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
              <AlertTriangle className="h-8 w-8 text-red-600 mb-2" />
              <h3 className="font-medium">Ver Stock Bajo</h3>
              <p className="text-sm text-gray-600">Revisar productos que necesitan reposición</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <DashboardContent />
      </MainLayout>
    </AuthGuard>
  )
}
