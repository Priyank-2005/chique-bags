import Link from "next/link";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { X } from "lucide-react";
import ProductCard from "@/components/store/ProductCard";
import ShopFilters from "@/components/store/ShopFilters";
import ShopToolbar from "@/components/store/ShopToolbar";
import { cardInclude, getColourIndex, getNavCategories, SORTS, toCard, type SortKey } from "@/lib/catalog";
import { COLOUR_FAMILIES, COLOUR_KEYS, colourFamily } from "@/lib/colours";
import { prisma } from "@/lib/db";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 12;

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
  const sp = await searchParams;
  const cat = one(sp.category);
  const category = cat ? await prisma.category.findUnique({ where: { slug: cat } }) : null;
  return {
    title: category ? category.name : one(sp.q) ? `Search: ${one(sp.q)}` : "Shop all bags",
    description: category?.description ?? "Browse handcrafted bags: luxury bags, metal bags, flapbags and clutches.",
    alternates: { canonical: category ? `/shop?category=${category.slug}` : "/shop" },
  };
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const categorySlug = one(sp.category);
  const q = one(sp.q)?.trim().slice(0, 60) || "";
  const sort = (one(sp.sort) && one(sp.sort)! in SORTS ? one(sp.sort) : "newest") as SortKey;
  const min = Number(one(sp.min)) || 0;
  const max = Number(one(sp.max)) || 0;
  const inStock = one(sp.stock) === "1";
  const colours = (one(sp.colour) ?? "").split(",").filter((k) => COLOUR_KEYS.has(k));
  const page = Math.max(1, Number(one(sp.page)) || 1);

  const categories = await getNavCategories();
  const activeCategory = categories.find((c) => c.slug === categorySlug);

  // Everything except the colour: the colour list shows how many bags each colour would give with the other filters applied.
  const whereBase: Prisma.ProductWhereInput = {
    isActive: true,
    ...(activeCategory && { categoryId: activeCategory.id }),
    ...((min || max) && { price: { ...(min && { gte: min }), ...(max && { lte: max }) } }),
    ...(inStock && { variants: { some: { stock: { gt: 0 } } } }),
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { tags: { has: q.toLowerCase() } },
        { shortDescription: { contains: q, mode: "insensitive" } },
        { category: { name: { contains: q, mode: "insensitive" } } },
        { variants: { some: { name: { contains: q, mode: "insensitive" } } } },
      ],
    }),
  };

  const [baseRows, colourIndex, priceRange] = await Promise.all([
    prisma.product.findMany({ where: whereBase, select: { id: true } }),
    getColourIndex(),
    prisma.product.aggregate({ where: { isActive: true }, _min: { price: true }, _max: { price: true } }),
  ]);
  const baseIds = new Set(baseRows.map((r) => r.id));

  // Which bags come in which colour family (only in-stock colours when "In stock only" is on).
  const byFamily = new Map<string, Set<string>>();
  for (const v of colourIndex) {
    if (!baseIds.has(v.productId) || (inStock && v.stock <= 0)) continue;
    const key = colourFamily(v.hex);
    if (!byFamily.has(key)) byFamily.set(key, new Set());
    byFamily.get(key)!.add(v.productId);
  }
  const colourOptions = COLOUR_FAMILIES.filter((c) => (byFamily.get(c.key)?.size ?? 0) > 0 || colours.includes(c.key)).map((c) => ({ key: c.key, label: c.label, hex: c.hex, count: byFamily.get(c.key)?.size ?? 0 }));

  const where: Prisma.ProductWhereInput = { ...whereBase };
  if (colours.length) {
    const ids = new Set<string>();
    for (const key of colours) for (const id of byFamily.get(key) ?? []) ids.add(id);
    where.id = { in: [...ids] };
  }

  const [total, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({ where, include: cardInclude, orderBy: SORTS[sort].orderBy, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // With a colour chosen, each card shows that colour (its photo, and the product page opens on it).
  const cards = rows.map((r) => {
    const card = toCard(r);
    if (!colours.length) return { card, colourId: undefined as string | undefined };
    const match = card.variants.find((v) => colours.includes(colourFamily(v.hex)) && (!inStock || v.stock > 0)) ?? card.variants.find((v) => colours.includes(colourFamily(v.hex)));
    if (!match) return { card, colourId: undefined };
    return { card: match.image ? { ...card, image: match.image, hoverImage: null } : card, colourId: match.id };
  });

  const href = (patch: Record<string, string | number | null>) => {
    const params = new URLSearchParams();
    const base: Record<string, string | number | null> = { category: categorySlug ?? null, q: q || null, sort: sort === "newest" ? null : sort, min: min || null, max: max || null, colour: colours.length ? colours.join(",") : null, stock: inStock ? 1 : null, page: null };
    for (const [k, v] of Object.entries({ ...base, ...patch })) if (v !== null && v !== "" && v !== undefined) params.set(k, String(v));
    const s = params.toString();
    return s ? `/shop?${s}` : "/shop";
  };

  // What is applied right now, each with a link that removes just that one.
  const applied: { label: string; remove: string }[] = [];
  if (q) applied.push({ label: `Search: ${q}`, remove: href({ q: null }) });
  if (activeCategory) applied.push({ label: activeCategory.name, remove: href({ category: null }) });
  if (min || max) applied.push({ label: min && max ? `${formatINR(min)} – ${formatINR(max)}` : min ? `${formatINR(min)} & above` : `Under ${formatINR(max)}`, remove: href({ min: null, max: null }) });
  for (const key of colours) applied.push({ label: COLOUR_FAMILIES.find((c) => c.key === key)!.label, remove: href({ colour: colours.filter((k) => k !== key).join(",") || null }) });
  if (inStock) applied.push({ label: "In stock only", remove: href({ stock: null }) });

  const sorts = (Object.keys(SORTS) as SortKey[]).map((k) => ({ value: k, label: SORTS[k].label }));
  const bounds = priceRange._min.price !== null && priceRange._max.price !== null ? { min: priceRange._min.price, max: priceRange._max.price } : null;

  return (
    <div className="wrap py-10 lg:py-14">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted">
        <Link href="/" className="hover:text-rose">Home</Link> / <span className="text-ink">{activeCategory?.name ?? "Shop"}</span>
      </nav>
      <header className="mb-8">
        <h1 className="h-display text-4xl sm:text-5xl">{q ? `Results for “${q}”` : (activeCategory?.name ?? "All bags")}</h1>
        {activeCategory?.description && <p className="mt-3 max-w-xl text-muted">{activeCategory.description}</p>}
      </header>

      <div className="grid gap-x-10 gap-y-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <ShopFilters categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} colours={colourOptions} bounds={bounds} total={total} />

        <div className="min-w-0">
          <ShopToolbar total={total} sorts={sorts} />

          {applied.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {applied.map((a) => (
                <Link key={a.label} href={a.remove} scroll={false} className="chip !gap-1.5 !py-1.5" aria-label={`Remove filter: ${a.label}`}>
                  {a.label} <X size={13} />
                </Link>
              ))}
              <Link href={href({ category: null, min: null, max: null, colour: null, stock: null, q: null })} className="text-xs font-medium underline">Clear all</Link>
            </div>
          )}

          {cards.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-serif text-2xl">No bags match these filters</p>
              <p className="mt-2 text-muted">Try removing a filter or searching for something else.</p>
              <Link href="/shop" className="btn btn-dark mt-6">Clear filters</Link>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 xl:grid-cols-3 xl:gap-x-6">
              {cards.map(({ card, colourId }, i) => <ProductCard key={card.id} product={card} colourId={colourId} priority={i < 3} />)}
            </div>
          )}

          {pages > 1 && (
            <nav aria-label="Pagination" className="mt-14 flex flex-wrap justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <Link key={n} href={href({ page: n })} className="chip" data-active={n === page} aria-current={n === page ? "page" : undefined}>{n}</Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
