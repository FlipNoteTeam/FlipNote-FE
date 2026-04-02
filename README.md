# 📒 FlipNote — Frontend

**FlipNote 서비스의 프론트엔드 레포지토리입니다.**

[React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)

[Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)

[TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)

[Deploy](https://img.shields.io/badge/Deploy-CloudFront%20%2B%20S3-FF9900?logo=amazonaws&logoColor=white)

---
## 📑 목차

- [시작하기](#-시작하기)
- [환경 변수](#-환경-변수)
- [실행 및 배포](#-실행-및-배포)
- [프로젝트 구조](#-프로젝트-구조)

---

## 🚀 시작하기

### 사전 요구사항

- **Node.js** 18 이상
- **npm** 9 이상
- Firebase 프로젝트 생성 및 설정 완료
- AWS S3 버킷 및 CloudFront 배포 생성 완료 (배포 시)

### 설치

```bash
# 의존성 설치 (lockfile 기준으로 정확히 설치)
npm ci
```

---

## 🔐 환경 변수

프로젝트 루트에 `.env` 파일을 생성하고 아래 변수를 설정합니다.

```
# ─── API 서버 ───────────────────────────────────────────
# REST API 서버 주소 
VITE_BASE_URL=

# WebSocket 서버 주소
VITE_SOCKET_URL=

# ─── Firebase ───────────────────────────────────────────
# Firebase 콘솔 > 프로젝트 설정 > 일반 > 웹 앱에서 확인
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# ─── 배포 (CI/CD 환경에서만 필요) ───────────────────────
# AWS IAM 액세스 키 (S3 업로드 권한 필요)
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_BUCKET_REGION=
S3_BUCKET_NAME=

# CloudFront 배포 ID (캐시 무효화에 사용)
CLOUDFRONT_DISTRIBUTION_ID=
```

> **⚠️ 주의**: `.env` 파일은 절대 git에 커밋하지 마세요. `.gitignore`에 포함되어 있는지 반드시 확인하세요.
> 

---

## 🖥️ 실행 및 배포

### 로컬 개발 서버 실행

```bash
npm run dev
```

기본적으로 `http://localhost:5173`에서 실행됩니다.

### 프로덕션 빌드

```bash
npm run build
```

`dist/` 폴더에 정적 파일이 생성됩니다.

### 빌드 결과 로컬 미리보기

```bash
npm run preview
```

### 배포 (GitHub Actions)

`main` 브랜치에 push 시 GitHub Actions가 자동으로 아래 과정을 실행합니다.

1. `npm ci` — 의존성 설치
2. `npm run build` — 프로덕션 빌드
3. `aws s3 sync` — S3 버킷에 빌드 파일 업로드
4. CloudFront 캐시 무효화 (`/*`)

> 배포에 필요한 환경 변수(`S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET_REGION`, `S3_BUCKET_NAME`, `CLOUDFRONT_DISTRIBUTION_ID`)는 GitHub Repository → Settings → Secrets and variables → Actions에 등록해야 합니다.
> 

---

## 📁 프로젝트 구조

```
src/
├── routes/      # 파일 기반 라우팅 (URL 구조 = 폴더 구조)
├── domain/      # 도메인 비즈니스 로직, 타입, React Query hooks
├── features/    # 기능 단위 UI 컴포넌트 및 로직
├── shared/      # API 클라이언트, 공통 컴포넌트, Socket/Yjs, 레이아웃 등
├── stores/      # Zustand 전역 상태 관리 (인증)
└── assets/      # 이미지, SVG 등 정적 파일
```
