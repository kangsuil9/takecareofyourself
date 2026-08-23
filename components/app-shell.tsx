import type { ReactNode } from "react";
import { BottomNav } from "@/components/bottom-nav";

export function AppShell({ children, withNav = true }: { children: ReactNode; withNav?: boolean }) {
  return (
    <div className="app-frame">
      <main className={withNav ? "page-content with-nav" : "page-content"}>{children}</main>
      {withNav ? <BottomNav /> : null}
    </div>
  );
}
