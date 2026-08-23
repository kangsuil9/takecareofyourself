import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { AppShell } from "@/components/app-shell";

const categories = [
  { label: "걷기", value: 3, tone: "green" },
  { label: "쉬기", value: 2, tone: "peach" },
  { label: "읽기", value: 1, tone: "blue" },
  { label: "식사", value: 2, tone: "yellow" },
];

export default function MePage() {
  return (
    <AppShell>
      <header className="profile-header">
        <span className="eyebrow">MY PAGE</span>
        <div className="profile-row"><div className="profile-avatar">온</div><div><p>반가워요,</p><h1>온유한마음님</h1></div></div>
      </header>
      <section className="reflection-section">
        <div className="section-heading"><div><span className="eyebrow">THIS WEEK</span><h2>이번 주의 나</h2></div><CalendarDays size={21} aria-hidden="true" /></div>
        <div className="summary-card week"><strong>8번</strong><span>나를 돌보는 시간을 가졌어요</span><p>천천히, 나에게 맞는 리듬을 알아가고 있어요.</p></div>
      </section>
      <section className="reflection-section">
        <div className="section-heading"><div><span className="eyebrow">THIS MONTH</span><h2>이번 달의 나</h2></div><span className="muted-label">8월</span></div>
        <div className="summary-card month">
          <div className="month-total"><strong>21</strong><span>번의 돌봄</span></div>
          <div className="category-list">
            {categories.map((category) => (
              <div className="category-row" key={category.label}><span>{category.label}</span><div className="bar-track"><i className={category.tone} style={{ width: `${category.value * 25}%` }} /></div><strong>{category.value}회</strong></div>
            ))}
          </div>
        </div>
      </section>
      <Link href="/me/records" className="outline-button">나의 기록 보기 <ArrowRight size={17} aria-hidden="true" /></Link>
      <p className="closing-copy">서두르지 않아도 괜찮아요.<br />당신만의 돌봄이 차곡차곡 쌓이고 있어요.</p>
    </AppShell>
  );
}
