"use client"

import { useRouter, usePathname } from "next/navigation"
import { AuthService } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Package,
  ArrowUpDown,
  Users,
  Truck,
  ShoppingCart,
  BarChart3,
  Shield,
  Settings,
  User,
  LogOut,
  X,
} from "lucide-react"

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const authService = AuthService.getInstance()
  const currentUser = authService.getCurrentUser()

  const handleLogout = () => {
    authService.logout()
    router.push("/login")
  }

  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      permission: null,
    },
    {
      name: "Inventario",
      href: "/inventory",
      icon: Package,
      permission: { entity: "inventory", action: "view" },
    },
    {
      name: "Movimientos",
      href: "/movements",
      icon: ArrowUpDown,
      permission: { entity: "movements", action: "view" },
    },
    {
      name: "Usuarios",
      href: "/users",
      icon: Users,
      permission: { entity: "users", action: "view" },
    },
    {
      name: "Proveedores",
      href: "/suppliers",
      icon: Truck,
      permission: { entity: "suppliers", action: "view" },
    },
    {
      name: "Órdenes de Compra",
      href: "/purchase-orders",
      icon: ShoppingCart,
      permission: { entity: "purchaseOrders", action: "view" },
    },
    {
      name: "Reportes",
      href: "/reports",
      icon: BarChart3,
      permission: { entity: "reports", action: "view" },
    },
    {
      name: "Auditoría",
      href: "/audit",
      icon: Shield,
      permission: { entity: "audit", action: "view" },
    },
    {
      name: "Configuración",
      href: "/settings",
      icon: Settings,
      permission: null,
    },
    {
      name: "Perfil",
      href: "/profile",
      icon: User,
      permission: null,
    },
  ]

  const visibleItems = menuItems.filter((item) => {
    if (!item.permission) return true
    if (!currentUser) return false
    return hasPermission(currentUser.role, item.permission.entity as any, item.permission.action)
  })

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Inventario</h2>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* User info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">{currentUser?.username.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{currentUser?.username}</p>
            <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Button
              key={item.href}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start ${isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"}`}
              onClick={() => {
                router.push(item.href)
                onClose?.()
              }}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Button>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <Button variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50" onClick={handleLogout}>
          <LogOut className="mr-3 h-5 w-5" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}
