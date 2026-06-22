// src/lib/order-status.js
export const ORDER_STATUS = {
  PaymentPending: { label: "Ödeme Bekleniyor", tone: "warning" },
  Ordered:        { label: "Onaylandı",         tone: "success" },
  Preparing:      { label: "Hazırlanıyor",       tone: "primary" },
  Shipped:        { label: "Kargoya Verildi",    tone: "accent"  },
  Delivered:      { label: "Teslim Edildi",      tone: "success" },
  Cancelled:      { label: "İptal Edildi",       tone: "danger"  },
};

export function statusLabel(status) {
  return ORDER_STATUS[status]?.label ?? status;
}

export function statusBadgeClass(status) {
  const tone = ORDER_STATUS[status]?.tone;
  if (tone === "success") return "bg-success-soft text-success";
  if (tone === "danger")  return "bg-danger-soft text-danger";
  if (tone === "warning") return "bg-warning-soft text-warning";
  if (tone === "accent")  return "bg-accent-soft text-accent";
  return "bg-primary-soft text-primary";
}

export const canCustomerCancel = (status) =>
  ["PaymentPending", "Ordered", "Preparing"].includes(status);
