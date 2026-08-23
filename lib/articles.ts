export type Article = {
  id: string;
  category: string;
  title: string;
  summary: string;
  readingTime: string;
  accent: string;
};

export const articles: Article[] = [
  {
    id: "restful-sleep",
    category: "수면",
    title: "잠을 줄여 만든 나만의 시간은 정말 나를 위한 시간일까요?",
    summary: "하루의 끝에서 자꾸만 잠을 미루게 되는 마음과, 편안한 밤을 만드는 작은 단서를 살펴봅니다.",
    readingTime: "5분",
    accent: "sage",
  },
  {
    id: "quiet-stress",
    category: "스트레스",
    title: "마음이 지쳤다는 것을 알아차리는 조용한 신호들",
    summary: "바쁜 일상 속에서 지나치기 쉬운 몸과 마음의 신호를 부담 없이 돌아봅니다.",
    readingTime: "4분",
    accent: "clay",
  },
  {
    id: "steady-meal",
    category: "식생활",
    title: "나를 챙기는 한 끼는 거창하지 않아도 괜찮아요",
    summary: "완벽한 식단 대신 오늘의 몸을 살피는 식사의 감각에 대해 이야기합니다.",
    readingTime: "6분",
    accent: "sand",
  },
];

export function getArticle(articleId: string) {
  return articles.find((article) => article.id === articleId) ?? articles[0];
}
