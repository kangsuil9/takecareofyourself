import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { ARTICLE_CONTENT_BLOCK_MAX_COUNT } from "../lib/articles/content.shared.ts";
import { parseArticleDraft, parseInlineBold } from "../lib/articles/import-draft.ts";
import { hasUnlinkedArticleImage } from "../lib/articles/publishing.ts";
import { parseArticleBlocks } from "../lib/articles/validation.ts";

let sequence = 0;
const createId = () => `test-${++sequence}`;
const parse = (source: string) => parseArticleDraft(source, createId, 5);

test("일반 문단과 문단 내부 줄바꿈을 변환한다", () => {
  const result = parse("첫 줄\n둘째 줄\n\n다음 문단");
  assert.equal(result.success, true);
  if (!result.success) return;
  assert.deepEqual(result.blocks.map((block) => block.type), ["paragraph", "paragraph"]);
  assert.equal(result.blocks[0].type === "paragraph" && result.blocks[0].segments[0].text, "첫 줄\n둘째 줄");
});

test("일반 줄바꿈은 같은 paragraph에 유지하고 빈 줄에서만 새 paragraph를 만든다", () => {
  const result = parse("문장 A\n문장 B\n\n문장 C\n문장 D");
  assert.equal(result.success, true);
  if (!result.success) return;
  assert.equal(result.blocks.length, 2);
  assert.deepEqual(result.blocks.map((block) => block.type === "paragraph" ? block.segments.map((segment) => segment.text).join("") : ""), ["문장 A\n문장 B", "문장 C\n문장 D"]);
});

test("한 문단의 굵은 구절 하나와 여러 개를 segment로 보존한다", () => {
  assert.deepEqual(parseInlineBold("앞 **중간** 뒤"), [{ text: "앞 " }, { text: "중간", bold: true }, { text: " 뒤" }]);
  assert.deepEqual(parseInlineBold("**수면**과 **대사**"), [{ text: "수면", bold: true }, { text: "과 " }, { text: "대사", bold: true }]);
  assert.deepEqual(parseInlineBold("**전체가 굵은 문장**"), [{ text: "전체가 굵은 문장", bold: true }]);
});

test("heading과 key_message를 구분하고 연속 핵심 문장을 병합한다", () => {
  const result = parse("## 소제목\n\n### 첫 문장\n### 둘째 문장");
  assert.equal(result.success, true);
  if (!result.success) return;
  assert.deepEqual(result.blocks.map((block) => block.type), ["heading", "key_message"]);
  assert.equal(result.blocks[1].type === "key_message" && result.blocks[1].segments[0].text, "첫 문장\n둘째 문장");
});

test("연속 인용 행을 하나의 callout으로 병합한다", () => {
  const result = parse("> 첫 줄\n> 둘째 줄");
  assert.equal(result.success, true);
  if (!result.success) return;
  assert.equal(result.blocks.length, 1);
  assert.equal(result.blocks[0].type === "callout" && result.blocks[0].segments[0].text, "첫 줄\n둘째 줄");
});

test("이미지 placeholder와 원고 순서를 보존한다", () => {
  const result = parse("본문 A\n\n[이미지: 육퇴 후 거실]\n\n본문 B\n\n## 소제목\n\n[이미지:]");
  assert.equal(result.success, true);
  if (!result.success) return;
  assert.deepEqual(result.blocks.map((block) => block.type), ["paragraph", "image", "paragraph", "heading", "image"]);
  const images = result.blocks.filter((block) => block.type === "image");
  assert.equal(images[0].description, "육퇴 후 거실");
  assert.equal(images[1].description, "");
  assert.equal(images.every((block) => !block.path && Boolean(block.uploadKey)), true);
});

test("이미지 다섯 개는 허용하고 여섯 개는 부분 변환 없이 거부한다", () => {
  const five = parse(Array.from({ length: 5 }, (_, index) => `[이미지: ${index + 1}]`).join("\n"));
  assert.equal(five.success, true);
  const six = parse(Array.from({ length: 6 }, (_, index) => `[이미지: ${index + 1}]`).join("\n"));
  assert.deepEqual(six.success, false);
  if (!six.success) assert.match(six.error, /최대 5장/);
});

test("닫히지 않은 bold, 지원하지 않는 표시자, HTML을 일반 텍스트로 보존한다", () => {
  const source = "닫히지 않은 **표시자\n\n#### 지원하지 않는 제목\n\n<script>alert(1)</script>";
  const result = parse(source);
  assert.equal(result.success, true);
  if (!result.success) return;
  assert.deepEqual(result.blocks.map((block) => block.type), ["paragraph", "paragraph", "paragraph"]);
  assert.equal(result.blocks[0].type === "paragraph" && result.blocks[0].segments[0].text, "닫히지 않은 **표시자");
  assert.equal(result.blocks[2].type === "paragraph" && result.blocks[2].segments[0].text, "<script>alert(1)</script>");
});

