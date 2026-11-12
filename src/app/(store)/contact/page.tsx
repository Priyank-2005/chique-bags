import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { Instagram } from "@/components/icons";
import ContactForm from "@/components/store/ContactForm";
import WhatsAppLinks from "@/components/store/WhatsAppLinks";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Contact us", description: "Questions about an order or a bag? Get in touch with Chique Bags." };
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const s = await getSettings();
  return (
    <div className="wrap py-12 lg:py-16">
      <p className="eyebrow">Get in touch</p>
      <h1 className="h-display mt-2 text-4xl sm:text-5xl">We'd love to hear from you</h1>
      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <p className="max-w-md leading-relaxed text-muted">Questions about an order, a bag or a custom request? Send us a message and we'll reply within one working day.</p>
          <ul className="space-y-4 text-sm">
            <li className="flex items-center gap-3"><Mail size={18} className="text-rose" /> {s.contactEmail}</li>
            {s.contactPhone && <li className="flex items-center gap-3"><Phone size={18} className="text-rose" /> {s.contactPhone}</li>}
            {s.address && <li className="flex items-center gap-3"><MapPin size={18} className="text-rose" /> {s.address}</li>}
            {s.instagram && <li><a href={s.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-rose"><Instagram size={18} className="text-rose" /> @chiquebagsofficial</a></li>}
          </ul>
          <WhatsAppLinks numbers={s.whatsappNumbers} heading="Chat on WhatsApp" message="Hi Chique Bags, I have a question." compact />
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
