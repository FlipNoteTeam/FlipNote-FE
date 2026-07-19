export type MemoizeSessionSettings = {
  isUnlimitedRepeat: boolean;
  repeatCount?: number;
  navigationType: "auto" | "manual";
  autoTimerSeconds?: number;
  orderType: "random" | "sequential";
};

export type MemoizeControlSettings = Pick<
  MemoizeSessionSettings,
  "orderType" | "isUnlimitedRepeat" | "repeatCount" | "autoTimerSeconds"
>;
