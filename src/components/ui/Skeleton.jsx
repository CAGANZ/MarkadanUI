// src/components/ui/Skeleton.jsx
// Yükleme iskeleti — her liste/detay sayfasında durum tasarımı zorunlu.
export default function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-base bg-line/60 ${className}`}
      aria-hidden
    />
  );
}

// Ürün kartı iskeleti (listelerde tekrar kullanılır)
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-base border border-line bg-surface-card">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-5 w-1/2" />
      </div>
    </div>
  );
}
