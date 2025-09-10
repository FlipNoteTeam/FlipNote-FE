# Path Alias 설정 가이드

이 프로젝트에서 `/src`를 `@`로 사용하는 path alias를 설정하는 방법입니다.

## 1. Vite 설정 (vite.config.ts)

```typescript
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // ... 다른 설정들
});
```

## 2. TypeScript 설정

### tsconfig.json
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### tsconfig.app.json
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    // ... 다른 설정들
  }
}
```

## 3. 사용 예시

### Before (상대경로)
```typescript
import { Button } from '../../../components/ui/button'
import { cn } from '../../lib/utils'
```

### After (path alias)
```typescript
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
```

## 4. 주의사항

- 자동 생성되는 파일 (예: `routeTree.gen.ts`)은 수정하지 않습니다
- 모든 TypeScript 설정 파일에 path mapping을 추가해야 합니다
- IDE에서 path alias를 인식하려면 TypeScript 설정이 필요합니다
- Vite 빌드에서 path alias를 해석하려면 vite.config.ts 설정이 필요합니다

## 5. 확인 방법

다음 명령어로 빌드가 성공하는지 확인:
```bash
npm run build
```