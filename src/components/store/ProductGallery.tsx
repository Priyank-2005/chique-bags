"use client";

import Image from "next/image";
import { useState } from "react";
import { useProductColour } from "@/components/store/ProductColour";
import { photosForColour } from "@/lib/product-images";
import { cn } from "@/lib/utils";

interface Props {
  /** The product's own photos, shown for any colour that has none of its own. */
  images: string[];
  variants: { id: string; name: string; images: string[] }[];
  name: string;
}

export default function ProductGallery({ images, variants, name }: Props) {
  const { variantId } = useProductColour();
  const colour = variants.find((v) => v.id === variantId);
  const photos = photosForColour(images, colour?.images);
  // Remounting on a colour change starts the new colour on its first photo.
  return <Photos key={colour?.id ?? "all"} photos={photos} label={colour && variants.length > 1 ? `${name}, ${colour.name}` : name} />;
}

function Photos({ photos, label }: { photos: string[]; label: string }) {
  const [active, setActive] = useState(0);
  if (photos.length === 0) return <div className="aspect-[4/5] rounded-sm bg-cream" />;
  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row">
      {photos.length > 1 && (
        <div className="no-scrollbar flex gap-3 overflow-x-auto lg:max-h-[640px] lg:w-20 lg:shrink-0 lg:flex-col lg:overflow-y-auto">
          {photos.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === active}
              className={cn("relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-sm border-2 bg-cream transition lg:w-full", i === active ? "border-ink" : "border-transparent opacity-70 hover:opacity-100")}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="relative aspect-[4/5] flex-1 overflow-hidden rounded-sm bg-cream">
        <Image key={photos[active]} src={photos[active]} alt={`${label}, photo ${active + 1}`} fill priority sizes="(min-width:1024px) 50vw, 100vw" className="fade-up object-cover" />
      </div>
    </div>
  );
}
