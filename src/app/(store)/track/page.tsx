import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Order status is shown in the customer's account only. Anyone opening this page (the menu, the footer,
// or an old tracking link) is sent to their orders, and asked to log in first if they are not.
export default async function TrackPage() {
  const user = await getSessionUser();
  redirect(user ? "/account/orders" : "/login?next=/account/orders");
}
