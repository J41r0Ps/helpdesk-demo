export default async function TicketsPage() {
  const nu = new Date().toLocaleTimeString("nl-BE");
  console.log("🟢 Deze log verschijnt op de SERVER om", nu);
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Tickets</h1>
      <p>Pagina gemaakt op de server om {nu}</p>
    </main>
  );
}