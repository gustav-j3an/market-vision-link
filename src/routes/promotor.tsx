import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/promotor")({
  component: PromotorLayout,
});

function PromotorLayout() {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" />;
  }

  if (profile?.tipo !== "promotor") {
    return <Navigate to="/gestor/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar type="promotor" />
      <main className="md:pl-64 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>
      
      {/* Mobile Navigation Placeholder */}
      <nav className="fixed bottom-0 left-0 right-0 flex justify-around bg-card border-t p-2 md:hidden">
        {/* Adicionar ícones de navegação mobile aqui depois */}
      </nav>
    </div>
  );
}
