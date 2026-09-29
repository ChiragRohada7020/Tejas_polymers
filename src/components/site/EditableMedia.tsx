"use client";

import { useRef, useState } from "react";
import { useIsEditing } from "@/components/site/EditModeContext";

type Props = {
  imageKey: string;
  altKey: string;
  editMode: boolean;
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  fallback: React.ReactNode;
};

/**
 * Logo / media block. Public visitors see the plain image (or the wordmark
 * fallback). Admins in edit mode can click to replace the image and edit alt text.
 */
export default function EditableMedia({
  imageKey,
  altKey,
  editMode,
  src,
  alt,
  className,
  imgClassName,
  fallback,
}: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = preview ?? src;

  if (!useIsEditing(editMode)) {
    if (!current) return <>{fallback}</>;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={current} alt={alt} className={imgClassName} loading="lazy" />;
  }

  async function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/admin/uploads", { method: "POST", body: form });
      const data = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error || "Upload failed.");
      setPreview(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className={className} title="Click the logo to replace it">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="relative block rounded-lg"
        aria-label="Replace logo image"
      >
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current}
            alt={alt}
            className={imgClassName}
            data-content-key={imageKey}
            data-content-kind="image"
          />
        ) : (
          fallback
        )}
        <span className="absolute -bottom-2 -right-2 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
          {busy ? "…" : "🖼"}
        </span>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={onPick}
        aria-label="Upload replacement logo"
      />
      <span
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        data-content-key={altKey}
        data-content-kind="text"
        title="Edit logo alt text"
        className="mt-1 block max-w-40 truncate text-[10px] text-slate-400"
      >
        {alt}
      </span>
      {error && <span className="mt-1 block text-[11px] text-red-600">{error}</span>}
    </span>
  );
}
