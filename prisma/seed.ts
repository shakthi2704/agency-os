import "dotenv/config"
import { db as prisma } from "../src/lib/prisma"

// ============================================
// Modules & actions covered by the permission matrix
// ============================================

const MODULES = [
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

const ACTIONS = ["create", "read", "update", "delete"] as const

type Module = (typeof MODULES)[number]
type Action = (typeof ACTIONS)[number]
type Access = "full" | "read" | "none"

// ============================================
// Role -> module -> access level matrix
// ============================================

const ROLE_MATRIX: Record<string, Partial<Record<Module, Access>>> = {
    SUPER_ADMIN: {
        leads: "full",
        proposals: "full",
        clients: "full",
        projects: "full",
        tasks: "full",
        tickets: "full",
        invoices: "full",
        documents: "full",
        users: "full",
    },
    ADMIN: {
        leads: "full",
        proposals: "full",
        clients: "full",
        projects: "full",
        tasks: "full",
        tickets: "full",
        invoices: "full",
        documents: "full",
        users: "full",
    },
    SALES: {
        leads: "full",
        proposals: "full",
        clients: "read",
        projects: "read",
        tasks: "none",
        tickets: "none",
        invoices: "none",
        documents: "none",
        users: "none",
    },
    PROJECT_MANAGER: {
        leads: "none",
        proposals: "none",
        clients: "read",
        projects: "full",
        tasks: "full",
        tickets: "full",
        invoices: "read",
        documents: "full",
        users: "none",
    },
    CONTENT_CREATOR: {
        leads: "none",
        proposals: "none",
        clients: "none",
        projects: "read",
        tasks: "full",
        tickets: "none",
        invoices: "none",
        documents: "full",
        users: "none",
    },
    DEVELOPER: {
        leads: "none",
        proposals: "none",
        clients: "none",
        projects: "read",
        tasks: "full",
        tickets: "read",
        invoices: "none",
        documents: "full",
        users: "none",
    },
}

// "full" -> all 4 actions, "read" -> read only, "none" -> no rows
function actionsForAccess(access: Access): Action[] {
    if (access === "full") return [...ACTIONS]
    if (access === "read") return ["read"]
    return []
}

async function main() {
    console.log("Seeding roles...")
    const roleRecords = await Promise.all(
        Object.keys(ROLE_MATRIX).map((roleName) =>
            prisma.role.upsert({
                where: { name: roleName as any },
                update: {},
                create: { name: roleName as any },
            })
        )
    )
    console.log(`  -> ${roleRecords.length} roles ready`)

    console.log("Seeding permissions...")
    const permissionRecords = await Promise.all(
        MODULES.flatMap((module) =>
            ACTIONS.map((action) =>
                prisma.permission.upsert({
                    where: { module_action: { module, action } },
                    update: {},
                    create: { module, action },
                })
            )
        )
    )
    console.log(`  -> ${permissionRecords.length} permissions ready`)

    const permissionLookup = new Map(
        permissionRecords.map((p) => [`${p.module}:${p.action}`, p.id])
    )
    const roleLookup = new Map(roleRecords.map((r) => [r.name, r.id]))

    console.log("Wiring role -> permission mappings...")
    let mappingCount = 0
    for (const [roleName, moduleAccess] of Object.entries(ROLE_MATRIX)) {
        const roleId = roleLookup.get(roleName as any)
        if (!roleId) continue

        for (const [module, access] of Object.entries(moduleAccess)) {
            const actions = actionsForAccess(access as Access)
            for (const action of actions) {
                const permissionId = permissionLookup.get(`${module}:${action}`)
                if (!permissionId) continue

                await prisma.rolePermission.upsert({
                    where: {
                        roleId_permissionId: { roleId, permissionId },
                    },
                    update: {},
                    create: { roleId, permissionId },
                })
                mappingCount++
            }
        }
    }
    console.log(`  -> ${mappingCount} role-permission mappings ready`)

    console.log("Seed complete.")
}

main()
    .catch((err) => {
        console.error(err)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })