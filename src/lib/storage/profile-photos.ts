import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const bucketName = "profile-photos";
const maxCompressedSize = 1024 * 1024;
const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

async function ensureProfilePhotosBucket() {
  const supabase = getSupabaseAdminClient();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    throw listError;
  }

  if (buckets.some((bucket) => bucket.name === bucketName)) {
    return;
  }

  const { error } = await supabase.storage.createBucket(bucketName, {
    public: true,
    allowedMimeTypes: Array.from(acceptedTypes),
    fileSizeLimit: maxCompressedSize,
  });

  if (error) {
    throw error;
  }
}

export async function uploadProfilePhoto(input: {
  file: File;
  ownerId: string;
  folder: "freelancers" | "establishments";
}) {
  if (!acceptedTypes.has(input.file.type)) {
    throw new Error("Envie uma imagem JPG, PNG ou WebP.");
  }

  if (input.file.size > maxCompressedSize) {
    throw new Error("A foto comprimida deve ter no maximo 1 MB.");
  }

  await ensureProfilePhotosBucket();

  const extension = input.file.type === "image/png" ? "png" : "webp";
  const path = `${input.folder}/${input.ownerId}/avatar-${Date.now()}.${extension}`;
  const { error } = await getSupabaseAdminClient().storage
    .from(bucketName)
    .upload(path, input.file, {
      cacheControl: "31536000",
      contentType: input.file.type,
      upsert: true,
    });

  if (error) {
    throw error;
  }

  const { data } = getSupabaseAdminClient().storage
    .from(bucketName)
    .getPublicUrl(path);

  return data.publicUrl;
}
