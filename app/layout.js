
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header  from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "@/components/ui/sonner";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

const inter = Inter({
  subsets: ["latin"]
})

export const metadata = {
  title: "CareerCrafter - AI Career Coach",
  description: "Your smart guide to career growth",
};

export default function RootLayout({ children }) {
  // Get Clerk publishable key (safe for build time)
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  // If Clerk key is missing during build, render without ClerkProvider (prevents build errors)
  if (!clerkPublishableKey) {
    console.warn("⚠️ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY not set (build-safe mode)");
    return (
      <html lang="en" suppressHydrationWarning={true}>
        <body suppressHydrationWarning className={`${inter.className}`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <main className="min-h-screen">{children}</main>
            <Toaster richColors />
            <footer className="bg-muted/50 py-12">
              <div className="container mx-auto pc-4 text-center text-gray-200">
                ~ Pratasha Tripathy
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    );
  }
  
  return (
    <ClerkProvider 
      publishableKey={clerkPublishableKey}
      appearance={{
        baseTheme: dark,
      }}>


    <html lang="en" webcrx="" suppressHydrationWarning={true}>
      <body
       suppressHydrationWarning
        className={` ${inter.className} `}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {/*header */}
            <Header/>
            <main className="min-h-screen">
              {children}
            </main>
            <Toaster richColors/>

            {/*footer */}
            <footer className="bg-muted/50 py-12">
              <div className="container mx-auto pc-4 text-center text-gray-200">
              ~ Pratasha Tripathy
            </div>
            </footer>
          </ThemeProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}

