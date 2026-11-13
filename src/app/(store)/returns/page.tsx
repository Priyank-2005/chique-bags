import type { Metadata } from "next";
import PolicyPage from "@/components/layout/PolicyPage";

export const metadata: Metadata = { title: "Return & exchange policy" };

export default function ReturnsPage() {
  return (
    <PolicyPage
      title="Return & exchange policy"
      updated="November 2026"
      sections={[
        {
          heading: "Exchanges",
          body: [
            "We only accept exchanges in the case you receive any damaged/defective products (complete unboxing video required, from opening the package to the end, in order to consider).",
            "Only photos will not be considered, and no exchange will be entertained after 2 days of delivery. No exchange will be taken into consideration beyond the given time due to any said reason.",
            "Kindly note, there is no exchange policy in case you do not like the product or do not need it anymore.",
            "Also, we don't have a pickup facility, so you'll have to courier the product back to us.",
            "Contact us on WhatsApp 9817742416 for further details.",
          ],
        },
        { heading: "Cancellations", body: "You can cancel an order from your account any time before it ships, and the full amount is refunded to the original payment method. After shipping, an order can't be cancelled." },
      ]}
    />
  );
}
