import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/promotor/roteiro")({
  component: Roteiro,
});

function Roteiro() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Roteiro de Visitas</h1>
      <p>Aqui você encontrará suas visitas do dia.</p>
    </div>
  );
}
