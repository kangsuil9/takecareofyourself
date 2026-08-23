# 돌봄 (Take Care of Yourself)

아이와 일상을 돌보느라 자신을 돌보지 못하는 사람이 잠시 멈춰 자신을 돌아볼 수 있도록 돕는 모바일 우선 자기돌봄 웹앱입니다.

현재 단계는 `PROJECT_SPEC.md`에 따른 정적 UI와 Supabase SSR 인증 기반을 포함합니다. CareLog CRUD, 이미지 업로드, 좋아요, 관리자 UI와 Web Push는 아직 연결되어 있지 않습니다.

## 기술 스택

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Supabase SSR / Supabase Auth

## 시작하기

```bash
pnpm install
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다. 루트 경로는 `/care`로 이동합니다.

`.env.example`을 `.env.local`로 복사한 뒤 Supabase 프로젝트 URL, publishable key, 서버 전용 service role key를 설정해야 합니다. Kakao REST API Key와 Client Secret은 앱 환경변수에 저장하지 않고 Supabase Dashboard의 Kakao Provider 설정에 입력합니다.

초기 데이터베이스 구조와 RLS 정책은 `supabase/migrations/202608230001_initial_schema.sql`에 정의되어 있습니다. 이 저장소는 migration 파일을 자동으로 원격 데이터베이스에 적용하지 않습니다.

## 검증

```bash
pnpm typecheck
pnpm build
```

## 구현된 경로

- `/care` — 오늘의 돌봄 지식과 정적 돌봄 피드
- `/record` — 정적 돌봄 기록 작성 화면
- `/me` — 정적 주간·월간 요약
- `/me/records` — 나의 기록 빈 상태
- `/care/articles` — 건강 이야기 목록
- `/care/articles/[articleId]` — 건강 이야기 상세
- `/login` — Kakao OAuth 로그인
- `/auth/callback` — Supabase PKCE callback
- `/onboarding/nickname` — 최초 사용자 닉네임 설정

프로덕션 환경 변수는 `.env.example`을 참고하세요. 실제 비밀 값은 저장소에 커밋하지 않습니다.
