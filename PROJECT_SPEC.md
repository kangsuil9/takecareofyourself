# 돌봄 (DOLBOM) - PROJECT SPECIFICATION

## Service Identity

- 서비스명: 돌봄
- 영문 프로젝트명: Take Care of Yourself
- GitHub Repository: takecareofyourself

### 서비스명 사용 원칙

"돌봄"은 사용자에게 보여지는 공식 서비스명이다.

"takecareofyourself"는 GitHub repository 및 개발 환경에서 사용하는 프로젝트 식별자다.

웹앱의 UI, 페이지 제목, 로고, 사용자에게 노출되는 문구에서는
가능한 한 "돌봄"을 사용한다.

개발 파일명, repository명, package명 등 기술적인 영역에서는
takecareofyourself를 사용할 수 있다.

## 0. Document Information

- Project Name: 돌봄
- Project Type: Mobile-first Web App / PWA
- Product Stage: MVP
- Primary Language: Korean
- Primary Target: 30~40대 부모
- Primary Platform: Mobile Web
- Authentication: Kakao Login
- Main Navigation: 돌봄 / 기록 / 나
- Admin: Separate Admin Area
- Push Notification: Web Push
- Version: 1.0

---

# 1. Product Overview

## 1.1 One-line Definition

돌봄은 아이와 일상을 돌보느라 정작 자신을 돌보지 못하는 현대인이 잠시 멈추어 자신을 돌보는 시간과 이유를 만들도록 돕는 자기돌봄 커뮤니티다.

## 1.2 Target User

Primary target:

- 30~40대 부모
- 어린 자녀를 키우고 있는 부모
- 아이와 가족에게 많은 시간과 에너지를 사용하는 사람
- 자신의 건강과 생활습관을 관리하고 싶지만 자기 자신을 우선순위에서 자주 제외하는 사람

Secondary target:

- 업무에 몰입하여 자기관리를 놓치고 있는 현대인
- 건강한 생활습관을 만들고 싶은 사람
- 자기돌봄에 관심이 있는 사람

---

# 2. Core Product Philosophy

## 2.1 Health is Daily Behavior

건강은 특별한 관리 프로젝트가 아니라 매일의 행동이다.

## 2.2 Autonomy over Discipline

돌봄은 규율보다 자율을 우선한다.

사용자에게 다음을 강요하지 않는다.

- 목표량
- 월간 목표
- 연속 기록
- 벌금
- 패널티
- 챌린지
- 달성률
- 실패 평가

사용자가 스스로 자신을 돌볼 수 있는 환경을 제공한다.

## 2.3 Knowledge Instead of Pressure

건강 행동을 직접적으로 강요하지 않는다.

잘못된 방식:

"오늘 운동하세요."

선호하는 방식:

"운동이 왜 나에게 필요한지 알려준다."

건강 지식은 행동을 강제하기 위한 것이 아니라 행동의 이유를 제공하기 위한 것이다.

## 2.4 Wind vs Sunlight

돌봄은 강한 압박으로 사용자를 움직이는 서비스가 아니다.

바람보다 햇볕처럼 자연스럽게 사용자가 스스로 행동하고 싶게 만드는 것을 목표로 한다.

## 2.5 Product Loop

전체 서비스의 핵심 Loop:

KNOW → SEE → DO → RECORD → REFLECT → KNOW

- KNOW: 건강 지식을 배운다.
- SEE: 다른 사람들이 자신을 돌보는 모습을 본다.
- DO: 자신을 돌보는 행동을 한다.
- RECORD: 자신의 행동을 기록한다.
- REFLECT: 자신의 기록을 주간/월간으로 돌아본다.

---

# 3. MVP Scope

MVP의 핵심 기능은 다음과 같다.

1. Kakao Login
2. Nickname 설정
3. 건강 아티클 조회
4. 건강 아티클 목록
5. 건강 아티클 상세
6. 돌봄 피드
7. 돌봄 게시물 작성
8. 돌봄 게시물 수정
9. 돌봄 게시물 삭제
10. 이미지 1장 업로드
11. 좋아요(하트)
12. 개인 돌봄 기록
13. 주간 돌봄 통계
14. 월간 돌봄 통계
15. 나의 기록 조회
16. Web Push Notification
17. 관리자 인증
18. 관리자 아티클 CRUD
19. 관리자 돌봄 게시물 관리
20. 관리자 회원 관리

