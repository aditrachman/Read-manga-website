import "./globals.css";
import Navbar from "./components/Navbar";

export default function Layout({ children }) {
  return (
    <html lang="id">
      <body className="bg-[#0a0d14] text-white relative">
        {/* Navbar di atas semua elemen */}
        <div className="relative z-20">
          <Navbar />
        </div>

        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#05080f] via-[#0a0d14] to-[#161b2e]"></div>

        {/* Efek Blur & Glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-indigo-500 blur-[150px] opacity-30"></div>
          <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-[300px] h-[300px] bg-purple-700 blur-[150px] opacity-30"></div>
        </div>

        {/* Konten Halaman */}
        <main className="relative z-10 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
