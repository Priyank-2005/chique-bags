"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";
import { formatWhatsapp, whatsappLink } from "@/lib/whatsapp";

/**
 * Floating chat button. On a product page the message is pre-filled with that product.
 * With one number it opens the chat directly; with several it opens a small list to choose from.
 */
export default function WhatsAppButton({ numbers }: { numbers: string[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // Close the list when the page changes, on Escape, or when tapping elsewhere.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  if (numbers.length === 0 || pathname.startsWith("/checkout")) return null;

  const onProduct = pathname.startsWith("/products/");
  const text = onProduct
    ? `Hi Chique Bags, I'd like to know more about this bag: ${typeof window !== "undefined" ? window.location.href : ""}`
    : "Hi Chique Bags, I have a question.";

  const fab =
    "group flex items-center gap-3 rounded-full bg-[#25D366] p-3.5 text-white shadow-[0_10px_30px_-8px_rgba(0,0,0,0.45)] transition hover:scale-105";
  const label = <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300 group-hover:max-w-[10rem] group-hover:pr-1.5 lg:inline">Chat with us</span>;

  if (numbers.length === 1) {
    return (
      <a href={whatsappLink(numbers[0], text)} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp" className={`${fab} fixed bottom-5 right-5 z-[80] lg:bottom-7 lg:right-7`}>
        <WhatsAppIcon size={28} />
        {label}
      </a>
    );
  }

  return (
    <div ref={box} className="fixed bottom-5 right-5 z-[80] flex flex-col items-end gap-3 lg:bottom-7 lg:right-7">
      {open && (
        <div id="whatsapp-numbers" role="dialog" aria-label="Choose a WhatsApp number" className="w-[min(18rem,calc(100vw-2.5rem))] border border-line bg-white p-4 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold">Chat with us on WhatsApp</p>
            <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="-mr-1 -mt-1 p-1 text-muted hover:text-ink"><X size={16} /></button>
          </div>
          <p className="mt-1 text-xs text-muted">Pick a number. Either one reaches us.</p>
          <ul className="mt-3 space-y-2">
            {numbers.map((n) => (
              <li key={n}>
                <a
                  href={whatsappLink(n, text)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 border border-[#25D366] px-3.5 py-2.5 text-sm font-medium text-[#128C7E] transition hover:bg-[#25D366] hover:text-white"
                >
                  <WhatsAppIcon size={18} /> {formatWhatsapp(n)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="whatsapp-numbers" aria-label="Chat with us on WhatsApp" className={fab}>
        <WhatsAppIcon size={28} />
        {label}
      </button>
    </div>
  );
}
