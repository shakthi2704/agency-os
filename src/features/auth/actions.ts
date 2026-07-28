"use server"

import { AuthError } from "next-auth"
import { signIn } from "@/lib/auth"

export type LoginActionState = {
    error: string | null
}

export async function loginAction(
    _prevState: LoginActionState,
    formData: FormData
): Promise<LoginActionState> {
    const email = formData.get("email")
    const password = formData.get("password")

    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/dashboard",
        })
        return { error: null }
    } catch (error) {
        // NOTE: signIn() throws a NEXT_REDIRECT error internally on success —
        // that must NOT be swallowed here, only genuine auth failures should be.
        if (error instanceof AuthError) {
            return { error: "Invalid email or password." }
        }
        throw error
    }
}