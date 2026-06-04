type UnboundStorage = {
  get: <T>(key: string) => T | null;
  set: <T>(key: string, value: T) => void;
  remove: (key: string) => void;
  clear: () => void;
};

type BoundStorage<T> = {
  get: () => T | null;
  set: (value: T) => void;
  remove: () => void;
  clear: () => void;
};

export function createStorage(type: "local" | "session"): UnboundStorage;
export function createStorage<T>(type: "local" | "session", key: string): BoundStorage<T>;
export function createStorage<T>(
  type: "local" | "session",
  key?: string,
): UnboundStorage | BoundStorage<T> {
  const store = type === "local" ? localStorage : sessionStorage;

  const safeGet = <V>(k: string): V | null => {
    try {
      const raw = store.getItem(k);
      if (raw === null) return null;
      return JSON.parse(raw) as V;
    } catch {
      return null;
    }
  };

  if (key !== undefined) {
    return {
      get: (): T | null => safeGet<T>(key),
      set: (value: T): void => store.setItem(key, JSON.stringify(value)),
      remove: (): void => store.removeItem(key),
      clear: (): void => store.clear(),
    };
  }

  return {
    get: <V>(k: string): V | null => safeGet<V>(k),
    set: <V>(k: string, value: V): void => store.setItem(k, JSON.stringify(value)),
    remove: (k: string): void => store.removeItem(k),
    clear: (): void => store.clear(),
  };
}
