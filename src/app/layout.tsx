import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/frontend/components/ui/toaster";
import { ThemeProvider } from "@/frontend/components/theme-provider";
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: "Domain Manager",
  description: "Sistem Pengelolaan Domain Pemerintah Daerah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable}`}>
      <body className="font-body antialiased">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

    