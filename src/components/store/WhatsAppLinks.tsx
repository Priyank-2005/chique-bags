import { WhatsAppIcon } from "@/components/icons";
import { formatWhatsapp, whatsappLink } from "@/lib/whatsapp";

/** Plain WhatsApp links for a page's content: one button per number, so either can be chosen. */
export default function WhatsAppLinks({ numbers, message, heading, compact = false }: { numbers: string[]; message?: string; heading: string; compact?: boolean }) {
  if (numbers.length === 0) return null;

  if (numbers.length === 1) {
    return (
      <a
        href={whatsappLink(numbers[0], message)}
        target="_blank"
        rel="noopener noreferrer"
        className={
          compact
            ? "btn btn-line btn-sm"
            : "mt-3 flex items-center justify-center gap-2.5 border border-[#25D366] py-3.5 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-[#128C7E] transition hover:bg-[#25D366] hover:text-white"
        }
      >
        {!compact && <WhatsAppIcon size={18} />} {heading}
      </a>
    );
  }

  return (
    <div className={compact ? "" : "mt-3 border border-[#25D366] p-4"}>
      <p className={compact ? "text-sm font-medium" : "flex items-center justify-center gap-2.5 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-[#128C7E]"}>
        {!compact && <WhatsAppIcon size={18} />} {heading}
      </p>
      <div className={compact ? "mt-2 flex flex-wrap gap-2" : "mt-3 grid gap-2 sm:grid-cols-2"}>
        {numbers.map((n) => (
          <a
            key={n}
            href={whatsappLink(n, message)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 border border-[#25D366] px-4 py-2.5 text-sm font-medium text-[#128C7E] transition hover:bg-[#25D366] hover:text-white"
          >
            <WhatsAppIcon size={16} /> {formatWhatsapp(n)}
          </a>
        ))}
      </div>
    </div>
  );
}
