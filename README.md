# CookShare - 레시피 공유 서비스

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 14 (App Router) + shadcn/ui + Tailwind CSS |
| Backend | Express + TypeScript |
| Database | SQLite (개발) → PostgreSQL (프로덕션) 전환 가능 |
| 인증 | JWT (Bearer Token) |
| 이미지 저장 | 로컬 파일시스템 → AWS S3 전환 가능 |

## 프로젝트 구조

```
cookshare/
├── backend/
│   ├── src/
│   │   ├── app.ts                  # Express 앱 진입점
│   │   ├── db/
│   │   │   ├── schema.sql          # DB 스키마
│   │   │   ├── database.ts         # DB 연결 & 마이그레이션
│   │   │   └── migrate.ts          # 마이그레이션 실행 스크립트
│   │   ├── middleware/
│   │   │   ├── auth.ts             # JWT 인증 미들웨어
│   │   │   └── upload.ts           # Multer 이미지 업로드
│   │   ├── controllers/
│   │   │   ├── authController.ts   # 회원가입/로그인/내정보
│   │   │   └── recipeController.ts # 레시피 CRUD + 좋아요
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   └── recipes.ts
│   │   ├── services/storage/
│   │   │   ├── StorageService.ts   # 인터페이스 정의
│   │   │   ├── LocalStorageService.ts
│   │   │   ├── S3StorageService.ts # TODO: S3 전환 시 구현
│   │   │   └── index.ts            # STORAGE_TYPE env로 주입
│   │   └── types/index.ts
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx             # 레시피 목록 홈
    │   │   ├── (auth)/login/        # 로그인
    │   │   ├── (auth)/register/     # 회원가입
    │   │   └── recipes/
    │   │       ├── [id]/page.tsx    # 레시피 상세
    │   │       └── new/page.tsx     # 레시피 작성
    │   ├── components/
    │   │   ├── ui/                  # shadcn/ui 컴포넌트
    │   │   ├── layout/Navbar.tsx
    │   │   └── recipe/RecipeCard.tsx
    │   ├── contexts/AuthContext.tsx
    │   └── lib/
    │       ├── api.ts               # API 클라이언트
    │       ├── auth.ts              # 토큰 저장/조회
    │       └── utils.ts             # cn() 헬퍼
    └── package.json
```

## 시작하기

### 백엔드

```bash
cd backend
cp .env.example .env
npm install
npm run db:migrate
npm run dev
```

### 프론트엔드

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

## API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET  /api/auth/me` - 내 정보 (인증 필요)

### 레시피
- `GET    /api/recipes` - 목록 조회 (`?page=1&limit=12&q=검색어&tag=태그&difficulty=easy`)
- `GET    /api/recipes/:id` - 상세 조회
- `POST   /api/recipes` - 생성 (인증 필요)
- `PUT    /api/recipes/:id` - 수정 (작성자만)
- `DELETE /api/recipes/:id` - 삭제 (작성자만)
- `POST   /api/recipes/upload/image` - 이미지 업로드 (인증 필요)
- `POST   /api/recipes/:id/like` - 좋아요 토글 (인증 필요)

## S3 전환 가이드

`backend/.env`에서:
```
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-northeast-2
S3_BUCKET=cookshare-uploads
```

그 후 `S3StorageService.ts`의 TODO 구현 (`@aws-sdk/client-s3` 설치 필요).
