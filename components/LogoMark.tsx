import Image from "next/image";

export default function LogoMark({ size }: { size: number }) {
  return (
    <span
      className="relative inline-flex flex-shrink-0 overflow-hidden rounded-full ring-1 ring-slate-900/25 shadow-[0_2px_5px_rgba(15,23,42,0.15)]"
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo.png"
        alt="Thrive Automation logo"
        width={size}
        height={size}
        className="h-full w-full scale-[2.2] object-contain"
      />
    </span>
  );
}
