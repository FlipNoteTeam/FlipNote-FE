const UINT32_RANGE = 2 ** 32;

// NOSONAR: 카드 셔플용 시드, 보안 목적 아님
export const createShuffleSeed = () =>
  Math.floor(Math.random() * UINT32_RANGE); // NOSONAR

export const advanceShuffleSeed = (seed: number) => (seed + 1) >>> 0;

const createSeededRandom = (seed: number) => {
  let value = seed;

  return () => {
    value = (Math.imul(value, 1_664_525) + 1_013_904_223) >>> 0;
    return value / UINT32_RANGE;
  };
};

export const shuffle = <T>(items: readonly T[], seed: number): T[] => {
  const shuffledItems = [...items];
  const random = createSeededRandom(seed);

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const targetIndex = Math.floor(random() * (index + 1));
    [shuffledItems[index], shuffledItems[targetIndex]] = [
      shuffledItems[targetIndex],
      shuffledItems[index],
    ];
  }

  return shuffledItems;
};
