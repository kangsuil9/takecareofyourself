import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { AppShell } from "@/components/app-shell";

const feed = [
  {
    initials: "온",
    nickname: "온유한마음",
    category: "걷기",
    time: "오늘 오후 4:20",
    text: "아이를 데리러 가는 길에 한 정거장 먼저 내려 천천히 걸었어요. 바람이 생각보다 부드러웠습니다.",
    likes: 12,
    image: true,
  },
  {
    initials: "여",
    nickname: "여름나무",
    category: "쉬기",
    time: "오늘 오전 11:05",
    text: "할 일을 잠시 내려놓고 따뜻한 차 한 잔을 끝까지 마셨어요. 짧아도 온전히 쉬는 시간이었어요.",
    likes: 8,
    image: false,
  },
];

export default function CarePage() {
  return (
    <AppShell>
      <header className="brand-header">
        <div>
          <span className="eyebrow">TAKE CARE OF YOURSELF</span>
          <h1>돌봄</h1>
        </div>
        <div className="brand-mark" aria-hidden="true"><span /></div>
      </header>

      <section className="intro-section">
        <p>사람들은 자신을<br />이렇게 돌보고 있습니다.</p>
      </section>

      <section className="knowledge-card">
        <div className="knowledge-art" aria-hidden="true"><span className="sun" /><span className="hill one" /><span className="hill two" /></div>
        <div className="knowledge-copy">
          <span className="card-kicker">오늘의 돌봄 지식 · 수면</span>
          <h2>잠을 줄여 만든 나만의 시간은<br />정말 나를 위한 시간일까요?</h2>
          <p>편안한 밤을 만드는 작은 단서를 살펴보세요.</p>
          <Link href="/care/articles/restful-sleep" className="inline-link">천천히 읽어보기 <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </section>

      <Link href="/care/articles" className="more-link">건강 이야기 더보기 <ArrowRight size={17} aria-hidden="true" /></Link>

      <section className="feed-section" aria-labelledby="care-feed-title">
        <div className="section-heading">
          <div><span className="eyebrow">OUR MOMENTS</span><h2 id="care-feed-title">오늘의 돌봄</h2></div>
          <span className="muted-label">최신순</span>
        </div>
        <div className="feed-list">
          {feed.map((post) => (
            <article className="feed-card" key={post.nickname}>
              <header className="feed-author">
                <div className="avatar" aria-hidden="true">{post.initials}</div>
                <div><strong>{post.nickname}</strong><span>{post.time}</span></div>
                <span className="category-chip">{post.category}</span>
              </header>
              <p>{post.text}</p>
              {post.image ? <div className="feed-image" role="img" aria-label="햇살 아래 이어진 조용한 산책길의 예시 이미지 영역"><span /><i /></div> : null}
              <button className="heart-button" type="button" aria-label="좋아요 (정적 예시)" disabled>
                <Heart size={19} aria-hidden="true" /> <span>{post.likes}</span>
              </button>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
