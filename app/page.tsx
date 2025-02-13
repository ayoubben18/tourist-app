import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import im1 from "../assets/Fes.webp";
import im2 from "../assets/Google_map.png";
import im3 from "../assets/Guided_Tours.jpg";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <main className="py-16 sm:py-24">
          {/* Hero Section */}
          <header className="text-center mb-20">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent mb-6 leading-tight">
              Discover Morocco Like Never Before
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Plan your journey through breathtaking landscapes, rich culture,
              and historical monuments. Your perfect Moroccan adventure awaits.
            </p>
          </header>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {[
              {
                title: "Historical Monuments",
                description:
                  "Explore Morocco's rich history through its iconic landmarks",
                image: im1,
                buttonText: "Learn More",
              },
              {
                title: "Optimal Circuits",
                description:
                  "Create the most efficient and enjoyable circuits across Morocco",
                image: im2,
                buttonText: "Plan Route",
              },
              {
                title: "Guided Tours",
                description: "Experience Morocco with our expert local guides",
                image: im3,
                buttonText: "Find a Guide",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-none bg-white/50 backdrop-blur-sm"
              >
                <CardHeader>
                  <div className="relative h-64 mb-4 overflow-hidden rounded-t-xl">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-lg">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    {feature.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Testimonials Section */}
          <section className="mb-24">
            <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent mb-12">
              What Our Visitors Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sophia Martinez",
                  role: "Adventure Traveler",
                  quote:
                    "Morocco's diversity is unmatched! A truly magical experience.",
                },
                {
                  name: "Liam Brown",
                  role: "Photography Enthusiast",
                  quote:
                    "From the Sahara to the Atlas Mountains, it was incredible.",
                },
                {
                  name: "Emma Wilson",
                  role: "Cultural Explorer",
                  quote:
                    "The guided tours and circuits were perfectly planned.",
                },
              ].map((testimonial, index) => (
                <Card
                  key={index}
                  className="bg-white/50 backdrop-blur-sm border-none hover:shadow-lg transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600" />
                      <div>
                        <CardTitle className="text-xl font-semibold text-gray-900">
                          {testimonial.name}
                        </CardTitle>
                        <CardDescription className="text-purple-600">
                          {testimonial.role}
                        </CardDescription>
                      </div>
                    </div>
                    <blockquote className="mt-4 text-gray-600 italic">
                      "{testimonial.quote}"
                    </blockquote>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
