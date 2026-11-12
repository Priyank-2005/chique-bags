"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { nameWithColour } from "@/lib/product-name";

interface Ctx {
  variantId: string | undefined;
  setVariantId: (id: string) => void;
}

const ColourContext = createContext<Ctx | null>(null);

/** Shares the chosen colour between the photo gallery and the buy box, so the photos follow the colour. */
export function ProductColourProvider({ initialId, children }: { initialId: string | undefined; children: React.ReactNode }) {
  const [variantId, setVariantId] = useState(initialId);
  const value = useMemo(() => ({ variantId, setVariantId }), [variantId]);
  return <ColourContext.Provider value={value}>{children}</ColourContext.Provider>;
}

/** The product's heading: it carries the chosen colour, e.g. "Ara Lilac Embellished". */
export function ProductTitle({ name, variants }: { name: string; variants: { id: string; name: string }[] }) {
  const { variantId } = useProductColour();
  const colour = variants.find((v) => v.id === variantId)?.name;
  return <h1 className="h-display mt-2 text-3xl sm:text-4xl">{nameWithColour(name, colour)}</h1>;
}

export function useProductColour(): Ctx {
  const ctx = useContext(ColourContext);
  if (!ctx) throw new Error("useProductColour must be used inside ProductColourProvider");
  return ctx;
}
