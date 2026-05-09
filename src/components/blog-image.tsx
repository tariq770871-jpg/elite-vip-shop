"use client";

import Image from "next/image";

interface BlogImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function BlogImage({ src, alt, fill, className, sizes, priority }: BlogImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = "none";
      }}
    />
  );
}
