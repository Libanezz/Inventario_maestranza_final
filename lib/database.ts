import type { User, InventoryItem, Movement, Supplier, PurchaseOrder, AuditLog } from "./types"

export class LocalDatabase {
  private static instance: LocalDatabase
  private readonly STORAGE_KEY = "inventory_system_db"

  private constructor() {
    this.initializeDatabase()
  }

  static getInstance(): LocalDatabase {
    if (!LocalDatabase.instance) {
      LocalDatabase.instance = new LocalDatabase()
    }
    return LocalDatabase.instance
  }

  private initializeDatabase() {
    const existingData = localStorage.getItem(this.STORAGE_KEY)
    if (!existingData) {
      this.seedDatabase()
    }
  }

  private seedDatabase() {
    const initialData = {
      users: [
        {
          id: "1",
          username: "admin",
          email: "admin@inventory.com",
          password: "admin123",
          role: "admin" as const,
          status: "active" as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          username: "bodeguero1",
          email: "bodeguero@inventory.com",
          password: "bodeguero123",
          role: "bodeguero" as const,
          status: "active" as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      inventoryItems: [
        {
          id: "1",
          sku: "SKU001",
          name: "Laptop Dell Inspiron",
          category: "Electrónicos",
          quantity: 15,
          unit: "unidad",
          price: 800,
          location: "Almacén A-1",
          minStockLevel: 5,
          imageUrl: "/placeholder.svg?height=100&width=100",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          sku: "SKU002",
          name: "Mouse Inalámbrico",
          category: "Accesorios",
          quantity: 50,
          unit: "unidad",
          price: 25,
          location: "Almacén B-2",
          minStockLevel: 10,
          imageUrl: "/placeholder.svg?height=100&width=100",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "3",
          sku: "SKU003",
          name: "Papel A4",
          category: "Oficina",
          quantity: 3,
          unit: "paquete",
          price: 5,
          location: "Almacén C-1",
          minStockLevel: 20,
          imageUrl: "/placeholder.svg?height=100&width=100",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      movements: [],
      suppliers: [
        {
          id: "1",
          name: "TechSupply Corp",
          contact: "Juan Pérez",
          email: "contacto@techsupply.com",
          phone: "+1234567890",
          address: "Av. Principal 123, Ciudad",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      purchaseOrders: [],
      auditLogs: [],
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initialData))
  }

  private getData() {
    const data = localStorage.getItem(this.STORAGE_KEY)
    return data ? JSON.parse(data) : null
  }

  private saveData(data: any) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
  }

  // Users CRUD
  getUsers(): User[] {
    const data = this.getData()
    return data?.users || []
  }

  getUserById(id: string): User | null {
    const users = this.getUsers()
    return users.find((user) => user.id === id) || null
  }

  getUserByUsername(username: string): User | null {
    const users = this.getUsers()
    return users.find((user) => user.username === username) || null
  }

  createUser(user: Omit<User, "id" | "createdAt" | "updatedAt">): User {
    const data = this.getData()
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    data.users.push(newUser)
    this.saveData(data)
    return newUser
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const data = this.getData()
    const userIndex = data.users.findIndex((user: User) => user.id === id)
    if (userIndex === -1) return null

    data.users[userIndex] = {
      ...data.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    this.saveData(data)
    return data.users[userIndex]
  }

  deleteUser(id: string): boolean {
    const data = this.getData()
    const userIndex = data.users.findIndex((user: User) => user.id === id)
    if (userIndex === -1) return false

    data.users.splice(userIndex, 1)
    this.saveData(data)
    return true
  }

  // Inventory Items CRUD
  getInventoryItems(): InventoryItem[] {
    const data = this.getData()
    return data?.inventoryItems || []
  }

  getInventoryItemById(id: string): InventoryItem | null {
    const items = this.getInventoryItems()
    return items.find((item) => item.id === id) || null
  }

  createInventoryItem(item: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">): InventoryItem {
    const data = this.getData()
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    data.inventoryItems.push(newItem)
    this.saveData(data)
    return newItem
  }

  updateInventoryItem(id: string, updates: Partial<InventoryItem>): InventoryItem | null {
    const data = this.getData()
    const itemIndex = data.inventoryItems.findIndex((item: InventoryItem) => item.id === id)
    if (itemIndex === -1) return null

    data.inventoryItems[itemIndex] = {
      ...data.inventoryItems[itemIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    this.saveData(data)
    return data.inventoryItems[itemIndex]
  }

  deleteInventoryItem(id: string): boolean {
    const data = this.getData()
    const itemIndex = data.inventoryItems.findIndex((item: InventoryItem) => item.id === id)
    if (itemIndex === -1) return false

    data.inventoryItems.splice(itemIndex, 1)
    this.saveData(data)
    return true
  }

  // Movements CRUD
  getMovements(): Movement[] {
    const data = this.getData()
    return data?.movements || []
  }

  createMovement(movement: Omit<Movement, "id" | "createdAt">): Movement {
    const data = this.getData()
    const newMovement: Movement = {
      ...movement,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    data.movements.push(newMovement)

    // Update inventory quantity
    const itemIndex = data.inventoryItems.findIndex((item: InventoryItem) => item.id === movement.itemId)
    if (itemIndex !== -1) {
      data.inventoryItems[itemIndex].quantity = movement.newQuantity
      data.inventoryItems[itemIndex].updatedAt = new Date().toISOString()
    }

    this.saveData(data)
    return newMovement
  }

  // Suppliers CRUD
  getSuppliers(): Supplier[] {
    const data = this.getData()
    return data?.suppliers || []
  }

  createSupplier(supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt">): Supplier {
    const data = this.getData()
    const newSupplier: Supplier = {
      ...supplier,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    data.suppliers.push(newSupplier)
    this.saveData(data)
    return newSupplier
  }

  // Purchase Orders CRUD
  getPurchaseOrders(): PurchaseOrder[] {
    const data = this.getData()
    return data?.purchaseOrders || []
  }

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    const data = this.getData()
    return data?.auditLogs || []
  }

  createAuditLog(log: Omit<AuditLog, "id" | "timestamp">): AuditLog {
    const data = this.getData()
    const newLog: AuditLog = {
      ...log,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    }
    data.auditLogs.push(newLog)
    this.saveData(data)
    return newLog
  }

  // Utility methods
  getLowStockItems(): InventoryItem[] {
    const items = this.getInventoryItems()
    return items.filter((item) => item.quantity <= item.minStockLevel)
  }

  getTotalInventoryValue(): number {
    const items = this.getInventoryItems()
    return items.reduce((total, item) => total + item.quantity * item.price, 0)
  }

  getInventoryStats() {
    const items = this.getInventoryItems()
    const movements = this.getMovements()

    return {
      totalItems: items.length,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      lowStockItems: this.getLowStockItems().length,
      totalValue: this.getTotalInventoryValue(),
      recentMovements: movements.slice(-10),
    }
  }
}
