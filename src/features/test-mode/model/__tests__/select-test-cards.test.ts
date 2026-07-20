import { describe, expect, it } from "vitest";
import { selectTestCards } from "@/features/test-mode/model/select-test-cards";
import type { TestCardSelection } from "@/features/test-mode/model/select-test-cards";
import type { CardResponse } from "@/shared/apis/card";

const cards: CardResponse[] = Array.from({ length: 6 }, (_, index) => ({
  id: String(index + 1),
  question: `Q${index + 1}`,
  answer: `A${index + 1}`,
}));

const ids = (selected: CardResponse[]) => selected.map((card) => card.id);

const selection = (
  overrides: Partial<TestCardSelection> = {},
): TestCardSelection => ({
  orderType: "sequential",
  testMode: "all",
  ...overrides,
});

const SEED = 12345;

describe("selectTestCards", () => {
  describe("전체 시험 + 순차 (기존 동작 보존)", () => {
    it("카드를 그대로 반환한다", () => {
      const result = selectTestCards(cards, selection(), SEED);

      expect(ids(result)).toEqual(["1", "2", "3", "4", "5", "6"]);
    });

    it("원본 배열을 변형하지 않는다", () => {
      const original = [...cards];
      selectTestCards(cards, selection(), SEED);

      expect(cards).toEqual(original);
    });
  });

  describe("시험 순서 — 랜덤", () => {
    it("같은 카드를 모두 포함하되 순서를 섞는다", () => {
      const result = selectTestCards(
        cards,
        selection({ orderType: "random" }),
        SEED,
      );

      expect(result).toHaveLength(cards.length);
      expect([...ids(result)].sort()).toEqual([...ids(cards)].sort());
      expect(ids(result)).not.toEqual(ids(cards));
    });

    it("같은 시드면 같은 결과를 낸다 (새로고침 복원 안정성)", () => {
      const first = selectTestCards(
        cards,
        selection({ orderType: "random" }),
        SEED,
      );
      const second = selectTestCards(
        cards,
        selection({ orderType: "random" }),
        SEED,
      );

      expect(ids(first)).toEqual(ids(second));
    });

    it("시드가 다르면 다른 순서를 낸다", () => {
      const first = selectTestCards(
        cards,
        selection({ orderType: "random" }),
        SEED,
      );
      const second = selectTestCards(
        cards,
        selection({ orderType: "random" }),
        SEED + 1,
      );

      expect(ids(first)).not.toEqual(ids(second));
    });
  });

  describe("시험 모드 — 랜덤 뽑기", () => {
    it("요청한 개수만큼만 뽑는다", () => {
      const result = selectTestCards(
        cards,
        selection({ testMode: "random", randomPickCount: 3 }),
        SEED,
      );

      expect(result).toHaveLength(3);
    });

    it("중복 없이 뽑는다", () => {
      const result = selectTestCards(
        cards,
        selection({ testMode: "random", randomPickCount: 4 }),
        SEED,
      );

      expect(new Set(ids(result)).size).toBe(4);
    });

    it("전체를 뽑는 게 아니라 실제로 부분집합을 고른다", () => {
      const result = selectTestCards(
        cards,
        selection({ testMode: "random", randomPickCount: 3 }),
        SEED,
      );

      // 앞에서 3개 자르기(= 뽑기가 아님)가 아니어야 한다
      expect(ids(result)).not.toEqual(["1", "2", "3"]);
    });

    it("순차 순서면 뽑힌 카드를 원본 순서로 되돌린다", () => {
      const result = selectTestCards(
        cards,
        selection({
          testMode: "random",
          randomPickCount: 4,
          orderType: "sequential",
        }),
        SEED,
      );

      const originalOrder = cards
        .filter((card) => ids(result).includes(card.id))
        .map((card) => card.id);
      expect(ids(result)).toEqual(originalOrder);
    });

    it("같은 시드면 같은 부분집합을 뽑는다 (새로고침 복원 안정성)", () => {
      const first = selectTestCards(
        cards,
        selection({ testMode: "random", randomPickCount: 3 }),
        SEED,
      );
      const second = selectTestCards(
        cards,
        selection({ testMode: "random", randomPickCount: 3 }),
        SEED,
      );

      expect(ids(first)).toEqual(ids(second));
    });
  });

  describe("randomPickCount 방어 (stale totalCardCount 대비)", () => {
    it("카드 개수보다 크면 전체로 클램프한다", () => {
      const result = selectTestCards(
        cards,
        selection({ testMode: "random", randomPickCount: 99 }),
        SEED,
      );

      expect(result).toHaveLength(cards.length);
    });

    it("0 이하면 최소 1개는 뽑는다", () => {
      const result = selectTestCards(
        cards,
        selection({ testMode: "random", randomPickCount: 0 }),
        SEED,
      );

      expect(result).toHaveLength(1);
    });

    it("값이 없으면 전체를 시험한다", () => {
      const result = selectTestCards(
        cards,
        selection({ testMode: "random", randomPickCount: undefined }),
        SEED,
      );

      expect(result).toHaveLength(cards.length);
    });

    it("소수점은 버림 처리한다", () => {
      const result = selectTestCards(
        cards,
        selection({ testMode: "random", randomPickCount: 3.7 }),
        SEED,
      );

      expect(result).toHaveLength(3);
    });
  });

  describe("빈 카드 목록", () => {
    it("빈 배열을 그대로 반환한다", () => {
      const result = selectTestCards(
        [],
        selection({ testMode: "random", randomPickCount: 3 }),
        SEED,
      );

      expect(result).toEqual([]);
    });
  });
});
