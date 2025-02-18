import { CardsGrid } from "@/components/(public)/public-circuits/cards-grid";
import { getPublicCircuits } from "@/services/database/circuits";
import { Plus } from "lucide-react";

export default async function App() {
  const data = await getPublicCircuits({});
  return (
    <main className="min-h-screen w-full bg-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">
            Discover public circuits
          </h1>
          <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium">
            <Plus className="w-5 h-5" />
            Create Your Own
          </button>
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
