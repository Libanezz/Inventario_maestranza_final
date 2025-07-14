export interface User {
  id: string
  username: string
  email: string
  password: string
  role: UserRole
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
}

export interface InventoryItem {
  id: string
  sku: string
  name: string
  category: string
  quantity: number
  unit: string
  price: number
  location: string
  minStockLevel: number
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Movement {
  id: string
  itemId: string
  type: "entrada" | "salida" | "ajuste"
  quantity: number
  previousQuantity: number
  newQuantity: number
  location: string
  responsible: string
  reason: string
  createdAt: string
}

export interface Supplier {
  id: string
  name: string
  contact: string
  email: string
  phone: string
  address: string
  createdAt: string
  updatedAt: string
}

export interface PurchaseOrder {
  id: string
  supplierId: string
  status: "pending" | "approved" | "received" | "cancelled"
  orderDate: string
  expectedDate: string
  receivedDate?: string
  total: number
  items: PurchaseOrderItem[]
  createdAt: string
  updatedAt: string
}

export interface PurchaseOrderItem {
  itemId: string
  quantity: number
  unitPrice: number
  total: number
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  entity: string
  entityId: string
  details: string
  timestamp: string
}

export type UserRole =
  | "admin"
  | "bodeguero"
  | "comprador"
  | "logistico"
  | "produccion"
  | "auditor"
  | "project_manager"
  | "trabajador"

export interface Permission {
  users: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
  }
  inventory: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
  }
  movements: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
  }
  suppliers: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
  }
  purchaseOrders: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
  }
  reports: {
    view: boolean
  }
  audit: {
    view: boolean
  }
}
