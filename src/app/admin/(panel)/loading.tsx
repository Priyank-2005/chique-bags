import { BrandLoader } from "@/components/admin/AdminLoader";

// Shown inside the admin panel while a page's data is loading.
export default function Loading() {
  return (
    <div className="grid min-h-[55vh] place-items-center">
      <BrandLoader subtle message="Loading…" />
    </div>
  );
}
