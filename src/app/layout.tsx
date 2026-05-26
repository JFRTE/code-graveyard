import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "代码火葬场 - Code Graveyard",
  description: "一个专门用来埋葬代码的地方。每段代码都值得一个体面的葬礼。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <ThemeProvider>
          <SessionProvider>
            <Navbar />
            <main className="pt-16">{children}</main>
            <div className="fog-effect" />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
