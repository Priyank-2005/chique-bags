/**
 * Uploads images straight from the admin's browser to Cloudinary, using a signature from our server
 * (so the API secret never reaches the browser). Returns the secure URL of each uploaded image.
 */
export async function uploadImages(files: FileList | File[]): Promise<string[]> {
  const sigRes = await fetch("/api/admin/cloudinary-signature", { method: "POST" });
  const sig = await sigRes.json().catch(() => ({}));
  if (!sigRes.ok) throw new Error(sig.error ?? "Upload is not set up");
  const urls: string[] = [];
  for (const file of Array.from(files)) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("api_key", sig.apiKey);
    fd.append("timestamp", String(sig.timestamp));
    fd.append("folder", sig.folder);
    fd.append("signature", sig.signature);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error?.message ?? "Upload failed");
    urls.push(data.secure_url);
  }
  return urls;
}