---

# 4. Explicitly Out of Scope for MVP

다음 기능은 MVP에서 구현하지 않는다.

- Google Login
- Naver Login
- 댓글
- 팔로우
- 친구 시스템
- DM
- 그룹
- 챌린지
- 목표 설정
- 벌금
- 패널티
- 연속 출석
- 경쟁형 랭킹
- 달성률
- 레벨
- 배지
- 포인트
- 광고
- 유료 결제
- AI 건강 상담
- 건강 진단
- 의료 상담
- 건강 데이터 연동
- Apple Health 연동
- Google Fit 연동

---

# 5. Information Architecture

## 5.1 Main Navigation

Main navigation must contain exactly three items.

1. 돌봄
2. 기록
3. 나

Health articles are a sub-feature of the "돌봄" section.

Do not add a fourth main navigation item for health articles.

---

# 6. User Routes

Suggested route structure:

```text
/login
/onboarding/nickname

/care
/care/articles
/care/articles/[articleId]

/record
/me
/me/records

/settings

/admin
/admin/articles
/admin/articles/new
/admin/articles/[articleId]/edit
/admin/users
/admin/care-logs
```

Authentication-protected routes:

```text
/care
/record
/me
/me/records
/settings
```

Admin-protected routes:

```text
/admin/*
```

---

# 7. Screen Specification

## 7.1 Login

Route:

`/login`

Purpose:

Allow the user to authenticate using Kakao.

UI:

```text
돌봄

나를 돌보는 시간

[ 카카오로 시작하기 ]
```

Requirements:

- Kakao OAuth
- Successful login:
  - Existing user → `/care`
  - New user → `/onboarding/nickname`
- Do not expose Kakao account information to other users.
- Users are represented publicly by nickname.

---

## 7.2 Nickname Setup

Route:

`/onboarding/nickname`

Purpose:

Set the user's public nickname.

Fields:

- nickname

Requirements:

- Required
- Validate length
- Trim whitespace
- Prevent duplicate nickname if the product chooses unique nicknames
- After completion → `/care`

Do not request unnecessary profile information.

---

## 7.3 Care Main

Route:

`/care`

This is the primary home screen.

The screen has two major content areas:

1. Health Knowledge
2. Community Care Feed

Recommended structure:

```text
돌봄

사람들은 자신을
이렇게 돌보고 있습니다.

[ 오늘의 돌봄 지식 ]

왜 우리는 잠을 줄일까요?
수면 · 5분 읽기

건강 이야기 더보기 →

---------------------

Community Feed
```

### Health Knowledge Section

Display one featured article.

The featured article should be:

- Published
- Recent or manually selected
- Clickable

Click → article detail.

"건강 이야기 더보기" → `/care/articles`

### Community Feed

Display user care logs in reverse chronological order.

Default sort:

`created_at DESC`

Feed should support infinite scroll or pagination.

---

## 7.4 Health Article List

Route:

`/care/articles`

Purpose:

Allow users to browse health knowledge.

Display:

- Title
- Summary
- Category
- Reading time
- Thumbnail if available
- Published date

Optional category filter:

- 전체
- 식생활
- 수면
- 운동
- 휴식
- 스트레스
- 마음
- 생활습관

Only published articles are visible to normal users.

---

## 7.5 Health Article Detail

Route:

`/care/articles/[articleId]`

Display:

- Category
- Title
- Summary
- Cover image
- Reading time
- Body
- Published date

At the end of the article, optional "small care suggestion" may be displayed.

Example:

```text
오늘 나를 위해 할 수 있는 작은 돌봄

오늘은 평소보다 조금 일찍
잠들어보는 것은 어떨까요?

선택은 당신에게 있습니다.
```

Important:

Never require the user to create a care log after reading an article.

Do not automatically navigate to `/record`.

The article should end naturally.

