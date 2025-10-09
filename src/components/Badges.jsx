// src/components/Badges.jsx
import AppImage from "@/components/AppImage";
import { MEDIA } from "@/lib/media";
import { BLUR } from "@/lib/blurData";

export default function Badges() {
  return (
    <div className="grid grid-cols-3 gap-6">
      <AppImage src={MEDIA.brand.src}    alt="Brand"    width={MEDIA.brand.w}    height={MEDIA.brand.h}    blur={BLUR.brand}    priority />
      <AppImage src={MEDIA.category.src} alt="Category" width={MEDIA.category.w} height={MEDIA.category.h} blur={BLUR.category} />
      <AppImage src={MEDIA.product.src}  alt="Product"  width={MEDIA.product.w}  height={MEDIA.product.h}  blur={BLUR.product} />
    </div>
  );
}
