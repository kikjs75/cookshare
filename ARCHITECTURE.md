# CookShare 아키텍처 다이어그램

## 1. 시스템 전체 구조

```mermaid
graph TB
    subgraph Client["클라이언트"]
        Browser["🌐 웹 브라우저"]
    end

    subgraph Frontend["프론트엔드 (Next.js 14)"]
        AppRouter["App Router"]
        Pages["Pages"]
        Components["Components"]
        AuthContext["AuthContext"]
        APIClient["API Client<br/>(lib/api.ts)"]
    end

    subgraph Backend["백엔드 (Express + TypeScript)"]
        ExpressApp["Express App<br/>(app.ts)"]
        Middleware["Middleware"]
        Routes["Routes"]
        Controllers["Controllers"]
        Services["Services"]
    end

    subgraph Database["데이터 저장소"]
        SQLite["SQLite<br/>(better-sqlite3)"]
        Storage["File Storage<br/>(Local / S3)"]
    end

    Browser -->|HTTP| AppRouter
    AppRouter --> Pages
    Pages --> Components
    Pages --> AuthContext
    Components --> APIClient
    APIClient -->|REST API<br/>JWT Bearer Token| ExpressApp
    ExpressApp --> Middleware
    Middleware --> Routes
    Routes --> Controllers
    Controllers --> SQLite
    Controllers --> Services
    Services --> Storage
```

## 2. 프론트엔드 구조

```mermaid
graph LR
    subgraph AppRouter["App Router"]
        Layout["layout.tsx<br/>글로벌 레이아웃"]
        Home["page.tsx<br/>레시피 목록 (홈)"]
        Login["(auth)/login"]
        Register["(auth)/register"]
        Detail["recipes/[id]<br/>레시피 상세"]
        NewRecipe["recipes/new<br/>레시피 작성"]
    end

    subgraph Components["컴포넌트"]
        Navbar["Navbar"]
        RecipeCard["RecipeCard"]
        subgraph UI["shadcn/ui"]
            Button["Button"]
            Card["Card"]
            Input["Input"]
            Label["Label"]
            Badge["Badge"]
            Textarea["Textarea"]
        end
    end

    subgraph Lib["라이브러리"]
        API["api.ts<br/>fetch 래퍼"]
        Auth["auth.ts<br/>토큰 관리"]
        Utils["utils.ts<br/>cn() 헬퍼"]
    end

    subgraph Context["상태 관리"]
        AuthCtx["AuthContext<br/>로그인 상태·유저 정보"]
    end

    Layout --> Navbar
    Home --> RecipeCard
    Home --> API
    Detail --> API
    NewRecipe --> API
    Login --> AuthCtx
    Register --> AuthCtx
    AuthCtx --> Auth
    API --> Auth
```

## 3. 백엔드 구조

```mermaid
graph TD
    subgraph Entry["진입점"]
        App["app.ts<br/>Express 서버 (PORT 3001)"]
    end

    subgraph MW["미들웨어"]
        CORS["cors"]
        JSON["express.json()"]
        AuthMW["auth.ts<br/>JWT 인증 검증"]
        Upload["upload.ts<br/>Multer 이미지 업로드"]
    end

    subgraph RT["라우트"]
        AuthRoute["/api/auth"]
        RecipeRoute["/api/recipes"]
    end

    subgraph CTRL["컨트롤러"]
        AuthCtrl["authController.ts<br/>register / login / me"]
        RecipeCtrl["recipeController.ts<br/>CRUD / like / upload"]
    end

    subgraph SVC["서비스"]
        StorageIF["StorageService<br/>(인터페이스)"]
        LocalStorage["LocalStorageService<br/>로컬 파일 저장"]
        S3Storage["S3StorageService<br/>AWS S3 저장 (TODO)"]
    end

    subgraph DB["데이터베이스"]
        DBModule["database.ts<br/>DB 연결 & 마이그레이션"]
        SQLite[("SQLite")]
    end

    App --> CORS
    App --> JSON
    App --> AuthRoute
    App --> RecipeRoute
    AuthRoute --> AuthMW
    AuthRoute --> AuthCtrl
    RecipeRoute --> AuthMW
    RecipeRoute --> Upload
    RecipeRoute --> RecipeCtrl
    AuthCtrl --> DBModule
    RecipeCtrl --> DBModule
    RecipeCtrl --> StorageIF
    DBModule --> SQLite
    StorageIF --> LocalStorage
    StorageIF --> S3Storage
```

## 4. 데이터베이스 ERD

