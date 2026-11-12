/**
 * Photos can belong to the product as a whole (`images`) or to one colour (`variant.images`).
 * A colour that has no photos of its own shows the product's photos.
 */
type Photos = { images: string[]; variants?: { images: string[] }[] };

/** Every photo of a product, product photos first. Used where a single list is needed (cover, search, structured data). */
export function allPhotos(p: Photos): string[] {
  const out: string[] = [];
  for (const src of [...p.images, ...(p.variants ?? []).flatMap((v) => v.images)]) if (!out.includes(src)) out.push(src);
  return out;
}

export function coverPhoto(p: Photos): string | null {
  return allPhotos(p)[0] ?? null;
}

/** The photos to show for the chosen colour. */
export function photosForColour(general: string[], colourImages: string[] | undefined): string[] {
  return colourImages && colourImages.length > 0 ? colourImages : general;
}
