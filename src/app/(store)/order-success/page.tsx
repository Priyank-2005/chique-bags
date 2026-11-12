import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { accessWhere, guestQuery, orderPath } from "@/lib/order-access";
import { prisma } from "@/lib/db";
import { formatINR } from "@/lib/utils";

export const metadata: Metadata = { title: "Order placed", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function OrderSuccessPage({ searchParams }: { searchParams: Promise<{ id?: string; t?: string }> }) {
  const { id, t } = await searchParams;
  const user = await getSessionUser();
  const access = accessWhere(user, t);
  if (!id || !access) notFound();
  const order = await prisma.order.findFirst({ where: { id, ...access }, include: { items: true } });
  if (!order) notFound();
  const guest = !order.userId;
  if (order.paymentMethod === "ONLINE" && order.paymentStatus !== "PAID") redirect(`/order-failed?id=${order.id}${guestQuery(guest ? t : null)}`);

  return (
    <div className="wrap max-w-2xl py-16 text-center">
      <CheckCircle2 size={56} className="mx-auto text-emerald-600" />
      <h1 className="h-display mt-5 text-4xl sm:text-5xl">Thank you, {order.customerName.split(" ")[0]}</h1>
      <p className="mt-3 text-muted">
        {order.needsAttention
          ? "We've received your payment but one item sold out at the same moment. We'll contact you shortly to sort it out."
          : `Your order ${order.orderNumber} is confirmed. A confirmation has been emailed to ${order.customerEmail}.`}
      </p>

      <div className="card mt-10 p-6 text-left">
        <div className="flex justify-between border-b border-line pb-4 text-sm">
          <span className="text-muted">Order number</span><strong>{order.orderNumber}</strong>
        </div>
        <ul className="divide-y divide-line">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-4 py-3 text-sm">
              <span>{i.name} <span className="text-muted">· {i.variantName} × {i.quantity}</span></span>
              <span className="font-medium">{formatINR(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        {order.giftBox && <p className="border-t border-line py-3 text-sm text-muted">Gift box included{order.giftNote ? <> · note: <em>“{order.giftNote}”</em></> : null}</p>}
        <div className="flex justify-between border-t border-line pt-4 text-lg font-semibold">
          <span>Paid</span><span>{formatINR(order.total)}</span>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={orderPath(order)} className="btn btn-dark">{guest ? "Create an account to track it" : "View order"}</Link>
        <Link href="/shop" className="btn btn-line">Continue shopping</Link>
      </div>
      {guest && (
        <div className="card mt-10 p-6 text-left">
          <h2 className="font-serif text-xl font-semibold">Track this order from your account</h2>
          <p className="mt-1 text-sm text-muted">
            Create an account with {order.customerEmail} to see where your order is, download your invoice, save your address and check out in a few taps next time. This order will appear in it automatically.
          </p>
          <Link href={orderPath(order)} className="btn btn-line btn-sm mt-4">Create an account</Link>
        </div>
      )}
    </div>
  );
}