```mermaid
erDiagram
    users {
        TEXT id PK
        TEXT email UK
        TEXT password_hash
        TEXT username UK
        TEXT avatar_url
        TEXT bio
        DATETIME created_at
        DATETIME updated_at
    }

    recipes {
        TEXT id PK
        TEXT title
        TEXT description
        TEXT thumbnail_url
        INTEGER cook_time
        INTEGER servings
        TEXT difficulty
        TEXT author_id FK
        INTEGER view_count
        DATETIME created_at
        DATETIME updated_at
    }

    ingredients {
        TEXT id PK
        TEXT recipe_id FK
        TEXT name
        TEXT amount
        TEXT unit
        INTEGER sort_order
    }

    steps {
        TEXT id PK
        TEXT recipe_id FK
        INTEGER step_number
        TEXT instruction
        TEXT image_url
    }

    tags {
        TEXT id PK
        TEXT name UK
    }

    recipe_tags {
        TEXT recipe_id FK
        TEXT tag_id FK
    }

    likes {
        TEXT user_id FK
        TEXT recipe_id FK
        DATETIME created_at
    }

    comments {
        TEXT id PK
        TEXT recipe_id FK
        TEXT user_id FK
        TEXT content
        DATETIME created_at
        DATETIME updated_at
    }

    users ||--o{ recipes : "작성"
    users ||--o{ likes : "좋아요"
    users ||--o{ comments : "댓글"
    recipes ||--o{ ingredients : "재료"
    recipes ||--o{ steps : "조리 단계"
    recipes ||--o{ recipe_tags : "태그 연결"
    recipes ||--o{ likes : "좋아요"
    recipes ||--o{ comments : "댓글"
    tags ||--o{ recipe_tags : "태그 연결"
```

## 5. API 요청 흐름

```mermaid
sequenceDiagram
    participant B as 브라우저
    participant F as Next.js<br/>(프론트엔드)
    participant A as Express<br/>(백엔드)
    participant DB as SQLite
    participant FS as File Storage

    Note over B,FS: 회원가입 & 로그인
    B->>F: 회원가입 폼 제출
    F->>A: POST /api/auth/register
    A->>DB: INSERT users
    A-->>F: JWT 토큰 반환
    F-->>B: 토큰 저장 (localStorage)

    Note over B,FS: 레시피 작성 (인증 필요)
    B->>F: 레시피 작성 폼 제출
    F->>A: POST /api/recipes/upload/image<br/>[Authorization: Bearer JWT]
    A->>A: Multer 파일 처리
    A->>FS: 이미지 저장
    A-->>F: 이미지 URL 반환
    F->>A: POST /api/recipes<br/>[Authorization: Bearer JWT]
    A->>A: JWT 검증
    A->>DB: INSERT recipes, ingredients, steps, tags
    A-->>F: 레시피 데이터 반환
    F-->>B: 상세 페이지로 이동

    Note over B,FS: 레시피 목록 조회 (비인증)
    B->>F: 홈 페이지 접속
    F->>A: GET /api/recipes?page=1&limit=12
    A->>DB: SELECT recipes + 좋아요 수
    A-->>F: 레시피 목록 반환
    F-->>B: 레시피 카드 목록 렌더링
```

## 6. 기술 스택 요약

```mermaid
graph LR
    subgraph FE["프론트엔드"]
        Next["Next.js 14"]
        React["React 18"]
        TW["Tailwind CSS"]
        Shadcn["shadcn/ui"]
        Radix["Radix UI"]
    end

    subgraph BE["백엔드"]
        Express["Express 4"]
        TS["TypeScript 5"]
        JWT["jsonwebtoken"]
        Bcrypt["bcryptjs"]
        Multer["Multer"]
    end

    subgraph DATA["데이터"]
        SQLiteDB["SQLite"]
        BetterSQLite["better-sqlite3"]
        Local["로컬 파일시스템"]
        S3["AWS S3 (예정)"]
    end

    Next --> React
    Next --> TW
    TW --> Shadcn
    Shadcn --> Radix
    Express --> TS
    Express --> JWT
    Express --> Bcrypt
    Express --> Multer
    SQLiteDB --> BetterSQLite
    Local -.->|전환 가능| S3
```

---

## 다이어그램 목차

| # | 다이어그램 | 유형 | 설명 |
|---|-----------|------|------|
| 1 | 시스템 전체 구조 | `graph TB` | 클라이언트 → 프론트엔드 → 백엔드 → DB 4계층 아키텍처 전체 흐름 |
| 2 | 프론트엔드 구조 | `graph LR` | App Router 페이지, shadcn/ui 컴포넌트, AuthContext 상태 관리 구성 |
| 3 | 백엔드 구조 | `graph TD` | Express 미들웨어 → 라우트 → 컨트롤러 → 서비스 → DB 레이어 흐름 |
| 4 | 데이터베이스 ERD | `erDiagram` | 8개 테이블(users, recipes, ingredients, steps, tags, recipe_tags, likes, comments) 간 관계 |
| 5 | API 요청 흐름 | `sequenceDiagram` | 회원가입, 레시피 작성, 목록 조회 3가지 시나리오의 요청-응답 시퀀스 |
| 6 | 기술 스택 요약 | `graph LR` | 프론트엔드 / 백엔드 / 데이터 레이어별 사용 기술 및 의존 관계 |
