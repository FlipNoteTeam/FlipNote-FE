import type { CardSetWithBookmark, CardSetWithLike } from "@/domain/study/types";

// 즐겨찾기한 카드셋 Mock 데이터
export const mockBookmarkedCardSets: CardSetWithBookmark[] = [
  {
    cardSetId: 1,
    name: "JavaScript 핵심 개념 50선",
    category: "IT",
    hashtag: "#JavaScript #기초 #필수개념",
    imageUrl: "https://picsum.photos/seed/js1/400/300",
    bookmarkedAt: "2025-11-20T10:00:00Z",
  },
  {
    cardSetId: 2,
    name: "React Hooks 완벽 정리",
    category: "IT",
    hashtag: "#React #Hooks #Frontend",
    imageUrl: "https://picsum.photos/seed/react1/400/300",
    bookmarkedAt: "2025-11-19T15:30:00Z",
  },
  {
    cardSetId: 3,
    name: "알고리즘 기출문제 모음",
    category: "IT",
    hashtag: "#알고리즘 #코딩테스트 #문제풀이",
    imageUrl: "https://picsum.photos/seed/algo1/400/300",
    bookmarkedAt: "2025-11-18T09:15:00Z",
  },
  {
    cardSetId: 4,
    name: "TypeScript 타입 시스템",
    category: "IT",
    hashtag: "#TypeScript #타입 #고급",
    bookmarkedAt: "2025-11-17T14:20:00Z",
  },
  {
    cardSetId: 5,
    name: "Node.js 백엔드 개발",
    category: "IT",
    hashtag: "#Node #Backend #Express",
    imageUrl: "https://picsum.photos/seed/node1/400/300",
    bookmarkedAt: "2025-11-16T11:45:00Z",
  },
  {
    cardSetId: 6,
    name: "데이터베이스 설계 패턴",
    category: "IT",
    hashtag: "#Database #SQL #설계",
    imageUrl: "https://picsum.photos/seed/db1/400/300",
    bookmarkedAt: "2025-11-15T16:30:00Z",
  },
];

// 좋아요한 카드셋 Mock 데이터
export const mockLikedCardSets: CardSetWithLike[] = [
  {
    cardSetId: 7,
    name: "영어 필수 단어 1000",
    category: "ENGLISH",
    hashtag: "#영어 #단어 #필수",
    imageUrl: "https://picsum.photos/seed/eng1/400/300",
    likedAt: "2025-11-20T08:00:00Z",
  },
  {
    cardSetId: 8,
    name: "토익 문법 총정리",
    category: "ENGLISH",
    hashtag: "#토익 #문법 #시험대비",
    imageUrl: "https://picsum.photos/seed/toeic1/400/300",
    likedAt: "2025-11-19T12:30:00Z",
  },
  {
    cardSetId: 9,
    name: "수학 공식 암기장",
    category: "MATH",
    hashtag: "#수학 #공식 #정리",
    imageUrl: "https://picsum.photos/seed/math1/400/300",
    likedAt: "2025-11-18T14:15:00Z",
  },
  {
    cardSetId: 10,
    name: "한국사 주요 사건",
    category: "HISTORY",
    hashtag: "#한국사 #역사 #사건",
    imageUrl: "https://picsum.photos/seed/history1/400/300",
    likedAt: "2025-11-17T10:20:00Z",
  },
  {
    cardSetId: 11,
    name: "과학 실험 정리",
    category: "SCIENCE",
    hashtag: "#과학 #실험 #개념",
    likedAt: "2025-11-16T13:45:00Z",
  },
  {
    cardSetId: 12,
    name: "세계 지리 암기",
    category: "GEOGRAPHY",
    hashtag: "#지리 #세계 #암기",
    imageUrl: "https://picsum.photos/seed/geo1/400/300",
    likedAt: "2025-11-15T15:30:00Z",
  },
];
