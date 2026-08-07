"use client";
// src/components/catalog/VariantProvider.jsx
// Ürün detayında seçenek durumunu tutan context. RSC olan sayfa, statik
// içeriğini children olarak geçer; yalnızca seçime bağlı parçalar (görsel,
// fiyat, seçici, sepete ekle) bu context'i okur.
import { createContext, useContext, useMemo, useState } from "react";
import {
  defaultSelection,
  findVariant,
  hasVariants,
  priceRange,
  totalVariantStock,
  variantLabel,
} from "@/lib/variants";

const VariantContext = createContext(null);

export function VariantProvider({ product, children }) {
  const [selection, setSelection] = useState(() => defaultSelection(product));

  const value = useMemo(() => {
    const variantMode = hasVariants(product);
    const variant = variantMode ? findVariant(product, selection) : null;

    return {
      product,
      variantMode,
      selection,
      variant,
      // Eksenlerden biri seçilmemişse sepete ekleme kilitli kalır
      ready: variantMode ? variant !== null : true,
      price: variant ? variant.price : variantMode ? null : product.price,
      range: variantMode ? priceRange(product) : null,
      stock: variant ? variant.stock : variantMode ? totalVariantStock(product) : null,
      imageUrl: variant?.imageUrl || product.imageUrl,
      label: variant ? variantLabel(product, variant) : "",
      select: (optionId, valueId) =>
        setSelection((s) =>
          // aynı değere tekrar tıklamak seçimi kaldırır
          s[optionId] === valueId
            ? Object.fromEntries(Object.entries(s).filter(([k]) => Number(k) !== optionId))
            : { ...s, [optionId]: valueId }
        ),
    };
  }, [product, selection]);

  return <VariantContext.Provider value={value}>{children}</VariantContext.Provider>;
}

// Provider dışında da çağrılabilir (varyantsız bağlamlar için null döner)
export function useVariant() {
  return useContext(VariantContext);
}
