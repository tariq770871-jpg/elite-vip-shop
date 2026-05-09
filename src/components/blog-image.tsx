"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";

interface BlogImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function BlogImage({ src, alt, fill, className, sizes, priority }: BlogImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className || ""}`} style={fill ? { position: "absolute", inset: 0 } : undefined}>
        <div className="flex flex-col items-center gap-1 text-muted-foreground">
          <ImageIcon className="size-8" />
          <span className="text-xs">{alt}</span>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={() => setError(true)}
    />
  );
}
