// src/lib/order-status.js
// Sipariş durumu sözlüğü — backend durum seti: Ordered · Cancelled
export const ORDER_STATUS = {
  Ordered: { label: "Sipariş Alındı", tone: "success" },
  Cancelled: { label: "İptal Edildi", tone: "danger" },
};

export function statusLabel(status) {
  return ORDER_STATUS[status]?.label ?? status;
}

// Rozet stili (tema utility'leri)
export function statusBadgeClass(status) {
  const tone = ORDER_STATUS[status]?.tone;
  if (tone === "success") return "bg-success-soft text-success";
  if (tone === "danger") return "bg-danger-soft text-danger";
  return "bg-primary-soft text-ink";
}
