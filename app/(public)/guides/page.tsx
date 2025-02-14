import { GuidesCardsGrid } from "@/components/(public)/guides/GuidesCardsGrid";
import { getGuides } from "@/services/database/guide";

export default async function App() {
  const data = await getGuides({});
  return (
    <main className="min-h-screen w-full bg-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">
            Discover all guides 
          </h1>
        </div>
        <GuidesCardsGrid initialData={data} />
      </div>
    </main>
  );
}
