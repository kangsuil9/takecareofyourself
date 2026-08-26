import Link from "next/link";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return <div className="admin-frame"><header className="admin-topbar"><Link href="/admin/articles"><span>돌봄</span> 건강지식 CMS</Link><Link href="/care" className="admin-care-link">사용자 화면</Link></header><main>{children}</main></div>;
}
