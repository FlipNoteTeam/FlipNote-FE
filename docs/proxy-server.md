# Proxy 서버 설정 가이드

## Proxy 서버란?

Proxy 서버는 클라이언트와 서버 사이에서 중개 역할을 하는 서버입니다. 개발 환경에서는 Vite 개발 서버가 proxy 역할을 합니다.

## 설정 이유

### 1. CORS (Cross-Origin Resource Sharing) 문제 해결

**문제 상황:**
```
프론트엔드: http://localhost:3000
백엔드 API: https://api.flipnote.site
```

브라우저는 보안상 다른 도메인(Origin)으로의 요청을 제한합니다.

**Proxy 없이:**
```
Browser → https://api.flipnote.site (CORS 에러!)
```

**Proxy 사용:**
```
Browser → http://localhost:3000/api → https://api.flipnote.site (OK!)
```

### 2. Secure Cookie 문제 해결

**문제 상황:**
- 서버에서 `Set-Cookie: accessToken=...; Secure; HttpOnly` 설정
- `Secure` 플래그: HTTPS 연결에서만 쿠키 전송
- 개발 환경: `http://localhost:3000` (HTTP) → 쿠키 전송 안됨

**Proxy로 해결:**
```
# 브라우저 관점에서는 같은 도메인으로 인식
http://localhost:3000/api/users → http://localhost:3000 (쿠키 포함)

# 실제로는 Vite가 API 서버로 전달
http://localhost:3000/api/users → https://api.flipnote.site/users
```

## Vite Proxy 설정

### vite.config.ts
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://api.flipnote.site',  // 실제 API 서버
        changeOrigin: true,                   // Host 헤더 변경
        secure: true,                         // HTTPS 검증
        rewrite: (path) => path.replace(/^\/api/, ''), // /api 제거
      },
    },
  },
});
```

### 설정 옵션 설명

| 옵션 | 역할 | 설명 |
|------|------|------|
| `target` | 대상 서버 | 실제 API 요청을 보낼 서버 주소 |
| `changeOrigin` | Origin 변경 | Host 헤더를 target 서버에 맞게 변경 |
| `secure` | HTTPS 검증 | SSL 인증서 검증 (true: 검증함) |
| `rewrite` | 경로 변경 | 요청 경로를 변환하는 함수 |

### 경로 변환 예시

```
요청: http://localhost:3000/api/users
rewrite 적용: /api/users → /users
최종 요청: https://api.flipnote.site/users
```

## API 클라이언트 설정

### fetch.ts
```typescript
const apiClient = axios.create({
  baseURL: '/api',  // 개발/운영 환경 통일
  withCredentials: true,  // 쿠키 포함
});
```

### 환경별 동작

**개발 환경:**
```
apiClient.get('/users') 
→ GET http://localhost:3000/api/users
→ Vite Proxy가 https://api.flipnote.site/users로 전달
```

**운영 환경:**
```
apiClient.get('/users')
→ GET https://yourdomain.com/api/users
→ 서버의 리버스 프록시나 라우팅으로 API 서버 연결
```

## Cookie 인증 플로우

### 1. 로그인
```
POST /api/auth/login
→ 서버: Set-Cookie: accessToken=...; Secure; HttpOnly
→ 브라우저: 쿠키 저장
```

### 2. API 요청
```
GET /api/users
→ 브라우저: 자동으로 쿠키 포함
→ 서버: 쿠키에서 토큰 검증
```

### 3. 토큰 갱신
```
POST /api/auth/refresh
→ refreshToken 쿠키 자동 포함
→ 서버: 새로운 accessToken 쿠키 설정
```

## 운영 환경 고려사항

### 1. 서버 설정 필요

운영 환경에서는 웹 서버(Nginx, Apache 등)에서 프록시 설정 필요:

```nginx
# Nginx 예시
location /api/ {
  proxy_pass https://api.flipnote.site/;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
}
```

### 2. 환경 변수 관리

```typescript
// 환경별 API 서버 분리가 필요한 경우
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
});
```

## 장점과 단점

### 장점
- **CORS 문제 해결**: 브라우저 정책 우회
- **Secure Cookie 지원**: 개발 환경에서도 안전한 쿠키 사용
- **환경 통일**: 개발/운영 환경에서 동일한 코드 사용
- **간편한 설정**: Vite에서 쉽게 설정 가능

### 단점
- **개발 서버 의존**: Vite 개발 서버가 실행되어야 함
- **실제 환경과 차이**: 운영 환경과 네트워크 구조가 다름
- **디버깅 복잡성**: 네트워크 요청 추적이 어려울 수 있음

## 대안책

### 1. CORS 설정
```javascript
// 서버에서 CORS 허용 (개발용)
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### 2. 개발용 HTTP 도메인
```
# 개발용 로컬 도메인 설정
127.0.0.1 dev.flipnote.site
```

하지만 **Proxy 방식이 가장 실용적**이고 안전한 방법입니다.