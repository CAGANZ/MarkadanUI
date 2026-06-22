// src/lib/server/storeSettings.js
// GET /store-settings → 60 sn cache. Hata veya offline durumda boutique.js fallback.
import { BOUTIQUE } from "@/config/boutique";

const BASE = (process.env.API_BASE_URL || "").replace(/\/$/, "");

export async function getStoreSettings() {
  try {
    const res = await fetch(`${BASE}/store-settings`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return BOUTIQUE;
    const data = await res.json();
    return {
      name: data.storeName || BOUTIQUE.name,
      tagline: BOUTIQUE.tagline,
      logoUrl: data.logoUrl || BOUTIQUE.logoUrl,
      whatsappPhone: data.whatsappPhone || BOUTIQUE.whatsappPhone,
      currency: data.currency || BOUTIQUE.currency,
      locale: BOUTIQUE.locale,
      contact: {
        ...BOUTIQUE.contact,
        instagram: data.instagramUrl || BOUTIQUE.contact.instagram,
      },
    };
  } catch {
    return BOUTIQUE;
  }
}
