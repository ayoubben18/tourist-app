"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const navLinks: { title: string; href: string }[] = [
  { title: "Home", href: "/" },
  { title: "News", href: "/news" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
];

const featureLinks: { title: string; href: string; description: string }[] = [
  {
    title: "Login",
    href: "/login",
    description: "Access your account to manage your data and preferences.",
  },
  {
    title: "Register",
    href: "/tourist-register",
    description: "Sign up to create an account and explore our features.",
  },
  {
    title: "FAQs",
    href: "/faqs",
    description: "Get answers to common questions and troubleshooting tips.",
  },
  {
    title: "Account Settings",
    href: "/settings",
    description: "Manage your account preferences and privacy settings.",
  },
];

export function Navbar() {
  return (
    <header className="w-full bg-white shadow-md">
      <nav className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-gray-900">Tourist App</span>
        </Link>

        {/* Navigation Menu */}
        <NavigationMenu>
          <NavigationMenuList className="hidden md:flex space-x-6">
            {/* Static Links */}
            {navLinks.map((link) => (
              <NavigationMenuItem key={link.title}>
                <Link href={link.href} legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    {link.title}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}

            {/* Dropdown Menu */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>Features</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 md:w-[500px] lg:grid-cols-2">
                  {featureLinks.map((feature) => (
                    <ListItem
                      key={feature.title}
                      title={feature.title}
                      href={feature.href}
                    >
                      {feature.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Call to Action Button */}
        <div className="flex gap-4">
          <div className="hidden md:block">
            <Link
              href="/sign-in"
              className="bg-white text-purple-600 border border-purple-600 px-4 py-2 rounded-lg hover:bg-purple-100"
            >
              Sign In
            </Link>
          </div>
          <div className="hidden md:block">
            <Link
              href="/tourist-register"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <MobileMenu navLinks={navLinks} featureLinks={featureLinks} />
        </div>
      </nav>
    </header>
  );
}

function MobileMenu({
  navLinks,
  featureLinks,
}: {
  navLinks: { title: string; href: string }[];
  featureLinks: { title: string; href: string; description: string }[];
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <span className="sr-only">Open menu</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </button>
      {open && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-md z-10">
          <ul className="flex flex-col space-y-4 p-6">
            {navLinks.map((link) => (
              <li key={link.title}>
                <Link
                  href={link.href}
                  className="block text-gray-800 hover:text-purple-600"
                >
                  {link.title}
                </Link>
              </li>
            ))}
            <li>
              <span className="block text-gray-800 font-semibold mb-2">
                Features
              </span>
              <ul className="space-y-2">
                {featureLinks.map((feature) => (
                  <li key={feature.title}>
                    <Link
                      href={feature.href}
                      className="block text-gray-600 hover:text-purple-600"
                    >
                      {feature.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium">{title}</div>
          <p className="text-sm text-gray-600">{children}</p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
