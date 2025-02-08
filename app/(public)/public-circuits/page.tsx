import React from "react";
import { Plus } from "lucide-react";
import {
  SearchAndFilters,
  CircuitCard,
} from "@/components/(public)/public-circuits";
import { CircuitsDTO } from "@/dto/circuits-dto";
import { CardsGrid } from "@/components/(public)/public-circuits/CardsGrid";

const SAMPLE_ROUTES: CircuitsDTO[] = [
  {
    id: 1,
    name: "Historic Paris Walking Tour",
    description:
      "Discover the hidden gems of Paris's historic center, from Notre-Dame to the Latin Quarter.",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
    estimated_duration: 3,
    distance: "4.5",
    creator: "Marie Dubois",
    creator_avatar: "https://randomuser.me/api/portraits/women/32.jpg",
    city: "Paris",
    country: "France",
    rating: "4.8",
  },
  {
    id: 2,
    name: "Montmartre Art Trail",
    description:
      "Follow in the footsteps of famous artists through the charming streets of Montmartre.",
    image: "https://images.unsplash.com/photo-1503917988258-f87a78e3c995",

    estimated_duration: 2,
    distance: "3",
    creator: "Jean Martin",
    creator_avatar: "https://randomuser.me/api/portraits/men/44.jpg",
    city: "Paris",
    country: "France",

    rating: "4.6",
  },
  {
    id: 3,
    name: "Loire Valley Châteaux",
    description:
      "A scenic route connecting the most beautiful castles of the Loire Valley.",

    image: "https://images.unsplash.com/photo-1534787238916-9ba6764efd4f",

    estimated_duration: 8,
    distance: "120",
    creator: "Pierre Laurent",
    creator_avatar: "https://randomuser.me/api/portraits/men/78.jpg",
    city: "Paris",
    country: "France",
    rating: "4.9",
  },
  {
    id: 4,
    name: "Provence Lavender Fields",
    description:
      "Experience the beauty of Provence's purple landscapes and charming villages.",
    image:
      "https://www.travelmanagers.com.au/wp-content/uploads/2023/06/AdobeStock_286563877-1.jpeg",
    estimated_duration: 6,
    distance: "80",
    creator: "Sophie Bernard",
    creator_avatar: "https://randomuser.me/api/portraits/women/67.jpg",
    city: "Paris",
    country: "France",

    rating: "4.7",
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
        <CardsGrid />
      </div>
    </main>
  );
}
