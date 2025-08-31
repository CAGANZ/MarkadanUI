// src/lib/catalogMedia.js

// Tek yerden yönetilen kategori görselleri
export const categoryImages = {
  "Elektronik":
    "https://images.unsplash.com/photo-1590109738246-2af866338d35?q=80&w=2136&auto=format&fit=crop&ixlib=rb-4.1.0",
  "Ev & Yaşam":
    "https://images.unsplash.com/photo-1615874959474-d609969a20ed?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0",
  "Giyim":
    "https://images.unsplash.com/photo-1606844128209-80ba0f9afd34?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0",
  "Kişisel Bakım":
    "https://images.unsplash.com/photo-1559671216-bda69517c47f?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0",
  "Spor & Outdoor":
    "https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.1.0",

  // eklediklerin:
  "Bahçe & Yapı Market":
    "https://images.unsplash.com/photo-1721482112572-3529c7334e91?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0",
  "Evcil Hayvan":
    "https://images.unsplash.com/photo-1570841512619-7204069cf2e2?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0",
  "Mutfak Gereçleri":
    "https://images.unsplash.com/photo-1678852524356-08188528aed9?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0",
  "Ofis & Kırtasiye":
    "https://images.unsplash.com/photo-1721482112572-3529c7334e91?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0",
  "Otomotiv Aksesuar":
    "https://images.unsplash.com/photo-1678852524356-08188528aed9?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0",
  "Oyuncak & Oyun":
    "https://images.unsplash.com/photo-1570841512619-7204069cf2e2?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0",
  "Sağlık & Medikal":
    "https://images.unsplash.com/photo-1721482112572-3529c7334e91?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0",
};

// Tek yerden yönetilen marka görselleri
export const brandImages = {
  "LeadTech":
    "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
  "Ramingues":
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop",
  "Happie":
    "https://images.unsplash.com/photo-1544859450-08a01cd8208b?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0",
  "Inhale & Exhale":
    "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?q=80&w=1200&auto=format&fit=crop",
  "AutoMate":
    "https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=1200&auto=format&fit=crop",
};

// Ortak placeholder
export const PLACEHOLDER_CAT = "https://via.placeholder.com/600x600?text=Kategori";
export const PLACEHOLDER_BRAND = "https://via.placeholder.com/600x400?text=Marka";
export const PLACEHOLDER_PRODUCT = "https://via.placeholder.com/400x300?text=Ürün+Görseli";

// Yardımcılar
export function getCategoryImage(name) {
  return categoryImages[name] || PLACEHOLDER_CAT;
}

export function getBrandImage(name) {
  return brandImages[name] || PLACEHOLDER_BRAND;
}
