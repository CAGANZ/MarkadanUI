"use client";
// src/components/catalog/VariantImage.jsx
// Ürün ana görseli — seçilen varyantın kendi görseli varsa onu gösterir.
import Image from "next/image";
import { MEDIA } from "@/lib/media";
import { useVariant } from "@/components/catalog/VariantProvider";

export default function VariantImage() {
  const ctx = useVariant();
  if (!ctx) return null;

  return (
    <Image
      src={ctx.imageUrl || MEDIA.product.src}
      alt={ctx.label ? `${ctx.product.title} — ${ctx.label}` : ctx.product.title}
      fill
      sizes="(max-width: 1024px) 100vw, 50vw"
      priority
      className="object-cover"
    />
  );
}
