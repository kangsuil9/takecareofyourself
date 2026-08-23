"use client";

import Link from "next/link";
import { BookHeart, CircleUserRound, PenLine } from "lucide-react";
import { usePathname } from "next/navigation";

const items = [
  { href: "/care", label: "돌봄", icon: BookHeart },
  { href: "/record", label: "기록", icon: PenLine },
  { href: "/me", label: "나", icon: CircleUserRound },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" aria-label="주요 메뉴">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/care" ? pathname.startsWith("/care") : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={active ? "nav-item active" : "nav-item"} aria-current={active ? "page" : undefined}>
            <Icon size={21} strokeWidth={active ? 2.2 : 1.7} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
