import { randomBytes } from "crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

/** A random link token. Guests get one per order so they can see it again from the link in their emails. */
export function newAccessToken(): string {
  return randomBytes(18).toString("base64url");
}

/**
 * Where a customer should be sent to see an order. Order status lives in the account: signed-up customers go
 * straight to the order; a guest is sent to create an account with the same email (their orders attach to it).
 */
export function orderPath(o: { id: string; userId: string | null; customerEmail: string }): string {
  if (o.userId) return `/account/orders/${o.id}`;
  return `/signup?email=${encodeURIComponent(o.customerEmail)}&next=${encodeURIComponent("/account/orders")}`;
}

/** The query string that lets a guest back into their own order (empty for signed-in customers). */
export function guestQuery(token: string | null | undefined): string {
  return token ? `&t=${encodeURIComponent(token)}` : "";
}

/** A customer may open an order if it is theirs, or if they hold its link token. */
export function accessWhere(user: { id: string } | null | undefined, token?: string | null): Prisma.OrderWhereInput | null {
  const or: Prisma.OrderWhereInput[] = [];
  if (user) or.push({ userId: user.id });
  if (token) or.push({ accessToken: token });
  return or.length ? { OR: or } : null;
}

/** Attaches earlier guest orders to an account once its owner has proved they control the email. */
export async function claimGuestOrders(userId: string, email: string) {
  const address = email.trim().toLowerCase();
  await prisma.order.updateMany({ where: { userId: null, customerEmail: { equals: address, mode: "insensitive" } }, data: { userId } });
  await prisma.returnRequest.updateMany({ where: { userId: null, order: { userId } }, data: { userId } });
}
