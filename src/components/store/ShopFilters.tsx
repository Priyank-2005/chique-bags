"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, SlidersHorizontal, X } from "lucide-react";
import { cn, formatINR } from "@/lib/utils";

interface Props {
  categories: { slug: string; name: string }[];
  colours: { key: string; label: string; hex: string; count: number }[];
  /** Cheapest and dearest price in the shop, shown as a hint in the price boxes. */
  bounds: { min: number; max: number } | null;
  total: number;
}

const PRESETS = [
  { label: "Under ₹999", min: "", max: "999" },
  { label: "₹1,000 – ₹1,499", min: "1000", max: "1499" },
  { label: "₹1,500 & above", min: "1500", max: "" },
];

/** The filter panel beside the product grid. On a phone it opens as a full-screen panel from a Filters button. */
export default function ShopFilters({ categories, colours, bounds, total }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [open, setOpen] = useState(false);

  const category = sp.get("category") ?? "";
  const min = sp.get("min") ?? "";
  const max = sp.get("max") ?? "";
  const stock = sp.get("stock") === "1";
  const picked = (sp.get("colour") ?? "").split(",").filter(Boolean);

  const [minBox, setMinBox] = useState(min);
  const [maxBox, setMaxBox] = useState(max);
  useEffect(() => { setMinBox(min); setMaxBox(max); }, [min, max]);

  const activeCount = (category ? 1 : 0) + (min || max ? 1 : 0) + picked.length + (stock ? 1 : 0);

  function go(patch: Record<string, string | null>) {
    const params = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") params.delete(k);
      else params.set(k, v);
    }
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function applyPrice(e?: React.FormEvent) {
    e?.preventDefault();
    let lo = Math.max(0, Math.floor(Number(minBox) || 0));
    let hi = Math.max(0, Math.floor(Number(maxBox) || 0));
    if (lo && hi && lo > hi) [lo, hi] = [hi, lo];
    go({ min: lo ? String(lo) : null, max: hi ? String(hi) : null });
  }

  function toggleColour(key: string) {
    const next = picked.includes(key) ? picked.filter((k) => k !== key) : [...picked, key];
    go({ colour: next.length ? next.join(",") : null });
  }

  function clearAll() {
    const params = new URLSearchParams(sp.toString());
    for (const k of ["category", "min", "max", "colour", "stock", "page"]) params.delete(k);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const heading = "border-b border-line pb-2 font-serif text-lg font-semibold";
  const priceBox = "input !py-2 text-sm";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn btn-line btn-sm lg:hidden" aria-haspopup="dialog">
        <SlidersHorizontal size={15} /> Filters{activeCount > 0 ? ` (${activeCount})` : ""}
      </button>

      <aside
        aria-label="Filter bags"
        className={cn(
          "bg-white lg:sticky lg:top-28 lg:block lg:max-h-[calc(100vh-8rem)] lg:self-start lg:overflow-y-auto lg:bg-transparent lg:pr-3",
          open ? "fixed inset-0 z-[300] block overflow-y-auto p-6" : "hidden"
        )}
      >
        <div className="mb-6 flex items-center justify-between lg:mb-5">
          <p className="flex items-center gap-2 font-serif text-xl font-semibold"><SlidersHorizontal size={17} /> Filters</p>
          <div className="flex items-center gap-4">
            {activeCount > 0 && <button type="button" onClick={clearAll} className="text-xs font-medium underline">Clear all</button>}
            <button type="button" onClick={() => setOpen(false)} aria-label="Close filters" className="lg:hidden"><X size={22} /></button>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className={heading}>Category</h2>
            <ul className="mt-3 space-y-1 text-sm">
              {[{ slug: "", name: "All bags" }, ...categories].map((c) => (
                <li key={c.slug || "all"}>
                  <button type="button" onClick={() => go({ category: c.slug || null })} aria-pressed={category === c.slug} className={cn("w-full rounded-sm px-2 py-1.5 text-left transition hover:bg-blush", category === c.slug && "bg-blush font-semibold")}>
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className={heading}>Price</h2>
            <form onSubmit={applyPrice} className="mt-3 space-y-3">
              <div className="flex items-center gap-2">
                <label className="min-w-0 flex-1">
                  <span className="sr-only">Minimum price in rupees</span>
                  <input inputMode="numeric" className={priceBox} placeholder={bounds ? `₹ ${bounds.min.toLocaleString("en-IN")}` : "Min ₹"} value={minBox} onChange={(e) => setMinBox(e.target.value.replace(/\D/g, ""))} />
                </label>
                <span className="text-muted">to</span>
                <label className="min-w-0 flex-1">
                  <span className="sr-only">Maximum price in rupees</span>
                  <input inputMode="numeric" className={priceBox} placeholder={bounds ? `₹ ${bounds.max.toLocaleString("en-IN")}` : "Max ₹"} value={maxBox} onChange={(e) => setMaxBox(e.target.value.replace(/\D/g, ""))} />
                </label>
              </div>
              <button className="btn btn-dark btn-sm btn-block">Apply price</button>
            </form>
            <div className="mt-3 flex flex-wrap gap-2">
              {PRESETS.map((p) => {
                const on = p.min === min && p.max === max;
                return <button key={p.label} type="button" className="chip" data-active={on} onClick={() => go(on ? { min: null, max: null } : { min: p.min || null, max: p.max || null })}>{p.label}</button>;
              })}
            </div>
            {bounds && <p className="mt-2 text-xs text-muted">Our bags range from {formatINR(bounds.min)} to {formatINR(bounds.max)}.</p>}
          </section>

          {colours.length > 0 && (
            <section>
              <h2 className={heading}>Colour</h2>
              <ul className="mt-3 space-y-1 text-sm">
                {colours.map((c) => {
                  const on = picked.includes(c.key);
                  return (
                    <li key={c.key}>
                      <button type="button" role="checkbox" aria-checked={on} onClick={() => toggleColour(c.key)} className={cn("flex w-full items-center gap-3 rounded-sm px-2 py-1.5 text-left transition hover:bg-blush", on && "bg-blush font-semibold")}>
                        <span className="relative grid h-6 w-6 shrink-0 place-items-center rounded-full border border-black/15" style={{ background: c.hex }}>
                          {on && <Check size={13} strokeWidth={3} className={c.key === "white" || c.key === "beige" || c.key === "yellow" ? "text-ink" : "text-white"} />}
                        </span>
                        <span className="flex-1">{c.label}</span>
                        <span className="text-xs text-muted">{c.count}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <section>
            <h2 className={heading}>Availability</h2>
            <label className="mt-3 flex cursor-pointer items-center gap-3 text-sm">
              <input type="checkbox" checked={stock} onChange={(e) => go({ stock: e.target.checked ? "1" : null })} className="h-4 w-4 accent-[#241f1a]" /> In stock only
            </label>
          </section>
        </div>

        <button type="button" onClick={() => setOpen(false)} className="btn btn-dark btn-block mt-8 lg:hidden">Show {total} {total === 1 ? "bag" : "bags"}</button>
      </aside>
    </>
  );
}
