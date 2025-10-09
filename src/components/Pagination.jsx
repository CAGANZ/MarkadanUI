"use client";

export default function Pagination({
  currentPage,
  total,
  pageSize,
  onPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (totalPages <= 1) {
    return null; // Eğer tek sayfa varsa veya hiç sayfa yoksa, null döndür.
  }

  // Sayfa numaralarını oluşturma mantığı
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Gösterilecek maksimum sayfa butonu sayısı
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow + 2) {
      // Eğer sayfa sayısı az ise, hepsini göster
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Karmaşık sayfalama mantığı (... ile)
      pageNumbers.push(1); // Her zaman ilk sayfayı göster

      let start = Math.max(2, currentPage - halfPagesToShow);
      let end = Math.min(totalPages - 1, currentPage + halfPagesToShow);
      
      if (currentPage - halfPagesToShow <= 2) {
        end = 1 + maxPagesToShow;
      }

      if (currentPage + halfPagesToShow >= totalPages - 1) {
        start = totalPages - maxPagesToShow;
      }

      if (start > 2) {
        pageNumbers.push("...");
      }

      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      if (end < totalPages - 1) {
        pageNumbers.push("...");
      }
      
      pageNumbers.push(totalPages); // Her zaman son sayfayı göster
    }
    return pageNumbers;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 text-sm text-neutral-700">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="rounded-lg border px-3 py-1.5 disabled:opacity-50 hover:bg-neutral-100 transition-colors"
      >
        ← Önceki
      </button>

      <div className="flex items-center gap-1">
        {pages.map((page, index) =>
          page === "..." ? (
            <span key={index} className="px-2 py-1.5 text-neutral-500">
              ...
            </span>
          ) : (
            <button
              key={index}
              onClick={() => onPageChange(page)}
              className={`rounded-lg w-9 h-9 flex items-center justify-center transition-colors ${
                currentPage === page
                  ? "bg-amber-600 text-white font-bold"
                  : "bg-white border hover:bg-neutral-100"
              }`}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="rounded-lg border px-3 py-1.5 disabled:opacity-50 hover:bg-neutral-100 transition-colors"
      >
        Sonraki →
      </button>
    </div>
  );
}