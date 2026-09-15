"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Scale, Moon, Zap, Dumbbell, Footprints, Trophy, Utensils, Droplets, AlertTriangle, Ruler } from "lucide-react";
import { Sheet, SheetContent, SheetClose, SheetTrigger } from "@/components/ui/sheet";

const QUICK_ACTIONS = [
  { href: "/body/new", label: "Peso", icon: Scale },
  { href: "/body/new?field=waist", label: "Medidas", icon: Ruler },
  { href: "/sleep/new", label: "Sueño", icon: Moon },
  { href: "/checkin", label: "Fatiga (check-in)", icon: Zap },
  { href: "/gym/new", label: "Gym", icon: Dumbbell },
  { href: "/football/new", label: "Fútbol", icon: Footprints },
  { href: "/football/matches/new", label: "Partido", icon: Trophy },
  { href: "/nutrition/new", label: "Nutrición", icon: Utensils },
  { href: "/hydration/new", label: "Agua", icon: Droplets },
  { href: "/pain-check", label: "Dolor", icon: AlertTriangle },
];

export function QuickLogButton() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="no-print fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-lg shadow-brand/30 transition-transform active:scale-95 lg:bottom-8 lg:right-8"
          aria-label="Registrar"
        >
          <Plus className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent title="Registrar" description="Elegí qué querés cargar. Menos de 30 segundos.">
        <div className="grid grid-cols-2 gap-2 pb-2 pt-1">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <SheetClose asChild key={action.label}>
                <Link
                  href={action.href}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 py-4 text-sm font-medium text-foreground active:scale-95"
                >
                  <Icon className="h-5 w-5 text-brand" />
                  {action.label}
                </Link>
              </SheetClose>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
