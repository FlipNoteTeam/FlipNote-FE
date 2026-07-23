import type { CardResponse } from "@/shared/apis/card";
import { shuffle } from "@/shared/lib/shuffle";

/** 출제할 카드를 결정하는 데 필요한 설정만 추린 타입. */
export type TestCardSelection = {
  /** 출제 순서 — 원본 순서(sequential) / 섞기(random). 랜덤 뽑기에서는 무시된다. */
  orderType: "sequential" | "random";
  /** 출제 범위 — 전체(all) / 무작위 추출(random) */
  testMode: "all" | "random";
  /**
   * 랜덤 뽑기로 낼 문제 수의 **상한**.
   * 카드가 이보다 적으면 있는 만큼만 낸다. 값이 없으면 전체를 낸다.
   */
  randomPickCount?: number;
};

/** 출제 수를 실제 카드 수 안으로 보정한다. 입력값은 상한이므로 초과해도 오류가 아니다. */
const resolvePickCount = (pickCount: number | undefined, totalCount: number) => {
  if (pickCount === undefined || !Number.isFinite(pickCount)) return totalCount;
  return Math.min(Math.max(Math.trunc(pickCount), 1), totalCount);
};

/**
 * 시험 설정에 따라 출제할 카드를 고른다.
 *
 * - 랜덤 뽑기: 무작위로 섞은 뒤 상한 개수만큼 자른다. 뽑기 자체가 무작위이므로
 *   출제 순서도 항상 섞인다(orderType은 보지 않는다).
 * - 전체 시험: orderType에 따라 원본 순서 그대로거나 섞어서 낸다.
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

  if (testMode === "random") {
    const pickCount = resolvePickCount(randomPickCount, cards.length);
    return shuffle(cards, seed).slice(0, pickCount);
  }

  return orderType === "random" ? shuffle(cards, seed) : [...cards];
};
