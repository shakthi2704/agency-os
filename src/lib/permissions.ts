import type { Session } from "next-auth"
import { type Module, type Action, permissionKey } from "../config/permissions"

/**
 * Thrown by requirePermission/requireRole when the check fails.
 * Catch this in Server Actions / Route Handlers to return a 403.
 */
export class AuthorizationError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "AuthorizationError"
    }
}

/**
 * Checks the session's baked-in permission list — no DB call.
 * Permissions are populated once at login (see src/lib/auth.ts jwt callback)
 * and won't reflect role changes until the user's session refreshes.
 */
export function can(
    session: Session | null | undefined,
    module: Module,
    action: Action
): boolean {
    if (!session?.user?.permissions) return false
    return session.user.permissions.includes(permissionKey(module, action))
}

/** Checks whether the user holds a given role (e.g. "ADMIN", "SALES"). */
export function hasRole(session: Session | null | undefined, role: string): boolean {
    if (!session?.user?.roles) return false
    return session.user.roles.includes(role)
}

/**
 * Throws AuthorizationError if the check fails. Use at the top of
 * Server Actions / Route Handlers to short-circuit unauthorized requests.
 */
export function requirePermission(
    session: Session | null | undefined,
    module: Module,
    action: Action
): void {
    if (!can(session, module, action)) {
        throw new AuthorizationError(
            `Forbidden: missing permission "${permissionKey(module, action)}"`
        )
    }
}

export function requireRole(
    session: Session | null | undefined,
    role: string
): void {
    if (!hasRole(session, role)) {
        throw new AuthorizationError(`Forbidden: missing role "${role}"`)
    }
}