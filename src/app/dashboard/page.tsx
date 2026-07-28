import { auth, signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
    const session = await auth()

    async function handleSignOut() {
        "use server"
        await signOut({ redirectTo: "/login" })
    }

    return (
        <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-4 py-10">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
                <form action={handleSignOut}>
                    <Button type="submit" variant="outline" size="sm">
                        Sign out
                    </Button>
                </form>
            </div>

            <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 text-sm">
                <div>
                    <span className="text-muted-foreground">Name: </span>
                    {session?.user?.name}
                </div>
                <div>
                    <span className="text-muted-foreground">Email: </span>
                    {session?.user?.email}
                </div>
                <div>
                    <span className="text-muted-foreground">Roles: </span>
                    {session?.user?.roles?.join(", ") || "none"}
                </div>
                <div>
                    <span className="text-muted-foreground">Permissions: </span>
                    {session?.user?.permissions?.length ?? 0} granted
                </div>
            </div>
        </div>
    )
}