import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Invoice from "@/components/store/Invoice";
import { prisma } from "@/lib/db";
import { ensureInvoiceNumber } from "@/lib/gst";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Invoice", robots: { index: false } };
export const dynamic = "force-dynamic";

// A guest's invoice, opened with the private link from their order email.
export default async function GuestInvoice({ searchParams }: { searchParams: Promise<{ o?: string; t?: string }> }) {
  const { o, t } = await searchParams;
  if (!o || !t) notFound();
  const found = await prisma.order.findFirst({ where: { orderNumber: o.toUpperCase(), accessToken: t }, select: { id: true } });
  if (!found) notFound();
  const inv = await ensureInvoiceNumber(found.id);
  if (!inv) notFound();
  const [order, settings] = await Promise.all([prisma.order.findUnique({ where: { id: found.id }, include: { items: true } }), getSettings()]);
  if (!order) notFound();
  return <Invoice order={order} settings={settings} invoiceNumber={inv.invoiceNumber} invoiceDate={inv.invoiceDate} />;
}
