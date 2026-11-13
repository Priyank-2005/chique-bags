import type { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { allPhotos, coverPhoto } from "@/lib/product-images";

export const cardInclude = { variants: { orderBy: { sortOrder: "asc" } } } satisfies Prisma.ProductInclude;
type CardRow = Prisma.ProductGetPayload<{ include: typeof cardInclude }>;

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  price: number;
  mrp: number | null;
  image: string | null;
  hoverImage: string | null;
  isNew: boolean;
  isBestSeller: boolean;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  /** `image` is the colour's own cover photo, when it has one. */
  variants: { id: string; name: string; hex: string; stock: number; image: string | null }[];
}

export function toCard(p: CardRow): ProductCardData {
  const stock = p.variants.reduce((n, v) => n + v.stock, 0);
  const photos = allPhotos(p);
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    mrp: p.originalPrice && p.originalPrice > p.price ? p.originalPrice : null,
    image: photos[0] ?? null,
    hoverImage: photos[1] ?? null,
    isNew: p.isNew,
    isBestSeller: p.isBestSeller,
    inStock: stock > 0,
    rating: p.rating,
    reviewCount: p.reviewCount,
    variants: p.variants.map((v) => ({ id: v.id, name: v.name, hex: v.hex, stock: v.stock, image: v.images[0] ?? null })),
  };
}

async function loadCards(where: Prisma.ProductWhereInput, take: number, orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[]) {
  const rows = await prisma.product.findMany({ where: { isActive: true, ...where }, include: cardInclude, orderBy, take });
  return rows.map(toCard);
}

// Product cards appear on most pages: reuse the result for a minute (the admin panel refreshes it when products change).
const cachedCards = unstable_cache(loadCards, ["catalog-cards"], { tags: ["catalog"], revalidate: 60 });

export async function getCards(where: Prisma.ProductWhereInput, take = 8, orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] = { createdAt: "desc" }) {
  return cachedCards(where, take, orderBy);
}

// A category without its own cover photo borrows the photo of its best-selling bag.
async function loadNavCategories() {
  const rows = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      description: true,
      products: { where: { isActive: true }, orderBy: [{ isBestSeller: "desc" }, { createdAt: "desc" }], take: 1, select: { images: true, variants: { select: { images: true }, orderBy: { sortOrder: "asc" } } } },
    },
  });
  return rows.map(({ products, ...c }) => ({ ...c, image: c.image ?? (products[0] ? coverPhoto(products[0]) : null) }));
}

export const getNavCategories = unstable_cache(loadNavCategories, ["nav-categories"], { tags: ["catalog"], revalidate: 60 });

// Every colour of every live product, for the shop's colour filter. Small, and shared by all shop visits for a minute.
export type ColourIndexRow = { productId: string; hex: string; stock: number };
export const getColourIndex = unstable_cache(
  async (): Promise<ColourIndexRow[]> => {
    const rows = await prisma.productVariant.findMany({ where: { product: { isActive: true } }, select: { productId: true, hex: true, stock: true } });
    return rows;
  },
  ["colour-index"],
  { tags: ["catalog"], revalidate: 60 }
);

export const SORTS = {
  newest: { label: "Newest", orderBy: { createdAt: "desc" } },
  popular: { label: "Best sellers", orderBy: [{ isBestSeller: "desc" }, { createdAt: "desc" }] },
  "price-asc": { label: "Price: low to high", orderBy: { price: "asc" } },
  "price-desc": { label: "Price: high to low", orderBy: { price: "desc" } },
} as const satisfies Record<string, { label: string; orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] }>;
export type SortKey = keyof typeof SORTS;
