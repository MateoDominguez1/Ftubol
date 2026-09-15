import { Trophy } from "lucide-react";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-6">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/15 text-brand">
          <Trophy className="h-7 w-7" />
        </div>
        <div className="text-center">
          <h1 className="text-lg font-semibold">Football Performance Dashboard</h1>
          <p className="text-sm text-muted">App personal — ingresá tu PIN</p>
        </div>
      </div>
      <div className="w-full max-w-xs">
        <LoginForm next={next ?? "/"} />
      </div>
    </main>
  );
}
