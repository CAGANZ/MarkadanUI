// src/app/layout.js
import "./globals.css";
import Header from "@/components/layout/Header";
import MobileNav from "@/components/layout/MobileNav";
import Providers from "./providers";
import { getStoreSettings } from "@/lib/server/storeSettings";

export async function generateMetadata() {
  const store = await getStoreSettings();
  return {
    title: {
      default: store.name,
      template: `%s | ${store.name}`,
    },
    description: store.tagline,
  };
}

export default async function RootLayout({ children }) {
  const store = await getStoreSettings();
  return (
    <html lang="tr">
      <body className="flex min-h-screen flex-col bg-surface text-ink">
        <Providers>
          {/* Global üst şerit */}
          <div className="sticky top-0 z-50 border-b border-line bg-surface-card/90 backdrop-blur">
            <Header store={store} />
          </div>

          {/* Sayfa içeriği */}
          <main className="flex-1 pb-14 sm:pb-0">{children}</main>

          {/* Global footer */}
          <footer className="border-t border-line bg-surface-card">
            <div className="mx-auto max-w-7xl px-4 py-6 pb-20 text-sm text-ink-soft sm:px-6 sm:pb-6">
              © {new Date().getFullYear()} {store.name}
              {store.contact.phone && ` · ${store.contact.phone}`}
            </div>
          </footer>

          {/* Mobil alt navigasyon */}
          <MobileNav />
        </Providers>
      </body>
    </html>
  );
}
