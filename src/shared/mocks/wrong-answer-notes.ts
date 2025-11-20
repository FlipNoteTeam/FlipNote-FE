// 오답노트 타입 정의
export interface WrongAnswerNote {
  id: number;
  title: string;
  description: string;
  cardCount: number;
  wrongCount: number;
  lastStudiedAt: string;
  groupName?: string;
}

// 오답노트 Mock 데이터
export const mockWrongAnswerNotes: WrongAnswerNote[] = [
  {
    id: 1,
    title: "JavaScript 기초 오답노트",
    description: "JavaScript 기본 문법과 개념 중 틀린 문제들",
    cardCount: 50,
    wrongCount: 12,
    lastStudiedAt: "2025-11-18",
    groupName: "웹 개발 스터디",
  },
  {
    id: 2,
    title: "React Hooks 오답노트",
    description: "React Hooks 사용법과 라이프사이클 관련 오답",
    cardCount: 30,
    wrongCount: 8,
    lastStudiedAt: "2025-11-19",
    groupName: "프론트엔드 마스터",
  },
  {
    id: 3,
    title: "알고리즘 오답노트",
    description: "코딩테스트 준비 중 틀린 알고리즘 문제들",
    cardCount: 45,
    wrongCount: 15,
    lastStudiedAt: "2025-11-17",
    groupName: "코테 준비반",
  },
  {
    id: 4,
    title: "TypeScript 오답노트",
    description: "TypeScript 타입 시스템 관련 오답 모음",
    cardCount: 25,
    wrongCount: 6,
    lastStudiedAt: "2025-11-20",
  },
];