---

## 7.6 Care Feed Post

A care post contains:

- nickname
- created time
- optional category
- text
- optional image
- like count
- like state for current user

Example:

```text
민수
2시간 전

걷기

오늘 아이를 보내고
30분 정도 걸었습니다.

[image]

♡ 12
```

### Image

Maximum:

`1 image per post`

Image is optional.

---

## 7.7 Care Post Creation

The user creates a care record from `/record`.

Fields:

```text
category (optional)
content (required)
image (optional)
```

Available categories:

```text
읽기
걷기
운동
명상
수면
식사
만남
쉬기
기록하기
기타
```

Category selection is optional.

The user must be able to submit a post without selecting a category.

Example:

```text
오늘 그냥 아무것도 하지 않고
잠시 쉬었다.
```

This is a valid care record.

---

## 7.8 Care Post Editing

Users may edit only their own posts.

Editable:

- category
- content
- image

Cannot edit:

- author
- created_at
- likes

The edit screen should reuse the creation UI where possible.

---

## 7.9 Care Post Deletion

Users may delete only their own posts.

Before deletion:

```text
이 돌봄 기록을 삭제할까요?

[취소] [삭제]
```

After deletion:

- Remove from feed
- Prevent public access
- Preserve referential integrity

Soft delete is preferred if practical.

Suggested field:

`deleted_at`

---

## 7.10 Like

Users can like/unlike a care post.

Requirements:

- One like per user per care post
- Clicking heart toggles like
- Like count updates
- Prevent duplicate likes at database level

Like is not intended as a competitive ranking mechanism.

Do not implement follower counts or popularity rankings in MVP.

---

## 7.11 Record

Route:

`/record`

Purpose:

Create today's care record.

UI:

```text
기록

오늘 나는

[ 주제 선택 ]

읽기 / 걷기 / 운동 / 명상
수면 / 식사 / 만남 / 쉬기
기록하기 / 기타

[ 오늘 무엇을 했나요? ]

[ + 사진 추가 ]

[ 기록하기 ]
```

Category is optional.

Content is required.

Image is optional.

Maximum image count:

`1`

After successful submission:

- Save record
- Show success feedback
- Return to care feed or remain on record screen
- Preferred: return to `/care` with a short success toast

Do not show performance evaluation.

---

## 7.12 My Page

Route:

`/me`

Purpose:

Help the user reflect on how they have cared for themselves.

Display:

- nickname
- weekly summary
- monthly summary
- category counts

Example:

```text
나

홍길동

이번 주의 나

총 7번
나를 돌봤어요.

걷기 3
읽기 2
쉬기 1
만남 1

----------------

8월의 나

총 23번
나를 돌봤어요.

걷기 8
읽기 6
쉬기 4
운동 3
명상 2

[나의 기록 보기]
```

Important:

Do not display:

- 목표 대비 %
- 달성률
- 부족합니다
- 실패했습니다

The system should report behavior, not judge behavior.

---

## 7.13 My Records

Route:

`/me/records`

Purpose:

Allow users to browse their own historical records.

Display in reverse chronological order.

Filters:

- 전체
- category filters

Each record:

- date
- category
- content
- image thumbnail

Only the authenticated user's records are visible.

---

# 8. Weekly / Monthly Statistics

## Weekly

Range:

Last 7 calendar days, including today.

Preferred interpretation:

Today minus 6 days through today.

Display:

- total care logs
- category counts

## Monthly

Range:

Current calendar month.

Display:

- total care logs
- category counts

Do not rank the user.

Do not compare the user against other users.

Do not create a score.

---

# 9. Push Notification

## 9.1 Purpose

Push notification is primarily a content distribution and re-entry mechanism.

It should bring users back through health knowledge.

The notification must not pressure the user to perform a behavior.

Bad:

```text
오늘도 돌봄을 기록하세요.
```

Good:

```text
오늘의 돌봄 지식

잠을 줄여 만든 나만의 시간은
정말 나를 위한 나의 시간일까요?
```

---

## 9.2 Push Flow

