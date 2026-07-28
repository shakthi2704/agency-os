
export const MODULES = [
    "leads",
    "proposals",
    "clients",
    "projects",
    "tasks",
    "tickets",
    "invoices",
    "documents",
    "users",
] as const

export const ACTIONS = ["create", "read", "update", "delete"] as const

export type Module = (typeof MODULES)[number]
export type Action = (typeof ACTIONS)[number]

/** e.g. "leads:create" — matches the format stored in the JWT's `permissions` array. */
export type PermissionKey = `${Module}:${Action}`

export function permissionKey(module: Module, action: Action): PermissionKey {
    return `${module}:${action}`
}