import { Camera, Info } from "lucide-react";
import { AppShell } from "@/components/app-shell";

const topics = ["읽기", "걷기", "운동", "명상", "수면", "식사", "만남", "쉬기", "기록하기", "기타"];

export default function RecordPage() {
  return (
    <AppShell>
      <header className="simple-header"><span className="eyebrow">MY CARE</span><h1>오늘의 나를 돌보기</h1><p>크고 특별하지 않아도 괜찮아요.<br />오늘 나를 위해 한 일을 남겨보세요.</p></header>
      <form className="record-form">
        <fieldset>
          <legend>어떤 돌봄이었나요? <span>선택</span></legend>
          <p className="field-help">정하지 않아도 기록할 수 있어요.</p>
          <div className="topic-grid">
            {topics.map((topic) => <button type="button" key={topic} className="topic-button">{topic}</button>)}
          </div>
        </fieldset>
        <label className="field-label" htmlFor="care-content">오늘의 돌봄 이야기</label>
        <div className="textarea-wrap">
          <textarea id="care-content" placeholder="오늘 나를 위해 무엇을 했나요?" maxLength={500} />
          <span>0 / 500</span>
        </div>
        <div>
          <span className="field-label">사진 <small>선택 · 최대 1장</small></span>
          <button className="photo-button" type="button"><Camera size={23} aria-hidden="true" /><span>사진 한 장 추가하기</span></button>
        </div>
        <div className="gentle-note"><Info size={17} aria-hidden="true" /><p>완벽한 하루보다, 나를 돌아본 마음이 더 중요해요.</p></div>
        <button className="primary-button" type="button">기록하기</button>
      </form>
    </AppShell>
  );
}
