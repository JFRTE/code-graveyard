import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import ToastContainer from "@/components/Toast";
import Particles from "@/components/Particles";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "代码火葬场 - Code Graveyard",
  description: "一个专门用来埋葬代码的地方。每段代码都值得一个体面的葬礼。",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "代码火葬场 - Code Graveyard",
    description: "一个专门用来埋葬代码的地方。每段代码都值得一个体面的葬礼。⚰️",
    url: "https://code-graveyard.vercel.app",
    siteName: "代码火葬场",
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: "代码火葬场 - Code Graveyard",
    description: "一个专门用来埋葬代码的地方。每段代码都值得一个体面的葬礼。⚰️",
  },
  metadataBase: new URL("https://code-graveyard.vercel.app"),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#030712" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <ThemeProvider>
          <SessionProvider>
            <Particles />
            <Navbar />
            <main className="pt-16 relative z-[2]">
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>
            <div className="fog-effect" />
            <ToastContainer />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
