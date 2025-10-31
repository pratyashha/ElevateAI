import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 min-h-screen">
      <h1 className="text-6xl font-bold py-4 mb-4">404 </h1>
      <h2 className="text-4xl font-semibold py-4 mb-4">Page Not Found</h2>
      <p className="text-gray-500 py-4">Oops!! The page you are looking for does not exist.</p>
      
      <Link href="/">
        <Button>Go to Home</Button>
      </Link>
    </div>
  )
}