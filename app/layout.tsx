import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/providers/query-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Navbar } from "@/components/(public)/home-page/NavBar";
import Footer from "@/components/shared/footer";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tourist App",
  description: "This could be the last tourist app you'll ever need",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} container mx-auto `}
        >
          <Toaster
            richColors
            position="top-right"
            duration={2000}
            theme="light"
            visibleToasts={1}
          />
          <NuqsAdapter>
            <Suspense>
              <Navbar />
              {children}
              <Footer />
            </Suspense>
          </NuqsAdapter>
          <ReactQueryDevtools initialIsOpen={false} />
        </body>
      </html>
    </QueryProvider>
  );
}
