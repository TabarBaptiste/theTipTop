'use client';

import Image from 'next/image';

import { loaderCloudinary } from '@/lib/cloudinary';

// Enveloppe minimale autour de next/image, dont l'unique role est de retenir
// le loader du cote client.
//
// Sans elle, un composant serveur passant `loader={...}` a next/image echoue au
// prerendu : « Functions cannot be passed directly to Client Components ».
// next/image etant lui-meme un composant client, la fonction devrait traverser
// la frontiere - ce que React interdit. Ici elle ne la traverse pas : elle est
// importee directement par ce module, et seules des props serialisables
// arrivent depuis l'appelant.
//
// L'alternative aurait ete `unoptimized` avec une URL unique, au prix du
// srcset : un telephone aurait telecharge l'image pleine largeur.

interface PhotoCloudinaryProps {
  /** Identifiant public Cloudinary, sans domaine ni transformation. */
  readonly src: string;
  readonly alt: string;
  readonly sizes: string;
  readonly className?: string;
  /** A reserver a l'image LCP : elle est alors prechargee. */
  readonly priority?: boolean;
  readonly quality?: number;
}

export function PhotoCloudinary({
  src,
  alt,
  sizes,
  className,
  priority,
  quality,
}: PhotoCloudinaryProps) {
  return (
    <Image
      loader={loaderCloudinary}
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      priority={priority}
      quality={quality}
    />
  );
}
