/** Brand loader: the wordmark with a gold line sweeping beneath it. */
export function BrandLoader({ message, subtle = false }: { message?: string; subtle?: boolean }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center">
      <p className="loader-mark font-serif uppercase leading-none text-ink" style={{ fontSize: subtle ? "1.6rem" : "clamp(1.5rem, 8vw, 2.4rem)", letterSpacing: "0.32em", paddingLeft: "0.32em" }}>Chique</p>
      <p className="mt-1 text-[0.62rem] font-medium uppercase tracking-[0.55em] text-gold" style={{ paddingLeft: "0.55em" }}>Bags</p>
      <span className={`relative mt-6 block h-[2px] overflow-hidden bg-[#e6dccb] ${subtle ? "w-28" : "w-44"}`}>
        <span className="loader-bar absolute inset-y-0 left-0 block w-2/5 bg-gold" />
      </span>
      {message && <p className="mt-5 text-sm text-muted">{message}</p>}
      <span className="sr-only">Loading</span>
    </div>
  );
}

/** Full-screen version, shown while signing in. */
export default function AdminLoader({ message }: { message: string }) {
  return (
    <div className="fade-up fixed inset-0 z-[100] grid place-items-center bg-[#faf6ee]/95 backdrop-blur-sm">
      <BrandLoader message={message} />
    </div>
  );
}
