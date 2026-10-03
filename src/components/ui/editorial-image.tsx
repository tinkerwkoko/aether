import Image from "next/image";

type EditorialImageProps = {
  /** Null while no photography exists; a labelled placeholder is rendered instead. */
  src: string | null;
  alt: string;
  /** Tailwind aspect ratio utility, e.g. "aspect-4/5". */
  ratioClass: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

/**
 * Renders real photography when an image source exists, otherwise a warm-stone
 * placeholder panel labelled with what will eventually appear there.
 */
export function EditorialImage({
  src,
  alt,
  ratioClass,
  sizes = "100vw",
  priority = false,
  className = "",
}: EditorialImageProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={1500}
        sizes={sizes}
        priority={priority}
        className={`${ratioClass} w-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={`${alt} - image placeholder`}
      className={`${ratioClass} flex w-full items-end bg-stone p-4 sm:p-6 ${className}`}
    >
      <span className="text-[0.65rem] uppercase tracking-[0.2em] text-charcoal/50">
        {alt} - placeholder
      </span>
    </div>
  );
}