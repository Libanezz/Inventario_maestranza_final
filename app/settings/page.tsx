"use client"

import { AuthGuard } from "@/components/auth-guard"
import { MainLayout } from "@/components/main-layout"
import { ConstructionPage } from "@/components/construction-page"

export default function SettingsPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <ConstructionPage
          title="Configuración del Sistema"
          description="Esta sección permitirá configurar parámetros generales del sistema, notificaciones, respaldos y otras opciones avanzadas."
        />
      </MainLayout>
    </AuthGuard>
  )
}
