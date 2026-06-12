// src/config/boutique.js
// ============================================================
// WHITE-LABEL BUTİK KİMLİĞİ
// Yeni bir butik için yalnızca bu dosya, theme.css ve
// public/media altındaki logo/görseller değiştirilir.
// Kod tarafında başka hiçbir değişiklik yapılmaz.
// ============================================================

export const BOUTIQUE = {
  // Butik adı — header, başlık (title), footer'da görünür
  name: "Markadan",

  // Kısa slogan — ana sayfa hero ve meta description'da kullanılır
  tagline: "Sevdiğiniz markalar, tek butikte",

  // Logo (boşsa butik adı metin olarak gösterilir)
  logoUrl: "",

  // WhatsApp sipariş hattı (ülke koduyla, başında + yok: "905xxxxxxxxx")
  // Boşsa WhatsApp butonu hiç görünmez.
  whatsappPhone: "",

  // İletişim — footer'da görünür
  contact: {
    phone: "",
    email: "",
    address: "",
    instagram: "",
  },

  // Para birimi gösterimi
  currency: "TRY",
  locale: "tr-TR",
};