test("긴 원고의 혼합 블록과 bold를 안정적으로 변환한다", () => {
  const result = parse("첫 문단\n\n둘째 문단\n\n[이미지: 거실]\n\n## 소제목\n\n몸의 **대사** 이야기\n\n### 핵심 하나\n### 핵심 둘\n\n> 인용 하나\n> 인용 둘\n\n[이미지: 침실]");
  assert.equal(result.success, true);
  if (!result.success) return;
  assert.deepEqual(result.blocks.map((block) => block.type), ["paragraph", "paragraph", "image", "heading", "paragraph", "key_message", "callout", "image"]);
  const paragraph = result.blocks[4];
  assert.equal(paragraph.type === "paragraph" && paragraph.segments.some((segment) => segment.bold && segment.text === "대사"), true);
});

test("80개를 넘는 운영용 장문도 150개 한도 안에서 client와 server가 동일하게 허용한다", () => {
  const paragraphs = Array.from({ length: 90 }, (_, index) => `문단 ${index + 1} 첫 줄\n문단 ${index + 1} 둘째 줄`);
  const source = [
    ...paragraphs.slice(0, 20),
    "## 수면과 회복",
    ...paragraphs.slice(20, 45),
    "### 문제는 한 번의 밤이 아니라\n### 비슷한 밤이 쌓이는 것입니다.",
    "[이미지: 육퇴 후 거실]",
    ...paragraphs.slice(45, 70),
    "> 주말의 긴 잠이\n> 평일의 수면 부족을 모두 없애지는 않습니다.",
    "[이미지: 인슐린 감수성]",
    ...paragraphs.slice(70),
    "[이미지: 밤 11시 침실]",
  ].join("\n\n");
  const result = parseArticleDraft(source, createId, 5, ARTICLE_CONTENT_BLOCK_MAX_COUNT);
  assert.equal(result.success, true);
  if (!result.success) return;
  assert.deepEqual(result.blocks.reduce<Record<string, number>>((counts, block) => ({ ...counts, [block.type]: (counts[block.type] ?? 0) + 1 }), {}), {
    paragraph: 90,
    heading: 1,
    key_message: 1,
    image: 3,
    callout: 1,
  });
  assert.equal(result.blocks.length, 96);
  assert.equal(parseArticleBlocks(JSON.stringify(result.blocks)).success, true);
});

test("client parser와 server validation 모두 150개 초과를 차단한다", () => {
  const source = Array.from({ length: ARTICLE_CONTENT_BLOCK_MAX_COUNT + 1 }, (_, index) => `문단 ${index + 1}`).join("\n\n");
  const clientResult = parseArticleDraft(source, createId, 5, ARTICLE_CONTENT_BLOCK_MAX_COUNT);
  assert.equal(clientResult.success, false);
  if (!clientResult.success) assert.match(clientResult.error, /최대 150개/);
  const blocks = Array.from({ length: ARTICLE_CONTENT_BLOCK_MAX_COUNT + 1 }, (_, index) => ({ id: `block-${index}`, type: "paragraph", segments: [{ text: `문단 ${index}` }] }));
  const serverResult = parseArticleBlocks(JSON.stringify(blocks));
  assert.equal(serverResult.success, false);
  if (!serverResult.success) assert.match(serverResult.error, /최대 150개/);
});

test("placeholder image는 DRAFT 데이터로 유지되지만 PUBLISHED 연결 검증에는 걸린다", () => {
  const parsed = parseArticleBlocks(JSON.stringify([{ id: "placeholder-1", type: "image", alt: "", description: "거실" }]));
  assert.equal(parsed.success, true);
  if (!parsed.success) return;
  assert.equal(hasUnlinkedArticleImage(parsed.blocks), true);
  assert.equal(hasUnlinkedArticleImage(parsed.blocks, () => true), false);
  const linked = [{ id: "linked-1", type: "image" as const, path: "admin/id.webp", alt: "" }];
  assert.equal(hasUnlinkedArticleImage(linked), false);
});

test("기존 blocks 교체는 명시적인 확인 UI를 거친다", () => {
  const editor = readFileSync(new URL("../components/article-editor.tsx", import.meta.url), "utf8");
  assert.match(editor, /if \(blocks\.length\) \{ setPendingImport\(result\.blocks\); return; \}/);
  assert.match(editor, /현재 작성 중인 본문을 새 원고로 교체할까요\?/);
  assert.match(editor, /교체하고 변환/);
});

test("빈 원고는 기존 editor state를 대체할 결과를 만들지 않는다", () => {
  const result = parse("   \n\n");
  assert.equal(result.success, false);
});
