import { BRAND_GRADIENT } from "../lib/constants";

interface Props {
  src: string;
  alt: string;
  size?: number;
}

export function AvatarRing({ src, alt, size = 80 }: Props) {
  return (
    <div
      className="rounded-full flex-shrink-0 p-[2px]"
      style={{ background: BRAND_GRADIENT, width: size + 4, height: size + 4 }}
    >
      <div className="p-[2px] bg-background rounded-full w-full h-full">
        <img
          src={src}
          alt={alt}
          className="rounded-full object-cover bg-secondary w-full h-full"
        />
      </div>
    </div>
  );
}
