import Image from "next/image";

/** Marca Moven: ícone + nome. O texto segue --mv-text (tema); sem ele, branco (landing). */
export function MovenLogo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <Image src="/MovenLogo.png" alt="" width={36} height={36} className="scale-[1.35]" />
      </span>
      <span className="text-xl font-extrabold tracking-tight text-[var(--mv-text,#fff)]">
        Moven
      </span>
    </span>
  );
}
