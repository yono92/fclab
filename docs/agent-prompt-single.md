# FCLab 구현 에이전트 프롬프트 (단일 에이전트용)

> 하나의 Claude 세션에 순서대로 전달
> 각 라운드가 끝나면 다음 프롬프트를 입력

---

## 라운드 1: 프로젝트 셋업

```
너는 FCLab이라는 FC Online 전적 분석 웹서비스의 풀스택 개발자야.
이 프로젝트의 모든 구현을 네가 담당해. 기획 문서는 이미 완성되어 있어.

프로젝트 경로: /Users/yoonsejong/Dev/yono/work/test/fclab/
여기에 docs/, specs/, .specify/ 등 기획 문서가 있으니 절대 덮어쓰지 마.

## MCP 도구
너에게는 2개의 MCP가 연결되어 있어:
1. **Supabase MCP** — DB 테이블 생성/조회/관리에 사용
2. **Context7 MCP** — 라이브러리 최신 문서 조회에 사용
   - 코드 작성 전에 Context7으로 해당 라이브러리의 최신 API/사용법을 확인해
   - 예: Next.js App Router, Recharts, Supabase JS, Zod, shadcn/ui, Tailwind 등
   - 사용법: resolve-library-id로 라이브러리 ID 조회 → query-docs로 문서 검색

## 프로젝트 이해를 위해 먼저 읽어야 할 파일들
1. docs/full-spec.md — 종합 기획서 (화면설계, 통계로직, 유저플로우)
2. docs/task-breakdown.md — 태스크 분할 및 의존관계
3. docs/page-specs.md — 페이지별 상세 스펙
4. docs/visualization-library.md — 시각화 라이브러리 선정
5. specs/001-core-schemas/contracts/nexon-api.types.ts — Zod 스키마
6. specs/001-core-schemas/contracts/db-schema.sql — DB 스키마
7. .specify/memory/constitution.md — 프로젝트 원칙 (반드시 준수)

## 이번 라운드에서 할 것

### 1. Next.js 프로젝트 초기화
- Next.js 15 (App Router, TypeScript, Tailwind, ESLint, src 디렉토리)
- 기존 package.json / node_modules 정리 후 새로
- shadcn/ui 초기화 (다크 테마 기본)
- 의존성: zod, recharts, @supabase/supabase-js, vitest (dev)
- tsconfig strict: true
- shadcn 컴포넌트: Button, Input, Card, Badge, Tabs, Select

### 2. 디렉토리 구조 생성
src/app/ (라우트 전체), src/components/ (ui, charts, analysis), src/lib/, src/types/, src/__tests__/
각 페이지는 "준비 중" placeholder로.

### 3. 타입 복사
specs/001-core-schemas/contracts/nexon-api.types.ts → src/types/nexon.ts

### 4. 루트 레이아웃
- 다크 테마, 헤더(FCLab 로고 + 검색바 + 네비), 반응형

### 5. 환경변수
.env.local.example 생성 (NEXON_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY)

### 6. Supabase 스키마 적용
- Supabase MCP가 연결되어 있어
- 기존 테이블 확인 → 정리 필요하면 나한테 물어봐
- specs/001-core-schemas/contracts/db-schema.sql 실행
- 12 테이블 + 1 뷰 + RLS 적용

### 7. vitest.config.ts 설정

## 프로젝트 원칙 (constitution.md)
- Statistics-First: 통계적 근거 기반
- Type Safety: strict mode, any 금지, Zod 런타임 검증
- Trust UX: 표본 수, 신뢰구간, 갱신 시각 명시
- Test-First: 핵심 통계 함수는 TDD
- Spec-Driven: 스펙 먼저, 구현 나중

## 완료 기준
- npm run dev → 홈페이지 렌더링, 헤더+검색바 동작
- 모든 라우트 placeholder 접근 가능
- Supabase 테이블 전체 생성 확인
- npx vitest run 에러 없이 실행 가능
```

---

## 라운드 2: 핵심 라이브러리

```
이전 라운드에서 프로젝트 셋업을 완료했어. 이제 핵심 라이브러리를 구현해줘.

## Context7 활용
코드 작성 전에 Context7 MCP로 vitest 최신 API를 확인해 (특히 describe, it, expect 패턴).

## 해야 할 것 3가지 (순서대로)

### 1. 통계 함수 (TDD) — src/lib/stats.ts + src/__tests__/stats.test.ts

docs/full-spec.md 섹션 9-1~9-4 참고. 테스트를 먼저 작성하고 구현해.

함수 9개:
- mean, standardDeviation
- calculatePercentile → { percentile, rank("상위/하위 X%"), sampleSize }
- weightedMovingAverage → 최신 데이터에 높은 가중치
- wilsonScore → Wilson Score 신뢰구간 (total=0이면 {0,0,0})
- detectOutliers → z-score 기반 (threshold 기본 2.0, stddev=0이면 빈 배열)
- cohensD → pooled std 사용
- pearsonCorrelation → 길이 불일치 시 에러
- reliabilityGrade → n<5 insufficient, 5≤n<15 limited, n≥15 sufficient

테스트: 빈 배열, 단일 원소, 같은 값, 극단값, 일반 케이스. 최소 40개.

### 2. 액션 제안 규칙 — src/lib/action-rules.ts + 테스트

docs/full-spec.md 섹션 9-5의 15개 규칙 테이블 그대로 구현.
evaluateRules(stats) → 조건 만족하는 제안 반환, priority 순, 최대 5개.

### 3. 플레이 스타일 분류 — src/lib/play-style.ts + 테스트

docs/full-spec.md 섹션 9-6 참고.
5축(점유/역습/프레싱/슈팅/빌드업) 0-100 점수.
classifyPlayStyle(stats) + getMainStyle(style).

## 완료 기준
- npx vitest run 전체 통과
- 통계 40개+ 테스트, 액션 30개+ 테스트, 스타일 10개+ 테스트
```

