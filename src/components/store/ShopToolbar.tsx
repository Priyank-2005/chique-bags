"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

/** The bar above the product grid: search, the number of bags, and the sort order. */
export default function ShopToolbar({ total, sorts }: { total: number; sorts: { value: string; label: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const q = sp.get("q") ?? "";
  const sort = sp.get("sort") ?? "newest";
  const [text, setText] = useState(q);
  useEffect(() => setText(q), [q]);

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

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      <form role="search" onSubmit={(e) => { e.preventDefault(); go({ q: text.trim() || null }); }} className="relative min-w-0 flex-1 basis-64">
        <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input type="search" aria-label="Search bags" placeholder="Search bags, colours, styles…" value={text} onChange={(e) => setText(e.target.value)} maxLength={60} className="input !pl-11 !pr-20" />
        {text && (
          <button type="button" aria-label="Clear search" onClick={() => { setText(""); go({ q: null }); }} className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-ink"><X size={16} /></button>
        )}
        <button className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-ink px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-white hover:bg-berry">Go</button>
      </form>

      <p className="text-sm text-muted" aria-live="polite">{total} {total === 1 ? "bag" : "bags"}</p>

      <label className="flex items-center gap-2 text-sm">
        <span className="text-muted">Sort by</span>
        <select value={sort} onChange={(e) => go({ sort: e.target.value === "newest" ? null : e.target.value })} className="input !w-auto !py-2.5 pr-8 text-sm">
          {sorts.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </label>
    </div>
  );
}
