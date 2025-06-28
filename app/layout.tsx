import type { Metadata } from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Header from "@/components/Header";
import {
  ClerkProvider,
  
} from '@clerk/nextjs' 
import { dark } from '@clerk/themes'
import { Toaster } from "sonner";


const inter=Inter({subsets:['latin']});

export const metadata: Metadata = {
  title: "Talent-Hive Ai Career Coach",
  description: "Smart Job search & Ai-Career Career Guidance system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <ClerkProvider appearance={{
          baseTheme: dark,
        }}>
    <html lang="en" suppressHydrationWarning>
      <body
       className={`${inter.className}`}
       >
      <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            

            
        <Header></Header>
        <main className="min-h-screen">
        {children}
        </main>
        <Toaster richColors />


        <footer className="bg-muted/50 py-12">
          <div className="container mx-auto px-4 text-center">Made with love by Team Shockwave</div>
        </footer>
        </ThemeProvider>
      </body>
    </html>
           </ClerkProvider>
  );
}
