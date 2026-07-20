import type { CardResponse } from "@/shared/apis/card";
import { shuffle } from "@/shared/lib/shuffle";

/** 출제할 카드를 결정하는 데 필요한 설정만 추린 타입. */
export type TestCardSelection = {
  /** 출제 순서 — 원본 순서(sequential) / 섞기(random) */
  orderType: "sequential" | "random";
  /** 출제 범위 — 전체(all) / 일부만 무작위 추출(random) */
  testMode: "all" | "random";
  /** testMode가 random일 때 뽑을 개수 */
  randomPickCount?: number;
};

/**
 * 뽑을 개수를 실제 카드 수 기준으로 보정한다.
 *
 * 폼의 totalCardCount는 localStorage에 저장된 과거 값일 수 있어(카드 추가·삭제 이후)
 * randomPickCount가 현재 카드 수를 넘길 수 있다.
 */
const clampPickCount = (pickCount: number, totalCount: number) => {
  if (!Number.isFinite(pickCount)) return totalCount;
  return Math.min(Math.max(Math.trunc(pickCount), 1), totalCount);
};

/**
 * 시험 설정에 따라 출제할 카드를 고른다.
 *
 * "어느 카드를 낼지"(testMode)와 "어떤 순서로 낼지"(orderType)는 별개 축이다.
 * 랜덤 뽑기 + 순차 순서면 무작위로 부분집합을 고른 뒤 원본 순서로 되돌린다.
 *
 * 시드를 인자로 받는 순수 함수다. 시험 세션 도중 새로고침해도 같은 시드로
 * 호출하면 같은 결과가 나와야 답변 복원(questionKey 기준)이 깨지지 않는다.
 */
export const selectTestCards = (
  cards: readonly CardResponse[],
  selection: TestCardSelection,
  seed: number,
): CardResponse[] => {
  if (cards.length === 0) return [];

  const { orderType, testMode, randomPickCount } = selection;

  const needsPick = testMode === "random" && randomPickCount !== undefined;
  const pickCount = needsPick
    ? clampPickCount(randomPickCount, cards.length)
    : cards.length;

  // 부분 추출도 순서 섞기도 필요 없으면 원본을 그대로 쓴다.
  if (pickCount === cards.length && orderType === "sequential") {
    return [...cards];
  }

  const shuffled = shuffle(cards, seed);

  if (pickCount === cards.length) return shuffled;

  const picked = shuffled.slice(0, pickCount);

  if (orderType === "random") return picked;

  // 순차 순서 요청 — 뽑힌 카드를 원본 순서로 되돌린다.
  const pickedIds = new Set(picked.map((card) => card.id));
  return cards.filter((card) => pickedIds.has(card.id));
};
