
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from "@/components/theme-provider";
import Header  from "@/components/header";
import { Toaster } from "@/components/ui/sonner";
import { OnboardingStatusProvider } from "@/components/onboarding-status-provider";

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
  title: "Elevate AI - AI Career Coach",
  description: "Your smart guide to career growth",
  icons: {
    icon: '/fav.svg',
    shortcut: '/fav.svg',
    apple: '/fav.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning={true}>
        <body suppressHydrationWarning className={`${inter.className}`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <OnboardingStatusProvider>
              <Header />
              <main className="min-h-screen">
                {children}
              </main>
              <Toaster richColors/>

              <footer className="bg-muted/50 py-12">
                <div className="container mx-auto pc-4 text-center text-gray-200">
                  ~ Pratasha Tripathy
                </div>
              </footer>
            </OnboardingStatusProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

