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
import { ROUTES } from "@/routes";
import { useRouter } from "next/navigation";
import { useAuth, useIsAuthenticated } from "@/hooks/use-auth";
import { LogOut } from "lucide-react";
import { Moon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {  useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import useQueryCacheKeys from "@/utils/use-query-cache-keys";
import { isUserAuthenticated } from '@/services/database';

const navLinks: { title: string; href: string }[] = [
  { title: "Home", href: ROUTES.public.home },
  { title: "Circuits", href: ROUTES.public.publicCircuits },
  { title: "About", href: ROUTES.public.about },
  { title: "Contact", href: ROUTES.public.contact },
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
  const router = useRouter();
  const { isAuthenticated, isAuthenticatedLoading } = useIsAuthenticated()

  return (
    <div className=" flex items-center justify-between p-6">
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
        </NavigationMenuList>
      </NavigationMenu>

      {/* Call to Action Button */}
      {isAuthenticatedLoading ? (
        <Skeleton className=" h-10 w-20 rounded-full" />
      ) : isAuthenticated?.isAuthenticated ? (
        <UserNav />
      ) : (
        <div className="flex gap-4">
          <Button
            variant={"outline"}
            onClick={() => router.push(ROUTES.auth.signIn)}
          >
            Sign In
          </Button>
          <Button onClick={() => router.push(ROUTES.auth.touristRegister)}>
            Sign Up
          </Button>
        </div>
      )}

      {/* Mobile Menu */}
      {/* <div className="md:hidden">
        <MobileMenu navLinks={navLinks} featureLinks={featureLinks} />
      </div> */}
    </div>
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

export function UserNav() {
  const router = useRouter();
  const { userInfo, signOut, isSigningOut } = useAuth();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    await signOut();
    queryClient.invalidateQueries({ queryKey: ["isAuthenticated"] });
    queryClient.invalidateQueries({ queryKey: useQueryCacheKeys.isFavorite });
    queryClient.invalidateQueries({ queryKey: useQueryCacheKeys.isLiked });
    queryClient.invalidateQueries({ queryKey: useQueryCacheKeys.isUserAuthenticated });
    router.push(ROUTES.public.home);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="h-10 w-10">
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={userInfo?.avatar_url || ""}
              alt={userInfo?.full_name || ""}
            />
            <AvatarFallback>
              {userInfo?.full_name
                ?.split(" ")
                .map((name: string) => name[0])
                .join("")
                .toUpperCase() ?? "??"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {userInfo?.full_name}
            </p>
            <p className="text-xs text-muted-foreground">{userInfo?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => router.push(ROUTES.private.profile)}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark Mode</span>
          {/* Add your dark mode toggle implementation here */}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
