import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function PageHeader({ title, backHref }: { title: string; backHref?: string }) {
  return (
    <header className="sub-header">
      {backHref ? (
        <Link href={backHref} className="icon-button" aria-label="이전 화면으로">
          <ChevronLeft size={22} aria-hidden="true" />
        </Link>
      ) : <span className="header-spacer" />}
      <h1>{title}</h1>
      <span className="header-spacer" />
    </header>
  );
}
