"use client"

import { AuthGuard } from "@/components/auth-guard"
import { MainLayout } from "@/components/main-layout"
import { ConstructionPage } from "@/components/construction-page"

export default function PurchaseOrdersPage() {
  return (
    <AuthGuard requiredPermission={{ entity: "purchaseOrders", action: "view" }}>
      <MainLayout>
        <ConstructionPage
          title="Órdenes de Compra"
          description="Esta funcionalidad permitirá crear, gestionar y hacer seguimiento de las órdenes de compra a proveedores."
        />
      </MainLayout>
    </AuthGuard>
  )
}
