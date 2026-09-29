"use client";

import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  /** Rendered if the image is missing or fails to load. */
  fallbackSrc?: string;
};

/**
 * Image that falls back when the file cannot be loaded.
 *
 * The previous code only handled an EMPTY imageUrl. If the database
 * pointed at a file that did not exist - which is exactly what happened
 * when the artwork moved from .svg to .jpg - the browser showed a
 * broken-image icon instead of anything useful.
 */
export default function SafeImage({ src, alt, className, fallbackSrc }: Props) {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={showFallback ? fallbackSrc || "/placeholder-product.jpg" : src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (!showFallback) setFailed(true);
      }}
    />
  );
}