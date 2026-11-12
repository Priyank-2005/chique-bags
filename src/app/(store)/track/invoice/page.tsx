import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Invoices are opened from the customer's account, after logging in.
export default async function GuestInvoice() {
  const user = await getSessionUser();
  redirect(user ? "/account/orders" : "/login?next=/account/orders");
}
