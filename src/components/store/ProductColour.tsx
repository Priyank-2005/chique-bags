"use client";

import { createContext, useContext, useMemo, useState } from "react";

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

export function useProductColour(): Ctx {
  const ctx = useContext(ColourContext);
  if (!ctx) throw new Error("useProductColour must be used inside ProductColourProvider");
  return ctx;
}
