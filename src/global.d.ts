// global.d.ts
export {};

declare global {
  interface Window {
    fcmTest: {
      checkToken: () => void;
      getToken: () => Promise<void>;
      checkSW: () => Promise<void>;
      diagnose: () => Promise<void>;
      guide: () => void;
    };
  }
}
