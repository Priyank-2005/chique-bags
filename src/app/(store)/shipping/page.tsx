import type { Metadata } from "next";
import PolicyPage from "@/components/layout/PolicyPage";
import { getSettings } from "@/lib/settings";
import { formatINR } from "@/lib/utils";

export const metadata: Metadata = { title: "Shipping & delivery policy" };
export const dynamic = "force-dynamic";

export default async function ShippingPage() {
  const s = await getSettings();
  return (
    <PolicyPage
      title="Shipping & delivery"
      updated="November 2026"
      sections={[
        { heading: "Where we deliver", body: "We deliver to every valid pincode across India, and we check your pincode at checkout. Orders outside India are not available at the moment." },
        { heading: "Delivery time", body: "Your order is delivered in 8–10 business days across India. Remote areas can take a little longer." },
                { heading: "Shipping charges", body: "Shipping is free on every order, anywhere in India. The price you see at checkout is the price you pay." },
        { heading: "Tracking", body: "As soon as your order is shipped you'll receive an email with the courier name and a tracking link. You can also see the status of every order in your account: log in and open My orders." },
        { heading: "Payment", body: "We accept prepaid orders only. Pay securely online by UPI, card, net banking or wallet through Razorpay before your order is packed." },
        { heading: "Need help?", body: `Write to us at ${s.contactEmail} with your order number and we'll sort it out.` },
      ]}
    />
  );
}
