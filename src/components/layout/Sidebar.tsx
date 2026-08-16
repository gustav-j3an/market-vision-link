import React from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import { 
  LayoutDashboard, 
  BarChart3, 
  MapPin, 
  Package, 
  Users, 
  FileText, 
  Settings,
  Route as RouteIcon,
  LogOut
} from "lucide-react";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
}

const SidebarItem = ({ icon: Icon, label, href, active }: SidebarItemProps) => (
  <Link
    to={href as any}
    className={cn(
      "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
      active 
        ? "bg-sidebar-primary text-sidebar-primary-foreground" 
        : "text-sidebar-foreground hover:bg-sidebar-accent"
    )}
  >
    <Icon size={20} />
    <span>{label}</span>
  </Link>
);

export function Sidebar({ type = "gestor" }: { type?: "gestor" | "promotor" }) {
  const location = useLocation();
  
  const gestorItems = [
    { icon: LayoutDashboard, label: "Visão Geral", href: "/gestor/dashboard" },
    { icon: BarChart3, label: "Analytics", href: "/gestor/analytics" },
    { icon: MapPin, label: "Lojas", href: "/gestor/lojas" },
    { icon: Package, label: "Produtos", href: "/gestor/produtos" },
    { icon: Users, label: "Promotores", href: "/gestor/promotores" },
    { icon: FileText, label: "Relatórios", href: "/gestor/relatorios" },
  ];

  const promotorItems = [
    { icon: RouteIcon, label: "Meu Roteiro", href: "/promotor/roteiro" },
    { icon: MapPin, label: "Lojas Próximas", href: "/promotor/lojas" },
    { icon: FileText, label: "Meu Histórico", href: "/promotor/historico" },
  ];

  const items = type === "gestor" ? gestorItems : promotorItems;

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border md:flex">
      <div className="flex items-center justify-center p-6 border-b border-sidebar-border">
        <h2 className="text-xl font-bold text-sidebar-primary">TradeVision</h2>
      </div>
      
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {items.map((item) => (
          <SidebarItem 
            key={item.href} 
            {...item} 
            active={location.pathname === item.href} 
          />
        ))}
      </nav>
      
      <div className="p-4 border-t border-sidebar-border space-y-1">
        <SidebarItem icon={Settings} label="Configurações" href="/settings" />
        <SidebarItem icon={LogOut} label="Sair" href="/" />
      </div>
    </aside>
  );
}
