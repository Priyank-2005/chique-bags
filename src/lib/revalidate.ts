import { revalidateTag } from "next/cache";

/** Cache tags for the shop data that is read on almost every page. */
export const TAGS = { settings: "settings", catalog: "catalog", banners: "banners" } as const;

/** Call after the admin changes settings, products, categories or banners so visitors see it straight away. */
export function refreshStore(...tags: (keyof typeof TAGS)[]) {
  for (const t of tags.length ? tags : (Object.keys(TAGS) as (keyof typeof TAGS)[])) revalidateTag(TAGS[t], { expire: 0 });
}
