import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "../lib/prisma"
import { compare } from "bcryptjs"
import { z } from "zod"

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adapter: PrismaAdapter(prisma as any),
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id

                const userRoles = await (prisma as any).userRole.findMany({
                    where: { userId: user.id },
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

                token.roles = [...roleNames]
                token.permissions = [...permissionKeys]
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string
                session.user.roles = (token.roles as string[]) ?? []
                session.user.permissions = (token.permissions as string[]) ?? []
            }
            return session
        },
    },
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const parsed = loginSchema.safeParse(credentials)
                if (!parsed.success) return null

                const user = await (prisma as any).user.findUnique({
                    where: { email: parsed.data.email },
                })

                if (!user || !user.passwordHash) return null

                const passwordMatch = await compare(
                    parsed.data.password,
                    user.passwordHash
                )

                if (!passwordMatch) return null

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                }
            },
        }),
    ],
})