---

## 라운드 3: API + 컴포넌트

```
통계/분석 라이브러리가 완성됐어. 이제 API 클라이언트와 UI 컴포넌트를 만들어줘.

## Context7 활용
- Supabase JS 클라이언트 최신 API → Context7으로 확인
- Recharts RadarChart 사용법 → Context7으로 확인
- Next.js App Router의 route handler 패턴 → Context7으로 확인

## 1. Nexon API 클라이언트 — src/lib/nexon-api.ts

docs/nexon-openapi.md + src/types/nexon.ts 참고.

class NexonApiClient(apiKey):
- 모든 메서드가 Zod 스키마로 응답 파싱
- 429 에러 시 exponential backoff (최대 3회)
- 타임아웃 10초

메서드: getOuid, getUserBasic, getUserMaxDivision, getUserMatch, getMatchDetail, getRankerStats, getMetaMatchType/SpId/Season/Position/Division

API 프록시: src/app/api/nexon/[...path]/route.ts
- 서버사이드에서 API Key 보호

Supabase 클라이언트: src/lib/supabase.ts

## 2. UI 컴포넌트 6개 — src/components/

docs/full-spec.md 섹션 8, docs/page-specs.md 참고.

analysis/TrustBadge.tsx — 신뢰도 배지 (n<5 빨강, 5-15 노랑, ≥15 초록)
analysis/PercentileGauge.tsx — 백분위 수평 바 (Tailwind, 랭커 마커)
analysis/StatCard.tsx — 지표 카드 (트렌드 화살표)
analysis/ActionSuggestionCard.tsx — 액션 제안 리스트 (priority별 색)
charts/ShootingHeatmap.tsx — SVG 축구 피치 + 슈팅 위치 마커 + 6구역 분석
charts/PlayStyleRadar.tsx — Recharts RadarChart 5축

모든 컴포넌트 'use client'. 다크 테마. any 금지.

## 완료 기준
- .env.local에 실제 NEXON_API_KEY 넣고 닉네임으로 OUID 조회 성공
- 임시 페이지에서 각 컴포넌트 샘플 데이터로 렌더링 확인
```

---

## 라운드 4: 홈페이지 + 유저 대시보드

```
모든 기반이 완성됐어. 이제 FCLab의 핵심 2개 페이지를 구현해줘.

## Context7 활용
- Next.js Server Components + Suspense 패턴 → Context7으로 확인
- Recharts PieChart, BarChart, LineChart 사용법 → Context7으로 확인
- shadcn/ui Tabs, Select 컴포넌트 → Context7으로 확인

## 반드시 읽어: docs/page-specs.md (전체)

## 1. 홈페이지 — src/app/page.tsx

docs/page-specs.md 섹션 1 그대로:
- 히어로: "FCLab — 통계로 증명하는 플레이 분석" + 큰 검색바
- 검색 → /player/{nickname} 이동
- 최근 분석 유저 5명 (DB에서, 없으면 숨김)
- "FCLab이 다른 이유" 3개 카드 (통계근거/액션제안/변화추적)

## 2. 유저 대시보드 — src/app/player/[nickname]/page.tsx (★ 핵심)

docs/page-specs.md 섹션 2 전체.

분석 로직 통합: src/lib/analyze.ts
  async function analyzePlayer(nickname, matchtype, limit):
    1. API로 유저정보 + 매치목록 + 매치상세 수집
    2. DB 캐시 우선 (없으면 API → DB 저장)
    3. stats.ts로 통계 계산
    4. 백분위 계산 (DB의 다른 유저 대비)
    5. action-rules.ts로 액션 제안
    6. play-style.ts로 스타일 분류
    7. detectOutliers로 이상 경기 플래그

페이지 구성:
  A: 헤더 (닉네임, Lv, 매치타입 셀렉터, 경기수 셀렉터)
  B: TrustBadge
  C: 종합 (승률 도넛 + 최고등급 + 플레이스타일 레이더)
  D: 4탭 (슈팅: 히트맵+PercentileGauge, 패스: 도넛+게이지, 수비: 게이지+실점히스토, 선수: TOP10 테이블)
  E: ActionSuggestionCard (최대 5개)
  F: 최근 매치 리스트 (이상치 플래그, 클릭 → 매치상세)

에러: 닉네임 없음, API 에러, 경기 없음
로딩: loading.tsx skeleton
매치타입/경기수: 쿼리 파라미터 (?matchtype=50&limit=20)

## 완료 기준
- 실제 닉네임 검색 → 홈에서 대시보드까지 전체 흐름 동작
- 4탭 전환, 히트맵, 레이더, 액션제안 모두 표시
- 에러/로딩 처리
```

