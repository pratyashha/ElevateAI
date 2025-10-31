"use client";

import React from "react";
import { Button } from "@/components/ui/button";

import {
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
} from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  PenBox,
  StarsIcon,
  FileText,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const Header = () => {
  
  return (
    <header className="fixed top-0 left-0 right-0 w-full border-b bg-background/80 backdrop-blur-md z-50 shadow-md m-0 p-0">
      <nav className="flex items-center justify-between h-16 w-full pl-2 sm:pl-4 lg:pl-6 pr-4 sm:pr-6 lg:pr-8 m-0">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image
              src="/logo.png"
              alt="Logo"
              width={180}
              height={40}
              className="object-contain"
              priority
            />
          </Link>

          {/* Right side */}
          <div className="flex items-center justify-end gap-2 md:gap-4 pr-2 sm:pr-0">
            <SignedIn>
              <Link href="/dashboard">
                <Button variant="outline" className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5" />
                  <span className="hidden md:block">Industry Insights</span>
                </Button>
              </Link>

              {/* Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <StarsIcon className="h-5 w-5" />
                    <span className="hidden md:block">Growth Tools</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/resume" className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      <span>Build Resume</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/cover-letter" className="flex items-center gap-2">
                      <PenBox className="h-5 w-5" />
                      <span>Cover Letter</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/interview" className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      <span>Interview Prep</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="pl-2 sm:pl-3">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-10 h-10",
                      userButtonPopoverCard: "shadow-xl",
                      userPreviewIdentifier: "font-semibold text-lg",
                    },
                  }}
                  afterSignOutUrl="/"
                />
              </div>
            </SignedIn>

            <SignedOut>
              <div className="pl-2 sm:pl-3">
                <SignInButton mode="modal">
                  <Button variant="outline" className="whitespace-nowrap">Sign In</Button>
                </SignInButton>
              </div>
            </SignedOut>
          </div>
        </nav>
    </header>
  );
}
export default Header;
