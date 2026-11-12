import type { Order, OrderItem } from "@prisma/client";
import { PrintButton } from "@/components/store/AccountForms";
import { money, rupeesInWords } from "@/lib/gst";
import type { Settings } from "@/lib/settings";
import { formatDate } from "@/lib/utils";

/**
 * Printable invoice, used by the customer account and the admin panel. Prices already include GST,
 * so it shows what the customer paid for each line and no separate tax columns.
 */
export default function Invoice({
  order,
  settings,
  invoiceNumber,
  invoiceDate,
}: {
  order: Order & { items: OrderItem[] };
  settings: Settings;
  invoiceNumber: string;
  invoiceDate: Date;
}) {
  const a = order.shippingAddress as Record<string, string>;
  const rupees = (n: number) => `₹${money(n * 100)}`;
  const th = "px-2 py-2.5 text-xs font-medium uppercase tracking-wider text-muted";
  const contact = [settings.contactEmail, settings.contactPhone].filter(Boolean).join(" · ");

  return (
    <div className="mx-auto max-w-4xl bg-white p-6 text-sm sm:p-10">
      <div className="no-print mb-8 flex justify-end"><PrintButton /></div>

      <div className="flex flex-wrap items-start justify-between gap-6 border-b-2 border-ink pb-6">
        <div>
          <p className="font-serif text-3xl font-medium uppercase tracking-[0.25em]">{settings.legalName || "Chique Bags"}</p>
          <p className="mt-2 max-w-xs leading-relaxed text-muted">
            {settings.address}
            {contact && <><br />{contact}</>}
          </p>
        </div>
        <div className="text-right">
          <p className="eyebrow">Invoice</p>
          <p className="mt-1 text-lg font-semibold">{invoiceNumber}</p>
          <p className="text-muted">Date: {formatDate(invoiceDate)}</p>
          <p className="text-muted">Order: {order.orderNumber}</p>
        </div>
      </div>

      <div className="grid gap-6 py-6 sm:grid-cols-2">
        <div><p className="eyebrow mb-1">Billed to</p><p className="leading-relaxed">{order.customerName}<br />{order.customerEmail}<br />{order.customerPhone}</p></div>
        <div><p className="eyebrow mb-1">Shipped to</p><p className="leading-relaxed">{a.name}<br />{a.line1}{a.line2 && `, ${a.line2}`}<br />{a.city}, {a.state} {a.pincode}</p></div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr className="border-y border-line text-left">
              <th className={th}>Item</th>
              <th className={`${th} text-center`}>Qty</th>
              <th className={`${th} text-right`}>Price</th>
              <th className={`${th} text-right`}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((i) => (
              <tr key={i.id} className="border-b border-line">
                <td className="px-2 py-3">{i.name}{i.variantName && <span className="text-muted"> ({i.variantName})</span>}</td>
                <td className="px-2 py-3 text-center">{i.quantity}</td>
                <td className="px-2 py-3 text-right">{rupees(i.price)}</td>
                <td className="px-2 py-3 text-right font-medium">{rupees(i.price * i.quantity)}</td>
              </tr>
            ))}
            {order.giftBox && (
              <tr className="border-b border-line">
                <td className="px-2 py-3">Gift box and note card</td>
                <td className="px-2 py-3 text-center">1</td>
                <td className="px-2 py-3 text-right">{order.giftFee > 0 ? rupees(order.giftFee) : "Free"}</td>
                <td className="px-2 py-3 text-right font-medium">{order.giftFee > 0 ? rupees(order.giftFee) : "Free"}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <dl className="ml-auto mt-6 w-full max-w-xs space-y-2">
        {order.discount > 0 && <div className="flex justify-between"><dt className="text-muted">Coupon{order.couponCode ? ` (${order.couponCode})` : ""}</dt><dd>−{rupees(order.discount)}</dd></div>}
        <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{order.shipping > 0 ? rupees(order.shipping) : "Free"}</dd></div>
        <div className="flex justify-between border-t border-ink pt-3 text-base font-semibold"><dt>Total</dt><dd>{rupees(order.total)}</dd></div>
        {order.refundedAmount > 0 && <div className="flex justify-between text-berry"><dt>Refunded</dt><dd>−{rupees(order.refundedAmount)}</dd></div>}
      </dl>

      <p className="mt-6 text-sm"><span className="text-muted">Amount in words:</span> {rupeesInWords(order.total)}</p>

      <div className="mt-10 grid gap-4 border-t border-line pt-4 text-xs leading-relaxed text-muted sm:grid-cols-2">
        <p>Payment: paid online ({order.paymentStatus.toLowerCase().replace("_", " ")}){order.razorpayPaymentId ? ` · Ref ${order.razorpayPaymentId}` : ""}.<br />All prices include taxes.</p>
        <p className="sm:text-right">This is a computer-generated invoice and does not require a signature.</p>
      </div>
    </div>
  );
}
