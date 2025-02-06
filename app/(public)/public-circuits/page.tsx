import React from "react";
import { Plus } from "lucide-react";
import { SearchAndFilters, CircuitCard } from "@/components/(public)/public-circuits";

const SAMPLE_ROUTES = [
  {
    title: "Historic Paris Walking Tour",
    description:
      "Discover the hidden gems of Paris's historic center, from Notre-Dame to the Latin Quarter.",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
    duration: "3 hours",
    distance: "4.5 km",
    creator: "Marie Dubois",
    rating: 4.8,
  },
  {
    title: "Montmartre Art Trail",
    description:
      "Follow in the footsteps of famous artists through the charming streets of Montmartre.",
    image: "https://images.unsplash.com/photo-1503917988258-f87a78e3c995",
    duration: "2.5 hours",
    distance: "3 km",
    creator: "Jean Martin",
    rating: 4.6,
  },
  {
    title: "Loire Valley Châteaux",
    description:
      "A scenic route connecting the most beautiful castles of the Loire Valley.",
    image: "https://images.unsplash.com/photo-1534787238916-9ba6764efd4f",
    duration: "8 hours",
    distance: "120 km",
    creator: "Pierre Laurent",
    rating: 4.9,
  },
  {
    title: "Provence Lavender Fields",
    description:
      "Experience the beauty of Provence's purple landscapes and charming villages.",
    image: "https://images.unsplash.com/photo-1534787238916-9ba6764efd4f",
    duration: "6 hours",
    distance: "80 km",
    creator: "Sophie Bernard",
    rating: 4.7,
  },
];
export default function App() {
  return (
    <main className="min-h-screen w-full bg-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">
            Discover public circuits
          </h1>
          <button
            // onClick={() => {
            //   /* Navigate to create route page */
            // }}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium"
          >
            <Plus className="w-5 h-5" />
            Create Your Own
          </button>
        </div>
        <SearchAndFilters />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {SAMPLE_ROUTES.map((route, index) => (
            <CircuitCard key={index} {...route} />
          ))}
        </div>
      </div>
    </main>
  );
}
