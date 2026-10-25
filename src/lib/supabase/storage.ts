import { createClient } from "./client";

export async function uploadFileToBucket(
  bucket: "artworks" | "categories" | "site-assets" | "service-images",
  path: string,
  file: File
): Promise<{ publicUrl: string; storagePath: string } | null> {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    console.error("Storage upload error:", error);
    throw new Error(error.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return {
    publicUrl,
    storagePath: data.path,
  };
}

export async function deleteFileFromBucket(
  bucket: "artworks" | "categories" | "site-assets" | "service-images",
  path: string
): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.warn("Storage delete warning:", error);
    return false;
  }
  return true;
}
