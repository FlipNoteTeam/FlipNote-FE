// E2E 픽스처. 캐러셀/회차 테스트가 카드 텍스트("Q1"·"Q2"…)에 직접 assert하므로
// 질문/답변을 합성 라벨로 둔다. (실제 문구가 아니라 순서 식별용)
export const mockCards = [
  { id: "1", question: "Q1", answer: "A1" },
  { id: "2", question: "Q2", answer: "A2" },
  { id: "3", question: "Q3", answer: "A3" },
  { id: "4", question: "Q4", answer: "A4" },
  { id: "5", question: "Q5", answer: "A5" },
  { id: "6", question: "Q6", answer: "A6" },
] as const;
