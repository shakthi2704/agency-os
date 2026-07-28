import "dotenv/config"
import { db as prisma } from "../src/lib/prisma"
import { hash } from "bcryptjs"

const TEST_EMAIL = "admin@agencyos.local"
const TEST_PASSWORD = "Admin@12345"
const TEST_ROLE = "ADMIN"

async function main() {
    const role = await prisma.role.findUnique({ where: { name: TEST_ROLE } })
    if (!role) {
        throw new Error(
            `Role "${TEST_ROLE}" not found — run "pnpm prisma db seed" first.`
        )
    }

    const passwordHash = await hash(TEST_PASSWORD, 10)

    const user = await prisma.user.upsert({
        where: { email: TEST_EMAIL },
        update: { passwordHash },
        create: {
            name: "Test Admin",
            email: TEST_EMAIL,
            passwordHash,
        },
    })

    await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: role.id } },
        update: {},
        create: { userId: user.id, roleId: role.id },
    })

    console.log("Test ADMIN user ready:")
    console.log(`  email:    ${TEST_EMAIL}`)
    console.log(`  password: ${TEST_PASSWORD}`)
    console.log(`  userId:   ${user.id}`)
}

main()
    .catch((err) => {
        console.error(err)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })