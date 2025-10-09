"use client";

import { useState, useEffect } from "react";

// value: debounce edilecek değer (örn: arama metni)
// delay: gecikme süresi (ms)
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Kullanıcı yazmayı bıraktıktan sonra 'delay' süresi kadar bekleyip
    // state'i güncelleyen zamanlayıcı
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Eğer 'value' veya 'delay' değişirse (kullanıcı yeni bir harf yazarsa),
    // bir önceki zamanlayıcıyı temizle ve yenisini başlat.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}