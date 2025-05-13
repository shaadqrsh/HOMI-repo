"use client";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "highlight.js/styles/atom-one-dark.css";
import { Poppins } from "next/font/google";
import "./globals.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 900000,
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
      retry: 3,
      staleTime: 900000,
      gcTime: 900000,
    },
  },
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--pop",
});

const fonts = `${poppins.className}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <title>HOMI</title>
      </head>
      <body className={cn(fonts, "dark:bg-spanish-roast")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="homi-theme"
          disableTransitionOnChange
        >
          <QueryClientProvider client={queryClient}>
            <Toaster />
            {children}
            {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