```text
Admin creates Article
        ↓
Admin creates notification
        ↓
Notification scheduled
        ↓
Web Push sent
        ↓
User clicks notification
        ↓
/care/articles/[articleId]
```

The notification should contain the target article ID or equivalent secure route reference.

---

## 9.3 Push Permission

Do not immediately request notification permission on the first page load.

Use an appropriate contextual moment.

Suggested:

```text
돌봄의 건강 이야기를 받아보시겠어요?

새로운 건강 이야기가 올라오면
알려드릴게요.

[알림 받기] [나중에]
```

The user must be able to decline.

The application must work normally without push permission.

---

## 9.4 PWA

The application should support PWA capabilities where practical.

Requirements:

- Web App Manifest
- Installable mobile experience
- Service Worker
- Web Push
- HTTPS in production

For iOS, document the requirement that Web Push depends on the user's supported iOS version and web-app installation behavior.

Do not assume that browser push works identically across every browser.

---

# 10. Admin

Admin routes:

```text
/admin
/admin/articles
/admin/articles/new
/admin/articles/[articleId]/edit
/admin/users
/admin/care-logs
```

---

## 10.1 Admin Authorization

User model contains:

`role`

Allowed values:

```text
USER
ADMIN
```

Only ADMIN may access `/admin/*`.

Authorization must be enforced server-side.

Do not rely only on hiding admin buttons in the frontend.

---

## 10.2 Admin Dashboard

Minimal dashboard:

```text
관리자

게시된 아티클
회원 수
돌봄 기록 수
오늘의 돌봄 기록
```

Detailed analytics are not required for MVP.

---

## 10.3 Article Management

Admin can:

- create article
- edit article
- delete article
- publish article
- unpublish article
- save draft
- schedule push notification

Article fields:

```text
id
title
category
summary
content
cover_image
reading_time
status
published_at
created_at
updated_at
```

Article status:

```text
DRAFT
PUBLISHED
```

Only PUBLISHED articles are visible to users.

---

## 10.4 Article Editor

Required fields:

- title
- category
- summary
- content

Optional:

- cover_image
- reading_time

The content editor should support basic rich text:

- heading
- paragraph
- bold
- italic
- bullet list
- ordered list
- link
- image

Avoid implementing a complex editor unless necessary.

---

## 10.5 Notification Management

Admin can create a notification associated with an article.

Fields:

```text
article_id
title
body
scheduled_at
status
```

Status:

```text
DRAFT
SCHEDULED
SENT
CANCELLED
```

---

## 10.6 User Management

Admin can view:

- nickname
- email/provider identifier where appropriate
- created_at
- role
- account status

Do not expose unnecessary Kakao personal information.

---

## 10.7 Care Log Management

Admin can view care logs for moderation purposes.

Admin can delete inappropriate posts.

Admin should not edit the user's content on behalf of the user.

---

# 11. Authentication

## MVP Provider

Kakao only.

Do not implement Google or Naver login in MVP.

Authentication flow:

```text
User
 ↓
Kakao OAuth
 ↓
Authentication callback
 ↓
Find/create local User
 ↓
Session
 ↓
Application
```

The application must maintain its own local User record.

Do not use Kakao profile data as the application's primary database model.

---

# 12. Data Model

Minimum database entities:

```text
User
CareLog
Like
Article
PushSubscription
Notification
```

---

## 12.1 User

```text
User
- id
- kakao_id
- nickname
- role
- created_at
- updated_at
```

Constraints:

- kakao_id unique
- nickname required
- role default USER

---

## 12.2 CareLog

```text
CareLog
- id
- user_id
- category
- content
- image_url
- created_at
- updated_at
- deleted_at
```

Constraints:

- user_id required
- content required
- category nullable
- image_url nullable

---

## 12.3 Like

```text
Like
- id
- user_id
- care_log_id
- created_at
```

Constraint:

`UNIQUE(user_id, care_log_id)`

---

## 12.4 Article

```text
Article
- id
- title
- category
- summary
- content
- cover_image_url
- reading_time
- status
- published_at
- created_at
- updated_at
```

---

## 12.5 PushSubscription

