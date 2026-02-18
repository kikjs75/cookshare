# CLAUDE.md

이 파일은 이 저장소에서 작업할 때 Claude Code(claude.ai/code)에 제공하는 지침입니다.

## 프로젝트 개요

CookShare는 TypeScript로 구축된 풀스택 레시피 공유 플랫폼입니다. 백엔드는 SQLite를 사용하는 Express.js(포트 4000)이며, 프론트엔드는 Tailwind CSS와 shadcn/ui 컴포넌트를 사용하는 Next.js 14 App Router(포트 3000)입니다.

## 명령어

### 백엔드 (`/workspace/backend`)
- `npm run dev` — tsx watch 모드로 개발 서버 시작 (포트 4000)
- `npm run build` — TypeScript를 `./dist`로 컴파일
- `npm start` — 컴파일된 결과물 실행
- `npm run db:migrate` — SQLite 데이터베이스 초기화/마이그레이션

### 프론트엔드 (`/workspace/frontend`)
- `npm run dev` — Next.js 개발 서버 시작 (포트 3000)
- `npm run build` — 프로덕션 빌드
- `npm run lint` — Next.js 규칙 기반 ESLint 검사

### 최초 설정
```
cd backend && cp .env.example .env && npm install && npm run db:migrate
cd ../frontend && cp .env.local.example .env.local && npm install
```

## 아키텍처

### 백엔드 레이어
Express 앱 → 미들웨어 (CORS, JSON, JWT 인증, Multer 업로드) → 라우트 → 컨트롤러 → 데이터베이스 (WAL 모드의 better-sqlite3).

- **Routes**: `src/routes/auth.ts`와 `src/routes/recipes.ts`가 `/api/auth/*` 및 `/api/recipes/*` 하위 API 엔드포인트를 정의
- **Controllers**: `authController.ts`(회원가입/로그인/me)와 `recipeController.ts`(CRUD, 좋아요, 이미지 업로드)가 모든 비즈니스 로직과 직접 DB 쿼리를 포함
- **Middleware**: `auth.ts`는 JWT Bearer 토큰을 검증; `upload.ts`는 Multer 이미지 업로드 처리 (5MB, JPG/PNG/WebP)
- **Storage**: 추상화된 `StorageService` 인터페이스와 `LocalStorageService` 구현체; S3는 스텁만 존재하며 미구현. `STORAGE_TYPE` 환경변수로 제어
- **데이터베이스 스키마**: `src/db/schema.sql`에 8개 테이블 정의: users, recipes, ingredients, steps, tags, recipe_tags, likes, comments

### 프론트엔드 레이어
Next.js App Router 페이지 → React 컴포넌트 → AuthContext (상태) → API 클라이언트 (`lib/api.ts`, 자동 JWT 주입).

- **Pages**: 홈(`/`), 로그인/회원가입(`/(auth)/`), 레시피 상세(`/recipes/[id]`), 레시피 작성(`/recipes/new`)
- **Components**: `ui/`(shadcn 기본 컴포넌트), `layout/Navbar.tsx`, `recipe/RecipeCard.tsx`
- **인증 흐름**: `AuthContext.tsx`가 사용자 상태 관리; `lib/auth.ts`를 통해 토큰을 localStorage에 저장
- **경로 별칭**: `@/*`는 임포트에서 `src/*`로 매핑

### 데이터 흐름
프론트엔드 폼 → `lib/api.ts`(Bearer 토큰 추가) → Express 미들웨어(JWT 검증) → 컨트롤러(유효성 검사 + DB 작업) → JSON 응답 → 프론트엔드 상태 업데이트.

## 데이터베이스
better-sqlite3를 통한 SQLite. 스키마는 `backend/src/db/schema.sql`에 위치. 주요 관계:
- recipes.author_id → users.id
- ingredients와 steps는 레시피 삭제 시 CASCADE
- likes와 recipe_tags는 복합 기본키 사용
- comments 테이블은 스키마에 존재하나 API 엔드포인트 미구현

## 알려진 문제점 (RISK_ANALYSIS.md 참고)
- `authController.ts`에 안전하지 않은 JWT 시크릿 하드코딩 기본값 존재
- 레시피 수정(`PUT /api/recipes/:id`) 시 ingredients, steps, tags가 업데이트되지 않음
- 테스트 인프라 미구축
- 인증 엔드포인트에 요청 속도 제한(rate limiting) 없음
- 이미지 업로드 시 확장자 검사 외 MIME 타입 유효성 검증 부재
