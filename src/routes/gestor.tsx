import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { ProfileErrorState } from "@/components/auth/ProfileErrorState";

export const Route = createFileRoute("/gestor")({
  component: GestorLayout,
});

function GestorLayout() {
  const { user, profile, isLoading, profileError } = useAuth();

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

  if (profileError || !profile) {
    return <ProfileErrorState />;
  }

  if (profile.tipo !== "gestor") {
    // Evita redirecionamento se já estiver na rota certa
    return <Navigate to="/promotor/roteiro" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar type="gestor" />
      <main className="md:pl-64 min-h-screen transition-all duration-300">
        <div className="container mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
