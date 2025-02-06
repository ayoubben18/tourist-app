import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Navbar } from "@/components/(public)/home-page/NavBar";
import im1 from "../assets/Fes.webp";
import im2 from "../assets/Google_map.png";
import im3 from "../assets/Guided_Tours.jpg";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 flex flex-col justify-center items-center">
        <main className="py-10 px-4">
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-extrabold text-purple-800 mb-6">
              Discover Morocco Like Never Before
            </h1>
            <p className="text-lg md:text-xl text-gray-800 max-w-3xl mx-auto">
              Plan your journey, explore breathtaking landscapes, rich culture,
              and historical monuments. Whether you're an adventurer, a foodie,
              or a history enthusiast, Morocco has something for everyone.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl">
            <Card className="shadow-lg transition-transform transform hover:scale-105">
              <CardHeader>
                <CardTitle className="text-purple-800">
                  Historical Monuments
                </CardTitle>
                <CardDescription>
                  Explore Morocco's rich history through its iconic landmarks.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Image
                  src={im1}
                  alt="Historical Monument"
                  width={500}
                  height={350}
                  className="rounded-lg mb-4 object-cover h-48 w-full"
                />
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg w-full">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-lg transition-transform transform hover:scale-105">
              <CardHeader>
                <CardTitle className="text-purple-800">
                  Optimal Circuits
                </CardTitle>
                <CardDescription>
                  Create the most efficient and enjoyable circuits across
                  Morocco.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Image
                  src={im2}
                  alt="Optimal Circuit"
                  width={500}
                  height={350}
                  className="rounded-lg mb-4 object-cover h-48 w-full"
                />
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg w-full">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-lg transition-transform transform hover:scale-105">
              <CardHeader>
                <CardTitle className="text-purple-800">Guided Tours</CardTitle>
                <CardDescription>
                  Choose a professional guide to enrich your experience in
                  Morocco.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Image
                  src={im3}
                  alt="Guided Tour"
                  width={500}
                  height={350}
                  className="rounded-lg mb-4 object-cover h-48 w-full"
                />
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg w-full">
                  Find a Guide
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 max-w-7xl w-full">
            <h2 className="text-2xl md:text-4xl font-bold text-purple-800 text-center mb-8">
              What Our Visitors Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-purple-700">
                    Sophia Martinez
                  </CardTitle>
                  <CardDescription>
                    "Morocco's diversity is unmatched! A truly magical
                    experience."
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-purple-700">Liam Brown</CardTitle>
                  <CardDescription>
                    "From the Sahara to the Atlas Mountains, it was incredible."
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-purple-700">Emma Wilson</CardTitle>
                  <CardDescription>
                    "The guided tours and circuits were perfectly planned."
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </main>
        <footer className="mt-16 w-full bg-purple-800 text-white py-8 text-center">
          <div className="max-w-4xl mx-auto">
            <p className="text-lg font-semibold">
              Explore Morocco with ease and convenience.
            </p>
            <p className="text-sm mt-2">
              &copy; 2025 Your Company. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