```text
PushSubscription
- id
- user_id
- endpoint
- p256dh
- auth
- created_at
- updated_at
```

A user may have multiple push subscriptions because the same user may use multiple devices/browsers.

---

## 12.6 Notification

```text
Notification
- id
- article_id
- title
- body
- scheduled_at
- sent_at
- status
- created_at
```

---

# 13. Image Upload

Users may upload:

`maximum 1 image per CareLog`

Admin may upload:

- Article cover image
- Article body images

Requirements:

- Validate MIME type
- Validate file size
- Generate appropriate optimized image
- Do not trust client-provided file extensions
- Store files in object storage
- Store only resulting URL/path in the database

Allowed formats:

- JPEG
- PNG
- WebP

Recommended maximum user image size should be defined during implementation.

Images should be resized/compressed for mobile performance.

---

# 14. Responsive Design

Mobile-first.

Primary viewport:

`375px ~ 430px`

Must also work on:

- tablet
- desktop

Desktop may use a centered mobile-like content width or responsive layout.

Do not design the MVP as a desktop-first dashboard.

---

# 15. UI / UX Principles

The service should feel:

- calm
- simple
- warm
- quiet
- trustworthy
- non-competitive

Avoid:

- aggressive gamification
- excessive badges
- bright reward animations
- complicated dashboards
- excessive colors
- information overload

The user's care records should be the visual focus.

---

# 16. Main Navigation

Bottom navigation:

```text
돌봄     기록     나
```

It should remain visible on the main authenticated screens.

Do not add:

```text
건강
커뮤니티
알림
통계
```

as separate bottom navigation items.

---

# 17. Feed Behavior

Feed should feel similar to a simple social feed.

Requirements:

- vertical scrolling
- newest posts first
- pagination or infinite scroll
- image lazy loading
- like interaction without page reload
- clear author nickname
- clear timestamp

Do not implement algorithmic recommendation in MVP.

---

# 18. Empty States

The application must handle empty states gracefully.

## No care logs

```text
아직 돌봄 기록이 없어요.

오늘의 나를 위한 작은 행동을
기록해보세요.
```

Do not say:

```text
목표를 달성하지 못했어요.
```

## No articles

```text
아직 건강 이야기가 준비되지 않았어요.
```

## No personal records

```text
아직 기록이 없어요.

언젠가 돌아볼 오늘을
하나 남겨보세요.
```

---

# 19. Error Handling

Errors should be human-readable.

Avoid exposing technical errors.

Bad:

`500 Internal Server Error`

Good:

`잠시 문제가 발생했어요. 잠시 후 다시 시도해주세요.`

For authentication errors:

`로그인에 실패했어요. 다시 시도해주세요.`

For upload errors:

`이미지를 업로드하지 못했어요. 다른 이미지를 사용해보세요.`

---

# 20. Security Requirements

## Authentication

- Secure OAuth flow
- Secure session management
- HTTP-only cookies where applicable
- HTTPS in production

## Authorization

Server-side authorization is mandatory.

Rules:

```text
USER:
- own records CRUD
- own likes
- read published articles
- read public care feed

ADMIN:
- everything USER can do
- article CRUD
- notification management
- user management
- moderation
```

Users must never be able to:

- edit another user's care log
- delete another user's care log
- access admin functions
- modify role
- modify another user's data

---

# 21. Database Security

If using Supabase/Postgres:

Enable Row Level Security where appropriate.

Conceptual policies:

CareLog:

```text
SELECT:
authenticated users can read non-deleted public records

INSERT:
authenticated user can create only their own records

UPDATE:
user can update only own records

DELETE:
user can delete only own records
```

Like:

```text
user can create/delete only own likes
```

Admin:

```text
ADMIN role required
```

Do not rely only on frontend restrictions.

---

# 22. Recommended Technical Architecture

Recommended MVP stack:

```text
Frontend
Next.js
React
TypeScript

Styling
Tailwind CSS

Backend
Next.js server-side functionality / API routes

Database
PostgreSQL

Authentication
Kakao OAuth

Storage
Object Storage / Supabase Storage

Push
Web Push + Service Worker

Hosting
Vercel or equivalent

Repository
GitHub
```

