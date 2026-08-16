import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Sidebar } from "@/components/layout/Sidebar";

export const Route = createFileRoute("/gestor")({
  component: GestorLayout,
});

function GestorLayout() {
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
