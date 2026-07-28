import "dotenv/config"
import { db as prisma } from "../src/lib/prisma"
import { compare } from "bcryptjs"

const TEST_EMAIL = "admin@agencyos.local"
const TEST_PASSWORD = "Admin@12345"
const WRONG_PASSWORD = "not-the-password"

async function attemptLogin(email: string, password: string) {
    // --- mirrors authorize() in src/lib/auth.ts ---
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) return null

    const passwordMatch = await compare(password, user.passwordHash)
    if (!passwordMatch) return null

    return user
}

async function buildTokenClaims(userId: string) {
    // --- mirrors the jwt() callback in src/lib/auth.ts ---
    const userRoles = await prisma.userRole.findMany({
        where: { userId },
        include: {
            role: {
                include: {
                    rolePermissions: {
                        include: { permission: true },
                    },
                },
            },
        },
    })

    const roleNames = new Set<string>()
    const permissionKeys = new Set<string>()

    for (const userRole of userRoles) {
        roleNames.add(userRole.role.name)
        for (const rp of userRole.role.rolePermissions) {
            permissionKeys.add(`${rp.permission.module}:${rp.permission.action}`)
        }
    }

    return { roles: [...roleNames], permissions: [...permissionKeys] }
}

async function main() {
    console.log("--- Wrong password should fail ---")
    const failedAttempt = await attemptLogin(TEST_EMAIL, WRONG_PASSWORD)
    console.log("Login result:", failedAttempt === null ? "null (correctly rejected)" : "❌ UNEXPECTED SUCCESS")

    console.log("\n--- Correct password should succeed ---")
    const user = await attemptLogin(TEST_EMAIL, TEST_PASSWORD)
    if (!user) {
        console.log("❌ Login failed unexpectedly")
        process.exit(1)
    }
    console.log("Login result: success, userId =", user.id)

    console.log("\n--- Token claims (roles + permissions) ---")
    const claims = await buildTokenClaims(user.id)
    console.log("roles:", claims.roles)
    console.log("permission count:", claims.permissions.length)

    const isAdmin = claims.roles.includes("ADMIN")
    const hasAllPermissions = claims.permissions.length === 36
    console.log("\n" + (isAdmin && hasAllPermissions
        ? "✅ Test user correctly resolves to ADMIN with all 36 permissions."
        : "❌ Something is off — check role assignment or seed data."))
}

main()
    .catch((err) => {
        console.error(err)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })