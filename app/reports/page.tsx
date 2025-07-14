"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { MainLayout } from "@/components/main-layout"
import { LocalDatabase } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, TrendingUp, AlertTriangle, DollarSign, ArrowUpDown, CalendarIcon, Download } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface ReportData {
  totalItems: number
  totalQuantity: number
  lowStockItems: number
  totalValue: number
  movementsByType: {
    entrada: number
    salida: number
    ajuste: number
  }
  movementsByDate: any[]
  lowStockDetails: any[]
}

function ReportsContent() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  })
  const [reportType, setReportType] = useState("inventory")

  const db = LocalDatabase.getInstance()

  useEffect(() => {
    generateReport()
  }, [dateRange, reportType])

  const generateReport = () => {
    setLoading(true)

    const items = db.getInventoryItems()
    const movements = db.getMovements()
    const lowStockItems = db.getLowStockItems()

    // Filter movements by date range
    const filteredMovements = movements.filter((movement) => {
      const movementDate = new Date(movement.createdAt)
      if (dateRange.from && movementDate < dateRange.from) return false
      if (dateRange.to && movementDate > dateRange.to) return false
      return true
    })

    // Calculate movement statistics
    const movementsByType = {
      entrada: filteredMovements.filter((m) => m.type === "entrada").length,
      salida: filteredMovements.filter((m) => m.type === "salida").length,
      ajuste: filteredMovements.filter((m) => m.type === "ajuste").length,
    }

    const data: ReportData = {
      totalItems: items.length,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      lowStockItems: lowStockItems.length,
      totalValue: db.getTotalInventoryValue(),
      movementsByType,
      movementsByDate: filteredMovements,
      lowStockDetails: lowStockItems,
    }

    setReportData(data)
    setLoading(false)
  }

  const exportReport = () => {
    if (!reportData) return

    const reportContent = {
      fecha_generacion: new Date().toISOString(),
      periodo: {
        desde: dateRange.from?.toISOString(),
        hasta: dateRange.to?.toISOString(),
      },
      resumen: {
        total_articulos: reportData.totalItems,
        cantidad_total: reportData.totalQuantity,
        articulos_stock_bajo: reportData.lowStockItems,
        valor_total: reportData.totalValue,
      },
      movimientos: reportData.movementsByType,
      articulos_stock_bajo: reportData.lowStockDetails,
    }

    const blob = new Blob([JSON.stringify(reportContent, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `reporte_inventario_${format(new Date(), "yyyy-MM-dd")}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!reportData) {
    return <div>Error al generar el reporte</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600">Análisis y estadísticas del inventario</p>
        </div>
        <Button onClick={exportReport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Reporte
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Reporte</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inventory">Inventario General</SelectItem>
                  <SelectItem value="movements">Movimientos</SelectItem>
                  <SelectItem value="lowstock">Stock Bajo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha Desde</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-48 justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? format(dateRange.from, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha Hasta</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-48 justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? format(dateRange.to, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Artículos</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalItems}</div>
            <p className="text-xs text-muted-foreground">Productos únicos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cantidad Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalQuantity}</div>
            <p className="text-xs text-muted-foreground">Unidades en stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Requieren reposición</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${reportData.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Valor del inventario</p>
          </CardContent>
        </Card>
      </div>

      {/* Movement Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Estadísticas de Movimientos
          </CardTitle>
          <CardDescription>
            Período: {dateRange.from ? format(dateRange.from, "PPP", { locale: es }) : "Sin fecha"} -{" "}
            {dateRange.to ? format(dateRange.to, "PPP", { locale: es }) : "Sin fecha"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{reportData.movementsByType.entrada}</div>
              <p className="text-sm text-green-700">Entradas</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{reportData.movementsByType.salida}</div>
              <p className="text-sm text-red-700">Salidas</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{reportData.movementsByType.ajuste}</div>
              <p className="text-sm text-blue-700">Ajustes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Details */}
      {reportData.lowStockDetails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Artículos con Stock Bajo
            </CardTitle>
            <CardDescription>Productos que requieren reposición inmediata</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.lowStockDetails.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      SKU: {item.sku} | Categoría: {item.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive">
                      {item.quantity} / {item.minStockLevel} {item.unit}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">Ubicación: {item.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Movements */}
      <Card>
        <CardHeader>
          <CardTitle>Movimientos Recientes</CardTitle>
          <CardDescription>Últimos movimientos en el período seleccionado</CardDescription>
        </CardHeader>
        <CardContent>
          {reportData.movementsByDate.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay movimientos en el período seleccionado</p>
          ) : (
            <div className="space-y-3">
              {reportData.movementsByDate.slice(0, 10).map((movement) => (
                <div key={movement.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          movement.type === "entrada"
                            ? "default"
                            : movement.type === "salida"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {movement.type.toUpperCase()}
                      </Badge>
                      <span className="font-medium">Cantidad: {movement.quantity}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Responsable: {movement.responsible} | Ubicación: {movement.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{new Date(movement.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">{new Date(movement.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ReportsPage() {
  return (
    <AuthGuard requiredPermission={{ entity: "reports", action: "view" }}>
      <MainLayout>
        <ReportsContent />
      </MainLayout>
    </AuthGuard>
  )
}
