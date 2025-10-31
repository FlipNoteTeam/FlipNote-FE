import type * as Y from "yjs";

/**
 * 카드의 로컬 표현 (UI에서 사용)
 */
export interface CardData {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

/**
 * Y.Map으로 표현되는 카드의 구조
 */
export interface YCardMap {
  id: string;
  title: Y.Text;
  content: Y.Text;
  createdAt: number;
}

/**
 * 카드 배열의 변경 사항
 */
export interface CardArrayChange {
  type: "add" | "delete" | "update";
  index: number;
  card?: CardData;
}
