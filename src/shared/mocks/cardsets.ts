import type { CardSetWithBookmark, CardSetWithLike } from "@/domain/study/types";

// 즐겨찾기한 카드셋 Mock 데이터
export const mockBookmarkedCardSets: CardSetWithBookmark[] = [
  { cardSetId: 1, name: "JavaScript 핵심 개념 50선", bookmarkedAt: "2025-11-20T10:00:00Z" },
  { cardSetId: 2, name: "React Hooks 완벽 정리", bookmarkedAt: "2025-11-19T15:30:00Z" },
  { cardSetId: 3, name: "알고리즘 기출문제 모음", bookmarkedAt: "2025-11-18T09:15:00Z" },
  { cardSetId: 4, name: "TypeScript 타입 시스템", bookmarkedAt: "2025-11-17T14:20:00Z" },
  { cardSetId: 5, name: "Node.js 백엔드 개발", bookmarkedAt: "2025-11-16T11:45:00Z" },
  { cardSetId: 6, name: "데이터베이스 설계 패턴", bookmarkedAt: "2025-11-15T16:30:00Z" },
];

// 좋아요한 카드셋 Mock 데이터
export const mockLikedCardSets: CardSetWithLike[] = [
  { cardSetId: 7, name: "영어 필수 단어 1000", likedAt: "2025-11-20T08:00:00Z" },
  { cardSetId: 8, name: "토익 문법 총정리", likedAt: "2025-11-19T12:30:00Z" },
  { cardSetId: 9, name: "수학 공식 암기장", likedAt: "2025-11-18T14:15:00Z" },
  { cardSetId: 10, name: "한국사 주요 사건", likedAt: "2025-11-17T10:20:00Z" },
  { cardSetId: 11, name: "과학 실험 정리", likedAt: "2025-11-16T13:45:00Z" },
  { cardSetId: 12, name: "세계 지리 암기", likedAt: "2025-11-15T15:30:00Z" },
];
