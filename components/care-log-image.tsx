"use client";

import { useState } from "react";

export function CareLogImage({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return <img className="care-log-image" src={src} alt="돌봄 기록 사진" onError={() => setFailed(true)} />;
}
