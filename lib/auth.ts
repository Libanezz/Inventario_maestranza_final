import { LocalDatabase } from "./database"
import type { User } from "./types"

export class AuthService {
  private static instance: AuthService
  private db: LocalDatabase
  private currentUser: User | null = null

  private constructor() {
    this.db = LocalDatabase.getInstance()
    this.loadCurrentUser()
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  private loadCurrentUser() {
    const userData = localStorage.getItem("current_user")
    if (userData) {
      this.currentUser = JSON.parse(userData)
    }
  }

  async login(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const user = this.db.getUserByUsername(username)

    if (!user) {
      return { success: false, error: "Usuario no encontrado" }
    }

    if (user.password !== password) {
      return { success: false, error: "Contraseña incorrecta" }
    }

    if (user.status !== "active") {
      return { success: false, error: "Usuario inactivo" }
    }

    this.currentUser = user
    localStorage.setItem("current_user", JSON.stringify(user))

    // Create audit log
    this.db.createAuditLog({
      userId: user.id,
      action: "login",
      entity: "user",
      entityId: user.id,
      details: `Usuario ${username} inició sesión`,
    })

    return { success: true, user }
  }

  async register(
    userData: Omit<User, "id" | "createdAt" | "updatedAt">,
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    const existingUser = this.db.getUserByUsername(userData.username)

    if (existingUser) {
      return { success: false, error: "El nombre de usuario ya existe" }
    }

    const newUser = this.db.createUser(userData)

    // Create audit log
    this.db.createAuditLog({
      userId: newUser.id,
      action: "register",
      entity: "user",
      entityId: newUser.id,
      details: `Nuevo usuario registrado: ${userData.username}`,
    })

    return { success: true, user: newUser }
  }

  logout() {
    if (this.currentUser) {
      this.db.createAuditLog({
        userId: this.currentUser.id,
        action: "logout",
        entity: "user",
        entityId: this.currentUser.id,
        details: `Usuario ${this.currentUser.username} cerró sesión`,
      })
    }

    this.currentUser = null
    localStorage.removeItem("current_user")
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  updateCurrentUser(updates: Partial<User>) {
    if (this.currentUser) {
      const updatedUser = this.db.updateUser(this.currentUser.id, updates)
      if (updatedUser) {
        this.currentUser = updatedUser
        localStorage.setItem("current_user", JSON.stringify(updatedUser))
      }
    }
  }
}
