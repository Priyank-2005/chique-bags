import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { DEFAULT_WHATSAPP, parseWhatsappNumbers } from "@/lib/whatsapp";

export const DEFAULT_SETTINGS = {
  announcement: "Free shipping on every order",
  giftBoxEnabled: "true",
  giftBoxFee: "200",
  giftBoxImage: "",
  storyImage: "",
  contactEmail: "hello@chiquebags.in",
  contactPhone: "",
  whatsapp: "",
  instagram: "https://www.instagram.com/chiquebagsofficial/",
  address: "India",
  ownerEmail: "",
  // GST / invoice details
  legalName: "Chique Bags",
  gstin: "",
  gstRate: "18",
  hsnCode: "4202",
  businessState: "",
};

export type SettingKey = keyof typeof DEFAULT_SETTINGS;
export type Settings = {
  announcement: string;
  giftBoxEnabled: boolean;
  giftBoxFee: number;
  giftBoxImage: string;
  storyImage: string;
  contactEmail: string;
  contactPhone: string;
  /** WhatsApp numbers as saved, comma separated with country codes, e.g. "919876543210, 919123456789" */
  whatsapp: string;
  /** The same numbers as digits, ready for wa.me links. */
  whatsappNumbers: string[];
  instagram: string;
  address: string;
  ownerEmail: string;
  legalName: string;
  gstin: string;
  gstRate: number;
  hsnCode: string;
  businessState: string;
};

// Earlier versions of the site saved "· Prepaid orders, delivered across India" into the top bar. It is no longer shown.
function cleanAnnouncement(text: string): string {
  return text.replace(/\s*[·•|–—-]\s*prepaid orders,?\s*delivered across india\.?/gi, "").replace(/^\s*prepaid orders,?\s*delivered across india\.?\s*[·•|–—-]?\s*/i, "").trim();
}

async function loadSettings(): Promise<Settings> {
  const rows = await prisma.setting.findMany();
  const raw: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const r of rows) raw[r.key] = r.value;
  const whatsappNumbers = parseWhatsappNumbers(raw.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || DEFAULT_WHATSAPP);
  return {
    announcement: cleanAnnouncement(raw.announcement),
    giftBoxEnabled: raw.giftBoxEnabled === "true",
    giftBoxFee: Number(raw.giftBoxFee) || 0,
    giftBoxImage: raw.giftBoxImage,
    storyImage: raw.storyImage,
    contactEmail: raw.contactEmail,
    contactPhone: raw.contactPhone,
    whatsapp: whatsappNumbers.join(", "),
    whatsappNumbers,
    instagram: raw.instagram,
    address: raw.address,
    ownerEmail: raw.ownerEmail || process.env.OWNER_EMAIL || "",
    legalName: raw.legalName,
    gstin: raw.gstin.trim().toUpperCase(),
    gstRate: Number(raw.gstRate) || 0,
    hsnCode: raw.hsnCode,
    businessState: raw.businessState,
  };
}

// Read on every page, changed rarely: keep it for a few minutes instead of asking the database each time.
// The key carries a version: change it whenever the shape of Settings changes, so entries cached by an older build are never read.
const cachedSettings = unstable_cache(loadSettings, ["site-settings-v2"], { tags: ["settings"], revalidate: 300 });
export const getSettings = cache(cachedSettings);

export async function saveSettings(values: Partial<Record<SettingKey, string>>) {
  await prisma.$transaction(
    Object.entries(values).map(([key, value]) =>
      prisma.setting.upsert({ where: { key }, update: { value: String(value) }, create: { key, value: String(value) } })
    )
  );
}
