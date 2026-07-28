import { LoginForm } from "@/features/auth/login-form"

export default function LoginPage() {
    return (
        <div className="flex min-h-svh items-center justify-center p-6">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground">
                        Sign in to AgencyOS
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Enter your credentials to continue
                    </p>
                </div>

                <LoginForm />
            </div>
        </div>
    )
}