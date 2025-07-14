"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import type { User } from "@/lib/types"

interface AuthGuardProps {
  children: React.ReactNode
  requiredPermission?: {
    entity: string
    action: string
  }
}

export function AuthGuard({ children, requiredPermission }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const authService = AuthService.getInstance()

  useEffect(() => {
    const currentUser = authService.getCurrentUser()

    if (!currentUser) {
      router.push("/login")
      return
    }

    if (requiredPermission) {
      const hasAccess = hasPermission(currentUser.role, requiredPermission.entity as any, requiredPermission.action)

      if (!hasAccess) {
        router.push("/dashboard")
        return
      }
    }

    setUser(currentUser)
    setLoading(false)
  }, [router, requiredPermission])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
