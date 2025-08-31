// src/app/layout.js
import "./globals.css";
import Header from "@/components/Header";

export const metadata = {
  title: "Markadan",
  description: "E-shopping",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 text-neutral-900 flex flex-col">
        {/* Global üst şerit */}
        {/* Sticky istersen: 'sticky top-0' ekleyebilirsin */}
        <div className="relative z-50 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-neutral-200">
          <Header />
        </div>

        {/* Sayfa içeriği */}
        <main className="flex-1">
          {children}
        </main>

        {/* (Opsiyonel) Global footer alanı */}
        {/* <footer className="border-t border-neutral-200 bg-white/70">
          <div className="max-w-7xl mx-auto px-6 py-6 text-sm text-neutral-600">
            © {new Date().getFullYear()} Markadan
          </div>
        </footer> */}
      </body>
    </html>
  );
}
