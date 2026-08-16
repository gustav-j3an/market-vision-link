import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/gestor/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard do Gestor</h1>
      <p>Bem-vindo ao painel analítico do TradeVision.</p>
    </div>
  );
}
