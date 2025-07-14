import type { UserRole, Permission } from "./types"

export const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  admin: {
    users: { view: true, create: true, edit: true, delete: true },
    inventory: { view: true, create: true, edit: true, delete: true },
    movements: { view: true, create: true, edit: true, delete: true },
    suppliers: { view: true, create: true, edit: true, delete: true },
    purchaseOrders: { view: true, create: true, edit: true, delete: true },
    reports: { view: true },
    audit: { view: true },
  },
  bodeguero: {
    users: { view: false, create: false, edit: false, delete: false },
    inventory: { view: true, create: true, edit: true, delete: false },
    movements: { view: true, create: true, edit: false, delete: false },
    suppliers: { view: true, create: false, edit: false, delete: false },
    purchaseOrders: { view: true, create: false, edit: false, delete: false },
    reports: { view: true },
    audit: { view: false },
  },
  comprador: {
    users: { view: false, create: false, edit: false, delete: false },
    inventory: { view: true, create: false, edit: false, delete: false },
    movements: { view: true, create: false, edit: false, delete: false },
    suppliers: { view: true, create: true, edit: true, delete: false },
    purchaseOrders: { view: true, create: true, edit: true, delete: false },
    reports: { view: true },
    audit: { view: false },
  },
  logistico: {
    users: { view: false, create: false, edit: false, delete: false },
    inventory: { view: true, create: false, edit: true, delete: false },
    movements: { view: true, create: true, edit: false, delete: false },
    suppliers: { view: true, create: false, edit: false, delete: false },
    purchaseOrders: { view: true, create: false, edit: false, delete: false },
    reports: { view: true },
    audit: { view: false },
  },
  produccion: {
    users: { view: false, create: false, edit: false, delete: false },
    inventory: { view: true, create: false, edit: false, delete: false },
    movements: { view: true, create: true, edit: false, delete: false },
    suppliers: { view: false, create: false, edit: false, delete: false },
    purchaseOrders: { view: false, create: false, edit: false, delete: false },
    reports: { view: true },
    audit: { view: false },
  },
  auditor: {
    users: { view: true, create: false, edit: false, delete: false },
    inventory: { view: true, create: false, edit: false, delete: false },
    movements: { view: true, create: false, edit: false, delete: false },
    suppliers: { view: true, create: false, edit: false, delete: false },
    purchaseOrders: { view: true, create: false, edit: false, delete: false },
    reports: { view: true },
    audit: { view: true },
  },
  project_manager: {
    users: { view: true, create: false, edit: false, delete: false },
    inventory: { view: true, create: false, edit: false, delete: false },
    movements: { view: true, create: false, edit: false, delete: false },
    suppliers: { view: true, create: false, edit: false, delete: false },
    purchaseOrders: { view: true, create: true, edit: true, delete: false },
    reports: { view: true },
    audit: { view: true },
  },
  trabajador: {
    users: { view: false, create: false, edit: false, delete: false },
    inventory: { view: true, create: false, edit: false, delete: false },
    movements: { view: true, create: false, edit: false, delete: false },
    suppliers: { view: false, create: false, edit: false, delete: false },
    purchaseOrders: { view: false, create: false, edit: false, delete: false },
    reports: { view: false },
    audit: { view: false },
  },
}

export function hasPermission(role: UserRole, entity: keyof Permission, action: string): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  const entityPermissions = permissions[entity] as any
  return entityPermissions?.[action] || false
}
