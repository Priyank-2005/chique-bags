import Link from "next/link";
import type { Metadata } from "next";
import { XCircle } from "lucide-react";
import PayNowButton from "@/components/store/PayNowButton";
import { getSessionUser } from "@/lib/auth";
import { accessWhere } from "@/lib/order-access";
import { prisma } from "@/lib/db";
import { formatINR } from "@/lib/utils";

export const metadata: Metadata = { title: "Payment failed", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function OrderFailedPage({ searchParams }: { searchParams: Promise<{ id?: string; t?: string }> }) {
  const { id, t } = await searchParams;
  const user = await getSessionUser();
  const access = accessWhere(user, t);
  const order = id && access ? await prisma.order.findFirst({ where: { id, paymentMethod: "ONLINE", ...access } }) : null;
  const payable = order && order.status !== "CANCELLED" && (order.paymentStatus === "UNPAID" || order.paymentStatus === "FAILED");

  return (
    <div className="wrap max-w-xl py-20 text-center">
      <XCircle size={56} className="mx-auto text-berry" />
      <h1 className="h-display mt-5 text-4xl">Payment didn&apos;t go through</h1>
      <p className="mt-3 text-muted">
        {payable
          ? `No money has been taken for order ${order.orderNumber}. Your bag is saved, so you can pay for it now.`
          : "No money has been taken for this order. Your bag is still saved, so you can try again whenever you are ready."}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {payable ? <PayNowButton orderId={order.id} token={order.userId ? null : t} label={`Pay ${formatINR(order.total)} now`} /> : <Link href="/checkout" className="btn btn-dark">Try again</Link>}
        <Link href="/cart" className="btn btn-line">Review bag</Link>
      </div>
      <p className="mt-8 text-sm text-muted">If money was deducted from your account, it will be refunded automatically within 5–7 working days, or <Link href="/contact" className="underline">contact us</Link>.</p>
    </div>
  );
}
