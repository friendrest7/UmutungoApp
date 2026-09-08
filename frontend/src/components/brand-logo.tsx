import Image from "next/image";
import Link from "next/link";

export function BrandLogo({ className = "", textOnly = false }: { className?: string; textOnly?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand-logo ${textOnly ? "brand-logo--text" : ""} ${className}`.trim()}
      aria-label="Umutungo home"
    >
      {textOnly ? (
        <>
          <span className="brand-logo-mark" aria-hidden="true">um</span>
          <span className="brand-logo-word">utungo</span>
        </>
      ) : (
        <Image
          src="/logo.png"
          alt="Umutungo"
          width={169}
          height={96}
          sizes="112px"
        />
      )}
    </Link>
  );
}
