import { prisma } from "@/lib/db";

const select = {
  orderNumber: true,
  status: true,
  paymentStatus: true,
  courier: true,
  trackingUrl: true,
  createdAt: true,
  items: { select: { name: true, variantName: true, quantity: true } },
} as const;

export type TrackResult = {
  orderNumber: string;
  status: string;
  courier: string | null;
  trackingUrl: string | null;
  createdAt: string;
  items: { name: string; variantName: string | null; quantity: number }[];
  /** Only set when the visitor came with the order's private link: it opens the invoice. */
  invoicePath: string | null;
};

/**
 * Looks an order up by its number plus either the email used or the private link token.
 * Returns status only, never contact details or the address.
 */
export async function getTrackResult(input: { orderNumber: string; email?: string; token?: string }): Promise<TrackResult | null> {
  const orderNumber = input.orderNumber.trim().toUpperCase();
  if (!orderNumber || (!input.email && !input.token)) return null;
  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
      ...(input.token ? { accessToken: input.token } : { customerEmail: { equals: input.email!.trim(), mode: "insensitive" as const } }),
    },
    select,
  });
  if (!order) return null;
  const paid = ["PAID", "PARTIALLY_REFUNDED", "REFUNDED"].includes(order.paymentStatus);
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    courier: order.courier,
    trackingUrl: order.trackingUrl,
    createdAt: order.createdAt.toISOString(),
    items: order.items,
    invoicePath: input.token && paid ? `/track/invoice?o=${encodeURIComponent(order.orderNumber)}&t=${encodeURIComponent(input.token)}` : null,
  };
}
