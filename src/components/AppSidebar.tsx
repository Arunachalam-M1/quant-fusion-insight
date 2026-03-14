import { BarChart3, Activity, Layers, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";

export type Section = "chart" | "indicators" | "options" | "stats";

const navItems: { id: Section; icon: React.ElementType; label: string }[] = [
  { id: "chart", icon: BarChart3, label: "Chart" },
  { id: "indicators", icon: Activity, label: "Indicators" },
  { id: "options", icon: Layers, label: "Options" },
  { id: "stats", icon: PieChart, label: "Stats" },
];

interface AppSidebarProps {
  active: Section;
  onChange: (s: Section) => void;
}

export function AppSidebar({ active, onChange }: AppSidebarProps) {
  return (
    <aside className="w-16 min-h-screen bg-sidebar border-r border-panel-border flex flex-col items-center py-6 gap-1">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={cn(
            "w-11 h-11 rounded flex items-center justify-center transition-colors group relative",
            active === item.id
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          )}
          title={item.label}
        >
          <item.icon className="h-5 w-5" />
          <span className="absolute left-14 bg-panel border border-panel-border text-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap font-mono transition-opacity z-50">
            {item.label}
          </span>
        </button>
      ))}
    </aside>
  );
}
