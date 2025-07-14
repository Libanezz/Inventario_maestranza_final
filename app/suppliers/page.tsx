"use client"

import { AuthGuard } from "@/components/auth-guard"
import { MainLayout } from "@/components/main-layout"
import { ConstructionPage } from "@/components/construction-page"

export default function SuppliersPage() {
  return (
    <AuthGuard requiredPermission={{ entity: "suppliers", action: "view" }}>
      <MainLayout>
        <ConstructionPage
          title="Gestión de Proveedores"
          description="Esta funcionalidad permitirá gestionar la información de proveedores, incluyendo contactos, direcciones y historial de compras."
        />
      </MainLayout>
    </AuthGuard>
  )
}
