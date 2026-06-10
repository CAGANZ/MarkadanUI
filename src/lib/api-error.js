// src/lib/api-error.js
// Backend'in ProblemDetails hata sözleşmesi:
// { "status": 409, "title": "Business rule violated", "detail": "Sepet boş." }
// detail alanı Türkçe ve kullanıcıya doğrudan gösterilebilir.

const FALLBACK = {
  400: "Gönderilen bilgilerde eksik veya hatalı alanlar var.",
  401: "Oturumunuz sona erdi. Lütfen tekrar giriş yapın.",
  403: "Bu işlem için yetkiniz yok.",
  404: "Aradığınız kayıt bulunamadı.",
  409: "İşlem şu an gerçekleştirilemiyor.",
  429: "Çok fazla istek gönderildi. Lütfen biraz bekleyip tekrar deneyin.",
  500: "Sunucuda beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
};

export class ApiError extends Error {
  constructor(status, detail, title) {
    super(detail || FALLBACK[status] || "Beklenmeyen bir hata oluştu.");
    this.name = "ApiError";
    this.status = status;
    this.title = title || null;
    this.detail = this.message;
  }
}

// fetch yanıt gövdesinden ApiError üretir (gövde JSON değilse fallback kullanılır)
export function toApiError(status, data) {
  return new ApiError(status, data?.detail, data?.title);
}
