import Image from "next/image";

export default function FramedPhoto({
  src,
  alt,
  aspect = "4 / 3",
  priority = false,
  sizes = "(min-width: 1024px) 40vw, 100vw",
  objectPosition,
}: {
  src: string;
  alt: string;
  aspect?: string;
  priority?: boolean;
  sizes?: string;
  objectPosition?: string;
}) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl shadow-lg"
      style={{ aspectRatio: aspect }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover"
        style={objectPosition ? { objectPosition } : undefined}
        priority={priority}
      />
    </div>
  );
}
