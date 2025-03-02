import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer"; // Import Footer

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Moco Manga",
  description: "Website manga terbaik untuk membaca manga secara gratis.",
  icons: {
    icon: "/logo.ico", // Path ke file favicon Anda
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.className}>
      <body className="bg-[#0a0d14] text-white flex flex-col min-h-screen">
        {/* Background & Efek Glow */}
        <BackgroundEffects />

        {/* Navbar */}
        <div className="relative z-20">
          <Navbar />
        </div>

        {/* Konten Halaman */}
        <main className="relative z-10 flex-grow">{children}</main>

        {/* Footer */}
        <div className="relative z-10">
          <Footer />
        </div>

        {/* Analytics */}
        <Analytics />
      </body>
    </html>
  );
}

function BackgroundEffects() {
  return (
    <>
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#05080f] via-[#0a0d14] to-[#161b2e] z-0"></div>

      {/* Efek Blur & Glow */}
      <div className="fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-indigo-500 blur-[150px] opacity-30"></div>
        <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-[300px] h-[300px] bg-purple-700 blur-[150px] opacity-30"></div>
      </div>
    </>
  );
}
