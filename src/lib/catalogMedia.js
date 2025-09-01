// ... (mevcut name->url maplerin kalsın, silme)

// ID -> URL eşleme
export const categoryImagesById = {
  1: "https://images.unsplash.com/photo-1590109738246-2af866338d35?q=80&w=2136&auto=format&fit=crop", // Elektronik
  2: "https://images.unsplash.com/photo-1606844128209-80ba0f9afd34?q=80&w=2080&auto=format&fit=crop", // Giyim
  3: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?q=80&w=880&auto=format&fit=crop",  // Ev & Yaşam
  4: "https://images.unsplash.com/photo-1559671216-bda69517c47f?q=80&w=2080&auto=format&fit=crop",    // Kişisel Bakım
  5: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=2073&auto=format&fit=crop",  // Spor & Outdoor
};

export const brandImagesById = {
  1: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop", // LeadTech
  2: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop", // Ramingues
  3: "https://images.unsplash.com/photo-1544859450-08a01cd8208b?q=80&w=2080&auto=format&fit=crop",   // Happie
  4: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?q=80&w=1200&auto=format&fit=crop", // Inhale & Exhale
  11:"https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=1200&auto=format&fit=crop",   // AutoMate
};

export const PLACEHOLDER_CAT = "https://via.placeholder.com/600x600?text=Kategori";
export const PLACEHOLDER_BRAND = "https://via.placeholder.com/600x400?text=Marka";
export const PLACEHOLDER_PRODUCT = "https://via.placeholder.com/400x300?text=Ürün+Görseli";

export function getCategoryImageById(id) {
  return categoryImagesById[id] || PLACEHOLDER_CAT;
}

export function getBrandImageById(id) {
  return brandImagesById[id] || PLACEHOLDER_BRAND;
}