The implementation may replace an individual infrastructure component if there is a strong technical reason, but the external behavior defined in this document must remain unchanged.

---

# 23. Environment Variables

Never commit secrets.

Expected environment variables:

```text
KAKAO_CLIENT_ID
KAKAO_CLIENT_SECRET

DATABASE_URL

NEXT_PUBLIC_APP_URL

Storage credentials

VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
VAPID_SUBJECT
```

Exact names may be changed according to the selected libraries/framework conventions.

Create:

```text
.env.local
.env.example
```

`.env.example` must contain variable names but no secrets.

---

# 24. Project Structure

Suggested structure:

```text
/
├── app/
│   ├── login/
│   ├── onboarding/
│   ├── care/
│   │   ├── articles/
│   │   └── ...
│   ├── record/
│   ├── me/
│   ├── settings/
│   └── admin/
│
├── components/
│   ├── common/
│   ├── care/
│   ├── articles/
│   ├── record/
│   ├── me/
│   └── admin/
│
├── lib/
│   ├── auth/
│   ├── db/
│   ├── push/
│   ├── storage/
│   └── validation/
│
├── public/
│   ├── icons/
│   └── manifest/
│
├── prisma/ or supabase/
│
├── middleware.ts
├── .env.example
├── PROJECT_SPEC.md
├── README.md
└── package.json
```

The exact structure may be adapted to the chosen framework.

---

# 25. API / Server Function Requirements

The frontend must not directly implement business logic that should be protected.

Server-side operations should exist for:

```text
Authentication
Create CareLog
Update CareLog
Delete CareLog
Like / Unlike
Get Care Feed
Get My Records
Get Weekly Summary
Get Monthly Summary
Get Articles
Get Article
Admin Article CRUD
Admin User Management
Admin Moderation
Push Subscription
Send/Schedule Notification
```

---

# 26. Validation

Use server-side validation.

CareLog:

```text
content:
required

category:
optional

image:
optional, maximum 1
```

Nickname:

```text
required
trim whitespace
reasonable length limit
```

Article:

```text
title required
summary required
content required
category required
```

---

# 27. Performance

The application should be optimized for mobile.

Requirements:

- lazy load images
- compress uploaded images
- paginate feed
- paginate admin tables
- avoid unnecessary client-side fetching
- cache published articles where appropriate
- optimize fonts
- minimize JavaScript bundle where practical

The main care page should feel fast on a normal mobile network.

---

# 28. Accessibility

Basic accessibility is required.

- semantic HTML
- keyboard accessibility
- visible focus states
- alt text for meaningful images
- buttons must have accessible labels
- sufficient text contrast
- form labels
- screen reader-friendly navigation

Heart button example:

```text
aria-label="좋아요"
```

After liked:

```text
aria-label="좋아요 취소"
```

---

# 29. Analytics

MVP should collect basic product analytics if practical.

Important events:

```text
login
article_view
article_complete
care_log_created
care_log_updated
care_log_deleted
care_log_liked
care_log_unliked
push_permission_granted
push_notification_clicked
weekly_summary_viewed
monthly_summary_viewed
```

Analytics must not collect unnecessary sensitive health information.

---

# 30. Content Policy

The health article system is editorial.

Only ADMIN users can publish health articles.

Users cannot submit health articles.

User care posts are personal experiences, not medical advice.

The product should clearly distinguish:

```text
Editorial health information
vs
User personal experience
```

Do not present user-generated care posts as medically verified information.

---

# 31. Admin Content Philosophy

The administrator is responsible for the quality of health information.

Health content should:

- be understandable
- be evidence-informed
- avoid sensational claims
- avoid fear-based messaging
- avoid guaranteed health outcomes
- avoid diagnosing users
- avoid prescribing medical treatment

The purpose is education and motivation for healthy daily behavior.

---

# 32. Notification Content Philosophy

Notifications should create curiosity rather than pressure.

Preferred:

```text
오늘의 돌봄 지식

우리가 피곤한 이유는
잠이 부족해서만일까요?
```

Avoid:

