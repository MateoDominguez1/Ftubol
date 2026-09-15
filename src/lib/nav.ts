import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CalendarDays,
  Dumbbell,
  ListChecks,
  TrendingUp,
  BarChart3,
  Trophy,
  Footprints,
  ShieldAlert,
  Scale,
  Camera,
  ShieldCheck,
  Moon,
  Utensils,
  Droplets,
  Flame,
  LineChart,
  CheckCircle2,
  Layers,
  Settings,
  Download,
  Sparkles,
  ClipboardList,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Principal",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/calendar", label: "Calendario", icon: CalendarDays },
      { href: "/insights", label: "Insights", icon: Sparkles },
      { href: "/weekly-review", label: "Revisión semanal", icon: ClipboardList },
    ],
  },
  {
    title: "Gimnasio",
    items: [
      { href: "/gym", label: "Sesiones", icon: Dumbbell },
      { href: "/gym/exercises", label: "Ejercicios", icon: ListChecks },
      { href: "/strength", label: "Fuerza", icon: TrendingUp },
      { href: "/volume", label: "Volumen", icon: BarChart3 },
      { href: "/prs", label: "Récords (PRs)", icon: Trophy },
    ],
  },
  {
    title: "Fútbol",
    items: [
      { href: "/football", label: "Entrenamientos", icon: Footprints },
      { href: "/football/matches", label: "Partidos", icon: Trophy },
    ],
  },
  {
    title: "Cuerpo",
    items: [
      { href: "/body", label: "Composición corporal", icon: Scale },
      { href: "/body/photos", label: "Fotos de progreso", icon: Camera },
      { href: "/core", label: "Core / Abdomen", icon: ShieldCheck },
      { href: "/injury-prevention", label: "Prevención de lesiones", icon: ShieldAlert },
    ],
  },
  {
    title: "Salud",
    items: [
      { href: "/sleep", label: "Sueño", icon: Moon },
      { href: "/nutrition", label: "Nutrición", icon: Utensils },
      { href: "/hydration", label: "Hidratación", icon: Droplets },
      { href: "/cutting", label: "Cutting progress", icon: Flame },
    ],
  },
  {
    title: "Progreso",
    items: [
      { href: "/progress", label: "Progreso", icon: LineChart },
      { href: "/consistency", label: "Consistencia", icon: CheckCircle2 },
      { href: "/phases", label: "Fases", icon: Layers },
    ],
  },
  {
    title: "Ajustes",
    items: [
      { href: "/settings", label: "Perfil y objetivos", icon: Settings },
      { href: "/export", label: "Exportar datos", icon: Download },
    ],
  },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Inicio", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendario", icon: CalendarDays },
  { href: "/gym", label: "Gym", icon: Dumbbell },
  { href: "/football", label: "Fútbol", icon: Footprints },
];
