import type { Metadata } from "next";
import PolicyPage from "@/components/layout/PolicyPage";

export const metadata: Metadata = { title: "Shipping & delivery policy" };

export default function ShippingPage() {
  return (
    <PolicyPage
      title="Shipping & delivery policy"
      updated="November 2026"
      sections={[
        {
          heading: "Processing and delivery",
          body: "We process your order as early as possible and ship it via our trusted logistics partner. Any order placed will be delivered to you within 8 to 10 business days, excluding Sundays and public holidays. It's not possible for us to provide a dispatch date for every order, so we politely request you not to ask for it. However, if your parcel is not delivered in 10 working days, you're most welcome to message us on WhatsApp 9817742416 and we shall give you full support.\n\nKindly note: before 10 working days, we're not obliged to confirm anything.",
        },
        { heading: "Where we deliver", body: "We deliver to every valid pincode across India, and we check your pincode at checkout. Orders outside India are not available at the moment." },
        { heading: "Shipping charges", body: "Shipping is free on every order, anywhere in India. The price you see at checkout is the price you pay." },
        { heading: "Tracking", body: "As soon as your order is shipped you'll receive an email with the courier name and a tracking link. You can also see the status of every order in your account: log in and open My orders." },
        { heading: "Payment", body: "We accept prepaid orders only. Pay securely online by UPI, card, net banking or wallet through Razorpay before your order is packed." },
      ]}
    />
  );
}
