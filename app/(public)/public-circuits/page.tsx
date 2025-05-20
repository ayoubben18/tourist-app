import { CardsGrid } from "@/components/(public)/public-circuits/cards-grid";
import CreateCircuitButton from "@/components/(public)/public-circuits/create-circuit-button";
import { getPublicCircuits } from "@/services/database/circuits";

export const dynamic = "force-dynamic";

export default async function App() {
  const data = await getPublicCircuits({});
  return (
    <main className="min-h-screen w-full bg-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">
            Discover public circuits
          </h1>
          <CreateCircuitButton />
        </div>
        {/* <SearchAndFilters /> */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {SAMPLE_ROUTES.map((route, index) => (
            <CircuitCard key={index} circuit={route} />
          ))}
        </div> */}
        <CardsGrid initialData={data} />
      </div>
    </main>
  );
}
