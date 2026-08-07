// src/lib/variants.js
// Varyant seçim mantığı — saf fonksiyonlar (T5).
// Veri şekli (public ürün DTO'su):
//   options:  [{ id, name, values: [{ id, value }] }]
//   variants: [{ id, sku, price, stock, imageUrl, optionValueIds: [..] }]
// Not: variant.price backend'de her zaman ETKİN fiyattır (varyantın kendi fiyatı
// yoksa ürün fiyatı) — burada ek hesap yapılmaz.

export function productOptions(product) {
  return Array.isArray(product?.options) ? product.options : [];
}

export function productVariants(product) {
  return Array.isArray(product?.variants) ? product.variants : [];
}

// Varyantlı ürün mü? (varyantsız ürünler eski akışla çalışmaya devam eder)
export function hasVariants(product) {
  return productOptions(product).length > 0 && productVariants(product).length > 0;
}

// Bir varyant, verilen değer kümesini tam olarak kapsıyor mu
function variantHasAll(variant, valueIds) {
  const ids = variant?.optionValueIds ?? [];
  return valueIds.every((v) => ids.includes(v));
}

/**
 * Tüm eksenler seçiliyse eşleşen varyantı döndürür, aksi halde null.
 * @param {object} product
 * @param {Record<number, number>} selection  optionId → optionValueId
 */
export function findVariant(product, selection) {
  const options = productOptions(product);
  if (options.length === 0) return null;
  const wanted = options.map((o) => selection?.[o.id]);
  if (wanted.some((v) => v === undefined || v === null)) return null;
  return (
    productVariants(product).find(
      (v) => (v.optionValueIds?.length ?? 0) === wanted.length && variantHasAll(v, wanted)
    ) ?? null
  );
}

/**
 * Bu değer, diğer eksenlerdeki mevcut seçimlerle birlikte stoklu bir varyant
 * oluşturabiliyor mu? (oluşturamıyorsa seçenek soluk gösterilir)
 */
export function isValueAvailable(product, selection, optionId, valueId) {
  return productVariants(product).some((v) => {
    const ids = v.optionValueIds ?? [];
    if (!ids.includes(valueId)) return false;
    for (const o of productOptions(product)) {
      if (o.id === optionId) continue;
      const sel = selection?.[o.id];
      if (sel != null && !ids.includes(sel)) return false;
    }
    return (v.stock ?? 0) > 0;
  });
}

// Varyant fiyat aralığı — hiç seçim yokken gösterilir. Tek fiyat varsa min===max.
export function priceRange(product) {
  const prices = productVariants(product)
    .map((v) => v.price)
    .filter((p) => typeof p === "number");
  if (prices.length === 0) return null;
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function totalVariantStock(product) {
  return productVariants(product).reduce((acc, v) => acc + (v.stock ?? 0), 0);
}

// "Kırmızı / M" — eksen sırasına göre okunabilir etiket
export function variantLabel(product, variant) {
  const ids = variant?.optionValueIds ?? [];
  return productOptions(product)
    .map((o) => o.values?.find((val) => ids.includes(val.id))?.value)
    .filter(Boolean)
    .join(" / ");
}

/**
 * Açılışta yapılacak seçim:
 *  - tek varyantlı ürün → o varyantın tüm değerleri
 *  - tek değerli eksen  → o değer (kullanıcıya seçecek bir şey bırakmaz)
 */
export function defaultSelection(product) {
  const options = productOptions(product);
  const variants = productVariants(product);
  const selection = {};
  if (options.length === 0) return selection;

  if (variants.length === 1) {
    const ids = variants[0].optionValueIds ?? [];
    for (const o of options) {
      const match = o.values?.find((v) => ids.includes(v.id));
      if (match) selection[o.id] = match.id;
    }
    return selection;
  }

  for (const o of options) {
    if ((o.values?.length ?? 0) === 1) selection[o.id] = o.values[0].id;
  }
  return selection;
}

// Eksenlerin kartezyen çarpımı — admin "eksik varyantları oluştur" için
export function optionCombinations(options) {
  return options.reduce(
    (acc, o) => acc.flatMap((combo) => (o.values ?? []).map((v) => [...combo, v.id])),
    [[]]
  );
}
