# Fetch Client 가이드

이 프로젝트에서는 `window.fetch`를 래핑한 axios와 유사한 API를 제공하는 `fetchClient`를 사용합니다.

## 기본 사용법

### Import

```typescript
import fetchClient from "@/apis/fetchClient";
```

### GET 요청

```typescript
// 기본 GET 요청
const response = await fetchClient.get("/api/users");
console.log(response.data); // 응답 데이터

// Query parameters 포함
const response = await fetchClient.get("/api/users", {
  params: { page: "1", limit: "10" },
});
```

### POST 요청

```typescript
// JSON 데이터 전송
const response = await fetchClient.post("/api/users", {
  name: "John Doe",
  email: "john@example.com",
});

// 커스텀 헤더 포함
const response = await fetchClient.post("/api/users", userData, {
  headers: { Authorization: "Bearer token" },
});
```

### PUT/PATCH 요청

```typescript
// PUT 요청
const response = await fetchClient.put("/api/users/1", {
  name: "Updated Name",
});

// PATCH 요청
const response = await fetchClient.patch("/api/users/1", {
  email: "new@example.com",
});
```

### DELETE 요청

```typescript
const response = await fetchClient.delete("/api/users/1");
```

## Response 구조

모든 응답은 다음과 같은 구조를 가집니다:

```typescript
interface FetchResponse<T> {
  data: T; // 응답 데이터
  status: number; // HTTP 상태 코드
  statusText: string; // HTTP 상태 텍스트
  headers: Headers; // 응답 헤더
}
```

## 커스텀 인스턴스 생성

```typescript
// API별 전용 클라이언트 생성
const apiClient = fetchClient.create({
  baseURL: "https://api.example.com",
  headers: {
    Authorization: "Bearer your-token",
    "X-API-Key": "your-api-key",
  },
  timeout: 5000,
});

// 사용
const response = await apiClient.get("/users"); // https://api.example.com/users
```

## 설정 옵션

### FetchClientConfig

```typescript
interface FetchClientConfig {
  baseURL?: string; // 기본 URL
  headers?: Record<string, string>; // 기본 헤더
  timeout?: number; // 타임아웃 (ms, 기본값: 10000)
  withCredentials?: boolean; // 쿠키 포함 여부 (기본값: true)
}
```

### RequestConfig

```typescript
interface RequestConfig<D = unknown> {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>; // 요청별 헤더
  body?: D; // 요청 본문 (제네릭으로 타입 추론)
  params?: Record<string, string>; // URL 파라미터
  timeout?: number; // 요청별 타임아웃
}
```

## TypeScript 지원

제네릭을 사용하여 응답 타입과 요청 데이터 타입을 지정할 수 있습니다:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

interface CreateUserRequest {
  name: string;
  email: string;
}

// 응답 타입만 지정
const response = await fetchClient.get<User[]>("/api/users");
const users: User[] = response.data; // 타입 추론됨

// 요청 데이터 타입 자동 추론
const userData = { name: "John", email: "john@example.com" };
const userResponse = await fetchClient.post<User>("/api/users", userData);
// userData 타입이 { name: string, email: string }로 자동 추론됨

// 요청과 응답 타입 모두 명시적 지정
const explicitResponse = await fetchClient.post<User, CreateUserRequest>(
  "/api/users", 
  userData
);
const createdUser: User = explicitResponse.data;
```

### 메서드별 제네릭 지원

```typescript
// GET: 응답 타입만 지정
fetchClient.get<T>(url, config?)

// POST, PUT, PATCH: 응답 타입 + 요청 데이터 타입
fetchClient.post<T, D>(url, data?, config?)
fetchClient.put<T, D>(url, data?, config?)
fetchClient.patch<T, D>(url, data?, config?)

// DELETE: 응답 타입만 지정
fetchClient.delete<T>(url, config?)
```

## 에러 처리

```typescript
try {
  const response = await fetchClient.get("/api/users");
  console.log(response.data);
} catch (error) {
  if (error instanceof Error) {
    console.error("요청 실패:", error.message);

    // 타임아웃 에러
    if (error.message === "Request timeout") {
      console.error("요청 시간 초과");
    }
  }
}
```

## 기본 설정

현재 프로젝트의 기본 fetchClient 설정:

```typescript
const fetchClient = new FetchClient({
  withCredentials: true, // 쿠키 자동 포함
});
```

## axios와의 차이점

| 기능          | axios                       | fetchClient                             |
| ------------- | --------------------------- | --------------------------------------- |
| 기본 API      | `axios.get()`               | `fetchClient.get()`                     |
| 인스턴스 생성 | `axios.create()`            | `fetchClient.create()`                  |
| 응답 구조     | `{ data, status, headers }` | `{ data, status, statusText, headers }` |
| 타임아웃      | 내장 지원                   | AbortController 사용                    |
| 쿠키          | 자동 처리                   | `withCredentials` 설정 필요             |

## 왜 fetch wrapper를 사용하는가?

### fetch API의 발전

최근 fetch API는 많은 개선이 이루어졌습니다:

- **브라우저 지원**: 모든 모던 브라우저에서 안정적으로 지원
- **AbortController**: 요청 취소 및 타임아웃 처리 가능
- **스트림 지원**: 대용량 데이터 처리에 유리
- **Promise 기반**: async/await와 자연스럽게 연동

### fetch wrapper의 장점

1. **번들 크기 최적화**
   ```
   axios: ~13KB (minified + gzipped)
   fetchClient: ~2KB (minified + gzipped)
   ```

2. **의존성 최소화**
   - 외부 라이브러리 의존성 없음
   - 브라우저 내장 API만 사용

3. **커스터마이징 용이성**
   - 프로젝트 요구사항에 맞게 직접 수정 가능
   - 불필요한 기능 제거로 더 가벼운 구현

4. **TypeScript 친화적**
   - 프로젝트에 특화된 타입 정의
   - 제네릭을 통한 강력한 타입 추론

### axios가 더 나은 경우

복잡한 프로젝트에서는 여전히 axios가 유리할 수 있습니다:

- **인터셉터**: 요청/응답 전후처리가 많이 필요한 경우
- **파일 업로드**: multipart/form-data 처리
- **자동 변환**: JSON 외 다양한 데이터 형식 처리
- **에러 처리**: 더 세밀한 HTTP 에러 핸들링
- **취소 토큰**: 복잡한 요청 취소 로직

### 결론

**fetch wrapper 추천 상황:**
- 간단한 REST API 통신
- 번들 크기가 중요한 프로젝트
- 의존성을 최소화하고 싶은 경우
- TypeScript 타입 안전성이 중요한 경우

**axios 추천 상황:**
- 복잡한 API 통신 로직
- 다양한 데이터 형식 처리 필요
- 인터셉터나 고급 기능 활용
- 팀이 axios에 익숙한 경우

현대적인 웹 개발에서 fetch wrapper는 충분히 실용적인 선택입니다.
