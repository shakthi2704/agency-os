import "dotenv/config"
import { db as prisma } from "../src/lib/prisma"

// ============================================
// Same matrix as seed.ts — kept in sync manually.
// If you ever change ROLE_MATRIX in seed.ts, update it here too.
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

const ROLE_MATRIX: Record<string, Partial<Record<Module, Access>>> = {
    SUPER_ADMIN: {
        leads: "full", proposals: "full", clients: "full", projects: "full",
        tasks: "full", tickets: "full", invoices: "full", documents: "full", users: "full",
    },
    ADMIN: {
        leads: "full", proposals: "full", clients: "full", projects: "full",
        tasks: "full", tickets: "full", invoices: "full", documents: "full", users: "full",
    },
    SALES: {
        leads: "full", proposals: "full", clients: "read", projects: "read",
        tasks: "none", tickets: "none", invoices: "none", documents: "none", users: "none",
    },
    PROJECT_MANAGER: {
        leads: "none", proposals: "none", clients: "read", projects: "full",
        tasks: "full", tickets: "full", invoices: "read", documents: "full", users: "none",
    },
    CONTENT_CREATOR: {
        leads: "none", proposals: "none", clients: "none", projects: "read",
        tasks: "full", tickets: "none", invoices: "none", documents: "full", users: "none",
    },
    DEVELOPER: {
        leads: "none", proposals: "none", clients: "none", projects: "read",
        tasks: "full", tickets: "read", invoices: "none", documents: "full", users: "none",
    },
}

function actionsForAccess(access: Access): Action[] {
    if (access === "full") return [...ACTIONS]
    if (access === "read") return ["read"]
    return []
}

function expectedKeysForRole(roleName: string): Set<string> {
    const moduleAccess = ROLE_MATRIX[roleName] ?? {}
    const keys = new Set<string>()
    for (const [module, access] of Object.entries(moduleAccess)) {
        for (const action of actionsForAccess(access as Access)) {
            keys.add(`${module}:${action}`)
        }
    }
    return keys
}

function diffSets(expected: Set<string>, actual: Set<string>) {
    const missing = [...expected].filter((k) => !actual.has(k))
    const extra = [...actual].filter((k) => !expected.has(k))
    return { missing, extra }
}

async function main() {
    let failures = 0

    // --- Counts ---
    const roleCount = await prisma.role.count()
    const permissionCount = await prisma.permission.count()
    const expectedPermissionCount = MODULES.length * ACTIONS.length

    console.log(`Roles in DB: ${roleCount} (expected ${Object.keys(ROLE_MATRIX).length})`)
    if (roleCount !== Object.keys(ROLE_MATRIX).length) failures++

    console.log(`Permissions in DB: ${permissionCount} (expected ${expectedPermissionCount})`)
    if (permissionCount !== expectedPermissionCount) failures++

    // --- Duplicate check (guards against non-idempotent seeding) ---
    const dupPermissions = await prisma.permission.groupBy({
        by: ["module", "action"],
        _count: { id: true },
        having: { id: { _count: { gt: 1 } } },
    })
    if (dupPermissions.length > 0) {
        console.log(`❌ Duplicate permissions found:`, dupPermissions)
        failures++
    } else {
        console.log(`No duplicate permissions.`)
    }

    // --- Per-role matrix check ---
    console.log("\nChecking role -> permission mappings against expected matrix...")
    const roles = await prisma.role.findMany({
        include: {
            rolePermissions: {
                include: { permission: true },
            },
        },
    })

    for (const role of roles) {
        const actualKeys = new Set<string>(
            role.rolePermissions.map((rp: any) => `${rp.permission.module}:${rp.permission.action}`)
        )
        const expectedKeys = expectedKeysForRole(role.name)
        const { missing, extra } = diffSets(expectedKeys, actualKeys)

        if (missing.length === 0 && extra.length === 0) {
            console.log(`  ✅ ${role.name}: ${actualKeys.size} permissions, matches matrix exactly`)
        } else {
            failures++
            console.log(`  ❌ ${role.name}: mismatch`)
            if (missing.length) console.log(`     missing: ${missing.join(", ")}`)
            if (extra.length) console.log(`     extra:   ${extra.join(", ")}`)
        }
    }

    console.log("\n" + (failures === 0 ? "✅ All checks passed." : `❌ ${failures} check(s) failed.`))
    process.exit(failures === 0 ? 0 : 1)
}

main()
    .catch((err) => {
        console.error(err)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })