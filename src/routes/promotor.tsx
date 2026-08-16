import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Sidebar } from "@/components/layout/Sidebar";

export const Route = createFileRoute("/promotor")({
  component: PromotorLayout,
});

function PromotorLayout() {
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
