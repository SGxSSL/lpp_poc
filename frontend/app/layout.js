import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AI Lead Prioritization Dashboard",
  description: "AI-powered CRM for lead insights and prioritization",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        {/* Wrap the sidebar and content inside a flex container */}
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-6 md:ml-[280px] transition-all duration-300">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
