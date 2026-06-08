"use client";

import { useState } from "react";
import { ImageUp } from "lucide-react";

const maxOriginalSize = 8 * 1024 * 1024;
const targetSize = 512;
const quality = 0.78;

async function compressImage(file: File) {
  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = imageUrl;
    });

    const scale = Math.min(1, targetSize / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Nao foi possivel preparar a imagem.");
    }

    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", quality);
    });

    if (!blob) {
      throw new Error("Nao foi possivel comprimir a imagem.");
    }

    return new File([blob], "avatar.webp", { type: "image/webp" });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

type Props = {
  currentUrl?: string | null;
  hiddenName?: string;
  fileName?: string;
  label?: string;
};

export function ProfilePhotoInput({
  currentUrl,
  hiddenName = "profilePhotoUrl",
  fileName = "profilePhotoFile",
  label = "Foto de perfil",
}: Props) {
  const [previewUrl, setPreviewUrl] = useState(currentUrl ?? "");
  const [message, setMessage] = useState("");

  return (
    <section className="grid gap-3 rounded-lg border bg-muted/20 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-input">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="size-full object-cover" />
          ) : (
            <ImageUp className="size-6 text-muted-foreground" />
          )}
        </div>
        <div className="grid gap-2">
          <label className="grid gap-1.5 text-sm font-medium">
            {label}
            <input
              accept="image/jpeg,image/png,image/webp"
              className="text-sm text-foreground file:mr-3 file:h-9 file:rounded-md file:border-0 file:bg-primary file:px-3 file:text-sm file:font-medium file:text-primary-foreground"
              name={fileName}
              type="file"
              onChange={async (event) => {
                const input = event.currentTarget;
                const file = input.files?.[0];
                setMessage("");

                if (!file) {
                  return;
                }

                if (file.size > maxOriginalSize) {
                  input.value = "";
                  setMessage("A imagem original pode ter no maximo 8 MB.");
                  return;
                }

                try {
                  const compressed = await compressImage(file);
                  const transfer = new DataTransfer();
                  transfer.items.add(compressed);
                  input.files = transfer.files;
                  setPreviewUrl(URL.createObjectURL(compressed));
                  setMessage(
                    `Imagem reduzida para ${(compressed.size / 1024).toFixed(0)} KB.`,
                  );
                } catch {
                  input.value = "";
                  setMessage("Nao foi possivel comprimir esta imagem.");
                }
              }}
            />
          </label>
          <p className="text-xs leading-5 text-muted-foreground">
            Aceita JPG, PNG ou WebP ate 8 MB. A imagem sera reduzida antes do envio.
          </p>
          {message ? <p className="text-xs text-primary/80">{message}</p> : null}
        </div>
      </div>
      <input type="hidden" name={hiddenName} value={currentUrl ?? ""} />
    </section>
  );
}
