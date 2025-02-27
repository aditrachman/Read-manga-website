import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export default function Layout({ children }) {
  return (
    <html lang="id" className={inter.className}>
      <body className="bg-[#0a0d14] text-white relative min-h-screen">
        {/* Navbar */}
        <div className="relative z-20">
          <Navbar />
        </div>

        {/* Background & Efek Glow */}
        <BackgroundEffects />

        {/* Konten Halaman */}
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}

function BackgroundEffects() {
  return (
    <>
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#05080f] via-[#0a0d14] to-[#161b2e]"></div>

      {/* Efek Blur & Glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-indigo-500 blur-[150px] opacity-30"></div>
        <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-[300px] h-[300px] bg-purple-700 blur-[150px] opacity-30"></div>
      </div>
    </>
  );
}
