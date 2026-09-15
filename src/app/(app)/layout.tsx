import { Sidebar } from "@/components/shell/sidebar";
import { BottomNav } from "@/components/shell/bottom-nav";
import { QuickLogButton } from "@/components/shell/quick-log-button";

// Todo esto lee la base de datos y depende de la fecha de hoy: nunca debe quedar
// cacheado como página estática entre despliegues.
export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex min-h-screen w-full flex-1 flex-col">
        <main className="flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-10">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
      <BottomNav />
      <QuickLogButton />
    </div>
  );
}