```text
오늘도 돌봄을 기록하세요.
```

Avoid:

```text
3일째 기록이 없습니다.
```

Avoid:

```text
오늘 운동을 해야 합니다.
```

---

# 33. No Forced Behavior

The following must never be required:

- selecting a care category before using the app
- setting a goal
- creating a care log every day
- reading an article
- enabling notifications
- completing a challenge
- reaching a target number of care logs

The application must remain useful even if the user only:

- reads articles
- browses other people's care
- records occasionally
- checks their monthly history

---

# 34. Definition of Done

## Authentication

- [ ] Kakao login works
- [ ] New users can set nickname
- [ ] Existing users can log in
- [ ] Logout works

## Care Feed

- [ ] User can view feed
- [ ] Feed is newest-first
- [ ] User can create care post
- [ ] User can upload maximum 1 image
- [ ] User can edit own post
- [ ] User can delete own post
- [ ] User can like/unlike
- [ ] Users cannot edit/delete others' posts

## Articles

- [ ] User can view featured article
- [ ] User can view article list
- [ ] User can view article detail
- [ ] Only published articles are public
- [ ] Admin can create article
- [ ] Admin can edit article
- [ ] Admin can delete/unpublish article

## Record

- [ ] User can create record
- [ ] Category is optional
- [ ] Content is required
- [ ] Image is optional
- [ ] Maximum 1 image

## My Page

- [ ] Weekly summary works
- [ ] Monthly summary works
- [ ] Category counts work
- [ ] User can view own records

## Push

- [ ] User can request push permission
- [ ] Subscription can be saved
- [ ] Admin can create notification
- [ ] Notification can be scheduled/sent
- [ ] Notification opens target article

## Admin

- [ ] Admin route protected
- [ ] Non-admin users cannot access admin
- [ ] Article CRUD works
- [ ] User list works
- [ ] Care log moderation works

## Security

- [ ] Server-side authorization
- [ ] Users cannot modify other users' data
- [ ] Admin role cannot be changed from client
- [ ] Secrets are not committed
- [ ] Production uses HTTPS

---

# 35. Important Development Rules for Codex

## Rule 1

Do not add features that are not specified in this document unless explicitly requested.

## Rule 2

Do not introduce gamification.

Do not add:

- points
- badges
- streaks
- rankings
- goals
- challenges
- penalties

## Rule 3

Do not change the main navigation.

Main navigation:

`돌봄 / 기록 / 나`

## Rule 4

Do not turn the service into a general-purpose SNS.

The community exists to encourage self-care.

## Rule 5

Do not make health behavior mandatory.

## Rule 6

Do not expose private user information.

Public identity is nickname only.

## Rule 7

Admin authorization must be enforced server-side.

## Rule 8

Do not implement Google or Naver authentication in MVP.

Kakao only.

## Rule 9

Do not implement comments in MVP.

## Rule 10

Do not create unnecessary screens.

Prefer simple navigation and contextual sub-pages.

---

# 36. UX Principle

The application should repeatedly communicate the following idea without explicitly preaching it:

> "나는 다른 사람을 돌보느라 바쁘지만,
> 나도 돌봄이 필요한 사람이다."

The product should not make the user feel guilty.

It should make the user feel:

```text
알게 됐다
↓
조금 관심이 생겼다
↓
다른 사람도 이렇게 사는구나
↓
나도 한번 해볼까
↓
오늘의 나를 조금 돌봤다
↓
나를 돌아봤다
```

This is the core experience of DOLBOM.

---

# 37. Final Product Definition

돌봄은 건강관리 목표를 달성시키는 앱이 아니다.

돌봄은 사용자를 관리하는 앱도 아니다.

돌봄은 사용자가 스스로 자신을 돌볼 수 있도록

**알려주고 → 보여주고 → 기록하게 하고 → 돌아보게 하는 서비스**

다.

Core Loop:

```text
건강지식
   ↓
관심
   ↓
다른 사람의 돌봄
   ↓
자발적 행동
   ↓
나의 돌봄 기록
   ↓
주간/월간 성찰
   ↓
다시 건강지식
```

End of Specification.
