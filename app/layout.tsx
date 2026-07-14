import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ScrollProgress from '@/components/common/ScrollProgress';
import TopNav from '@/components/common/TopNav';
import BottomNav from '@/components/common/BottomNav';
import { AuthProvider } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Career Navigator",
  description: "AI-powered resume analyzer and career roadmap generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col md:pb-0 pb-12"><ScrollProgress />
<AuthProvider>
<ThemeProvider>
<TopNav />
<div className="pt-10 md:pt-10">
{children}
</div>
<BottomNav />
</ThemeProvider>
</AuthProvider></body>
    </html>
  );
}
