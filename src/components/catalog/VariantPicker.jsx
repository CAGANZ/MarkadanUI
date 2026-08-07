"use client";
// src/components/catalog/VariantPicker.jsx
// Seçenek eksenleri (Beden, Renk...). Diğer eksenlerdeki seçimle stoklu bir
// varyant oluşturamayan değerler soluk + üstü çizili gösterilir; yine de
// tıklanabilir olması gerekmez, bu yüzden disabled bırakılır.
import { useVariant } from "@/components/catalog/VariantProvider";
import { isValueAvailable, productOptions } from "@/lib/variants";

export default function VariantPicker() {
  const ctx = useVariant();
  if (!ctx?.variantMode) return null;

  const { product, selection, select, variant, stock } = ctx;
  const options = productOptions(product);

  return (
    <div className="flex flex-col gap-4 border-t border-line pt-4">
      {options.map((option) => (
        <fieldset key={option.id}>
          <legend className="mb-2 text-sm font-semibold text-ink">
            {option.name}
            {selection[option.id] && (
              <span className="ml-1.5 font-normal text-ink-soft">
                {option.values?.find((v) => v.id === selection[option.id])?.value}
              </span>
            )}
          </legend>
          <div className="flex flex-wrap gap-2">
            {(option.values ?? []).map((value) => {
              const selected = selection[option.id] === value.id;
              const available = isValueAvailable(product, selection, option.id, value.id);
              return (
                <button
                  key={value.id}
                  type="button"
                  onClick={() => select(option.id, value.id)}
                  disabled={!available && !selected}
                  aria-pressed={selected}
                  className={`min-h-11 min-w-11 rounded-base border px-4 py-2 text-sm font-medium transition-colors ${
                    selected
                      ? "border-primary bg-primary text-white"
                      : available
                        ? "border-line bg-surface-card text-ink hover:border-primary"
                        : "border-line bg-surface text-ink-soft/50 line-through cursor-not-allowed"
                  }`}
                >
                  {value.value}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      {/* Stok uyarısı — yalnızca seçim tamamlandığında anlamlı */}
      {variant && stock > 0 && stock <= 5 && (
        <p className="text-sm font-medium text-warning">Son {stock} adet</p>
      )}
      {variant && stock === 0 && (
        <p className="text-sm font-medium text-danger">Bu seçenek tükendi</p>
      )}
    </div>
  );
}
