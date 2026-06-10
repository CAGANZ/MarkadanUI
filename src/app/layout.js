// src/app/layout.js
import "./globals.css";
import Header from "@/components/Header";
import Providers from "./providers";
import { BOUTIQUE } from "@/config/boutique";

export const metadata = {
  title: {
    default: BOUTIQUE.name,
    template: `%s | ${BOUTIQUE.name}`,
  },
  description: BOUTIQUE.tagline,
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className="flex min-h-screen flex-col bg-surface text-ink">
        <Providers>
          {/* Global üst şerit */}
          <div className="sticky top-0 z-50 border-b border-line bg-surface-card/90 backdrop-blur">
            <Header />
          </div>

          {/* Sayfa içeriği */}
          <main className="flex-1">{children}</main>

          {/* Global footer */}
          <footer className="border-t border-line bg-surface-card">
            <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-ink-soft sm:px-6">
              © {new Date().getFullYear()} {BOUTIQUE.name}
              {BOUTIQUE.contact.phone && ` · ${BOUTIQUE.contact.phone}`}
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