---

## 라운드 5: 나머지 페이지

```
핵심 기능이 동작해! 이제 나머지 페이지를 완성해줘.

## 1. 매치 상세 — src/app/player/[nickname]/match/[id]/page.tsx
docs/page-specs.md 섹션 3.
- 양쪽 유저 스탯 비교, 히트맵 양쪽, 골 타임라인, 선수별 테이블
- 이상치 하이라이트

## 2. 메타데이터 동기화
- src/lib/sync-metadata.ts: Nexon static JSON 6개 → Supabase UPSERT
  - spid.json ~5만건 → 1000건 배치
- src/app/api/cron/sync-meta/route.ts: GET 트리거, CRON_SECRET 인증
- vercel.json cron 설정 (매일 UTC 19시 = 한국 새벽 4시)
- 한번 실행해서 메타 테이블 채워줘

## 3. 나 vs 랭커 비교 — src/app/player/[nickname]/compare/page.tsx
docs/page-specs.md 섹션 4.
- 내 TOP 10 선수 vs ranker_stats 랭커 평균
- RadarChart (나 vs 랭커), 차이 테이블, cohensD 효과 크기 판정
- |d|<0.2 유사, 0.2~0.5 약간, 0.5~0.8 차이, ≥0.8 큰차이

## 4. 변화 추적 — src/app/player/[nickname]/trend/page.tsx
docs/page-specs.md 섹션 5.
- 2회 이상 검색 기록 필요 (없으면 안내 메시지)
- 승률 WMA 라인차트, 핵심 지표 변화 테이블

## 완료 기준
- 모든 페이지 정상 렌더링
- 매치 상세: 양쪽 비교 동작
- 메타 동기화: meta_players에 수만건 확인
- 나vs랭커: 레이더+테이블 표시
```

---

## 라운드 6: 마무리 + Git + Vercel 배포

```
모든 기능이 구현됐어. 마무리 + Git 연동 + Vercel 배포까지 해줘.

## 1. 코드 품질 마무리
- 전체 페이지 반응형 확인 (모바일/태블릿/데스크톱)
- 에러 바운더리 점검
- SEO 메타태그 (각 페이지별 title, description)
- 성능 최적화:
  - 이미지 next/image 사용
  - 동적 import (차트 컴포넌트 lazy load)
  - Supabase 쿼리 최적화 (인덱스 활용 확인)
- 전체 vitest 통과 확인

## 2. Git 연동
기존 레포: https://github.com/yono92/fclab.git
이 레포에 기존 코드가 있는데, 새 프로젝트로 완전히 교체할 거야.

순서:
1. 현재 fclab 디렉토리의 .git 확인 (spec-kit이 init 했을 수 있음)
2. .gitignore 정리:
   - node_modules, .next, .env.local, .env, .mcp.json
   - docs/scraped-api-raw.json, docs/scraped-api-detail.txt (스크래핑 원본)
3. 기존 remote 제거하고 새로 연결:
   git remote remove origin (있으면)
   git remote add origin https://github.com/yono92/fclab.git
4. 새 브랜치에서 작업:
   git checkout -b v2-rebuild
5. 전체 파일 add + commit:
   "feat: FCLab v2 전면 리빌드 - 통계 기반 FC Online 플레이 분석 플랫폼"
6. force push (기존 코드 교체):
   git push -f origin v2-rebuild
7. 나한테 확인 후 main에 머지할지 물어봐

⚠ force push 전에 반드시 나한테 확인받아.

## 3. Vercel 배포 (CLI)

1. npx vercel login (이미 로그인돼 있을 수 있음)
2. npx vercel link — 기존 fclab 프로젝트에 연결 (있으면) 또는 새로 생성
3. 환경변수 설정 (Vercel에 등록):
   npx vercel env add NEXON_API_KEY production
   npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
   npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
   npx vercel env add SUPABASE_SERVICE_ROLE_KEY production
   npx vercel env add CRON_SECRET production
   - 값은 .env.local에서 읽어서 넣어
   - preview, development 환경에도 동일하게 추가
4. npx vercel deploy --prod
5. 배포 URL 확인하고 나한테 알려줘
6. vercel.json에 cron 설정 확인:
   { "crons": [{ "path": "/api/cron/sync-meta", "schedule": "0 19 * * *" }] }

## 4. 배포 후 검증
- 배포된 URL에서 닉네임 검색 → 대시보드 동작 확인
- API 프록시 동작 (NEXON_API_KEY가 서버에서만 사용되는지)
- Supabase 연결 확인
- 모바일에서 접속 테스트

## 완료 기준
- GitHub에 코드 push 완료
- Vercel에 배포 완료 + 라이브 URL 확인
- 환경변수 5개 모두 Vercel에 등록
- 실제 닉네임 검색이 프로덕션에서 동작
```
