import { PrismaClient } from "../generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

const { Pool } = pg

const globalForPrisma = globalThis as unknown as {
    prisma: InstanceType<typeof PrismaClient> | undefined
    pool: pg.Pool | undefined
}

const pool =
    globalForPrisma.pool ??
    new Pool({
        connectionString: process.env.DATABASE_URL,
    })

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool
}

const adapter = new PrismaPg(pool)

function createPrismaClient() {
    return new PrismaClient({
        adapter,
        log:
            process.env.NODE_ENV === "development"
                ? ["query", "error", "warn"]
                : ["error"],
    })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = prisma as any

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma
}