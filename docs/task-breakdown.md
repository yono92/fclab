# FCLab 구현 태스크 분할

> 다른 Claude 세션(구현 에이전트)에 넘길 태스크 단위 및 순서
> 각 태스크는 독립적으로 실행 가능하며, 의존관계를 명시함

---

## Phase 0: 프로젝트 기반 (Task 1-3)

### Task 1: Next.js 프로젝트 초기화
**의존**: 없음
**산출물**: 실행 가능한 빈 Next.js 프로젝트
**지시사항**:
```
1. create-next-app@latest fclab-app --typescript --tailwind --eslint --app --src-dir
2. shadcn/ui 초기화 (npx shadcn@latest init)
3. 핵심 의존성 설치:
   - zod (API 응답 검증)
   - recharts (차트)
   - @supabase/supabase-js (DB)
   - vitest @testing-library/react (테스트)
4. tsconfig.json strict: true 확인
5. 디렉토리 구조 생성:
   src/
   ├── app/                    # Next.js App Router
   │   ├── page.tsx            # 홈 (검색)
   │   ├── player/[nickname]/
   │   │   ├── page.tsx        # 유저 대시보드
   │   │   ├── match/[id]/page.tsx
   │   │   ├── compare/page.tsx
   │   │   └── trend/page.tsx
   │   ├── meta/
   │   │   ├── page.tsx
   │   │   └── players/page.tsx
   │   └── about/page.tsx
   ├── components/
   │   ├── ui/                 # shadcn 컴포넌트
   │   ├── charts/             # 차트 컴포넌트
   │   └── analysis/           # 분석 UI 컴포넌트
   ├── lib/
   │   ├── stats.ts            # 통계 함수
   │   ├── action-rules.ts     # 액션 제안 규칙
   │   ├── play-style.ts       # 플레이 스타일 분류
   │   ├── nexon-api.ts        # Nexon API 클라이언트
   │   └── supabase.ts         # Supabase 클라이언트
   ├── types/
   │   └── nexon.ts            # Zod 스키마 + 타입 (specs에서 복사)
   └── __tests__/
       ├── stats.test.ts
       ├── action-rules.test.ts
       └── play-style.test.ts
6. 기본 레이아웃 (다크 테마 기본, 헤더 + 검색바)
```
**완료 기준**: `npm run dev`로 홈페이지 렌더링 확인

---

### Task 2: Supabase 스키마 적용
**의존**: Supabase MCP 연결 (세션 재시작 필요)
**산출물**: DB 테이블 생성 완료
**지시사항**:
```
1. Supabase MCP로 기존 fclab 프로젝트 확인
2. 기존 테이블이 있으면 DROP (유저 확인 후)
3. specs/001-core-schemas/contracts/db-schema.sql 실행
4. 테이블 생성 확인: meta_*, users, matches, match_*, ranker_stats
5. RLS 정책 확인
6. v_user_recent_stats 뷰 동작 확인
```
**완료 기준**: Supabase 대시보드에서 모든 테이블 + 뷰 확인

---

### Task 3: Nexon API 클라이언트 + Zod 검증
**의존**: Task 1
**산출물**: `src/lib/nexon-api.ts`, `src/types/nexon.ts`
**지시사항**:
```
1. specs/001-core-schemas/contracts/nexon-api.types.ts → src/types/nexon.ts 복사 및 조정
2. src/lib/nexon-api.ts 구현:
   - 클래스: NexonApiClient
   - constructor(apiKey: string)
   - 모든 메서드가 Zod 스키마로 응답 파싱
   - Rate Limit 에러(429) 시 자동 재시도 (exponential backoff, 최대 3회)
   - 타임아웃 10초
   - 에러 시 NexonApiError throw (코드, 메시지 포함)
3. API Route 생성: src/app/api/nexon/[...path]/route.ts
   - 서버사이드에서 API Key 보호
   - 프록시 역할
4. 환경변수: NEXON_API_KEY (.env.local)
```
**완료 기준**: 닉네임으로 OUID 조회 테스트 성공

---

## Phase 1: 핵심 기능 (Task 4-9)

### Task 4: 통계 함수 라이브러리 (TDD)
**의존**: Task 1
**산출물**: `src/lib/stats.ts`, `src/__tests__/stats.test.ts`
**지시사항**:
```
Constitution 원칙: Test-First. 테스트를 먼저 작성하고 구현.

구현할 함수 (docs/full-spec.md 섹션 9 참고):
1. calculatePercentile(value, distribution) → { percentile, rank, sampleSize }
2. weightedMovingAverage(values, window) → number[]
3. wilsonScore(successes, total, z?) → { lower, upper, center }
4. detectOutliers(values, threshold?) → { index, value, zScore }[]
5. cohensD(group1, group2) → number
6. pearsonCorrelation(x, y) → number
7. reliabilityGrade(n) → 'insufficient' | 'limited' | 'sufficient'
8. mean(values) → number
9. standardDeviation(values) → number

테스트 케이스 필수:
- 빈 배열 (n=0)
- 단일 원소 (n=1)
- 극단값 (매우 크거나 작은 값)
- 모두 같은 값 (stddev=0)
- 일반적인 케이스
- wilsonScore: total=0, successes > total (불가능 케이스)
```
**완료 기준**: `npx vitest run` 전체 통과

---

### Task 5: 액션 제안 규칙 엔진
**의존**: Task 4
**산출물**: `src/lib/action-rules.ts`, `src/__tests__/action-rules.test.ts`
**지시사항**:
```
docs/full-spec.md 섹션 9-5의 15개 규칙 구현.

interface ActionRule {
  id: string;
  condition: (stats: UserStats) => boolean;
  suggestion: string;
  evidence: (stats: UserStats) => string;
  priority: 'high' | 'medium' | 'low';
  category: 'shooting' | 'passing' | 'defending' | 'general';
}

function evaluateRules(stats: UserStats): ActionSuggestion[]
  - 모든 규칙 평가
  - 해당하는 규칙만 반환
  - priority 순 정렬 (high → medium → low)
  - 최대 5개까지만 반환 (정보 과부하 방지)

UserStats 인터페이스는 DB의 v_user_recent_stats + 추가 계산 지표.
```
**완료 기준**: 15개 규칙 각각에 대한 테스트 통과

---

### Task 6: 플레이 스타일 분류
**의존**: Task 4
**산출물**: `src/lib/play-style.ts`, `src/__tests__/play-style.test.ts`
**지시사항**:
```
docs/full-spec.md 섹션 9-6 참고.

5축: possession, counter, pressing, shooting, buildup
각 축 0-100 점수.

classifyPlayStyle(stats: UserStats): PlayStyle
getMainStyle(style: PlayStyle): { name: string, score: number, description: string }

스타일 이름 매핑:
  possession → "점유형 플레이어"
  counter → "역습형 플레이어"
  pressing → "프레싱형 플레이어"
  shooting → "슈팅형 플레이어"
  buildup → "빌드업형 플레이어"
```
**완료 기준**: 테스트 통과 + 다양한 스탯 조합에서 합리적 결과

---

### Task 7: 공통 UI 컴포넌트
**의존**: Task 1
**산출물**: `src/components/analysis/` 하위 컴포넌트들
**지시사항**:
```
docs/full-spec.md 섹션 8 참고. 4개 컴포넌트 구현:

1. TrustBadge.tsx
   - Props: sampleSize, dateRange, lastUpdated, matchType
   - 신뢰도 등급별 색상 (빨/노/초)
   - shadcn Badge + Card 활용

2. PercentileGauge.tsx
   - Props: label, value, unit, percentile, benchmark?
   - 수평 바 + 포인터
   - 랭커 평균 마커 (있으면)
   - Tailwind로 구현 (차트 라이브러리 불필요)

3. StatCard.tsx
   - Props: title, value, subtitle?, trend?, percentile?
   - shadcn Card
   - 트렌드 화살표 (↑↓→)

4. ActionSuggestionCard.tsx
   - Props: suggestion, evidence, priority, category
   - priority별 아이콘/색상
   - 근거 문장 하이라이트
```
**완료 기준**: Storybook 없이 /dev 페이지에서 각 컴포넌트 시각 확인

---

### Task 8: 슈팅 히트맵 컴포넌트
**의존**: Task 1
**산출물**: `src/components/charts/ShootingHeatmap.tsx`
**지시사항**:
```
docs/full-spec.md 섹션 8-2 참고.

SVG 기반 축구 피치 + 슈팅 마커:
1. 피치 렌더링 (SVG)
   - 외곽선, 센터서클, 페널티박스, 골대
   - 비율: 가로 105m, 세로 68m → 비율 유지
   
2. 좌표 변환
   - Nexon API: x(0→1) 왼쪽→오른쪽, y(0→1) 위→아래
   - SVG 좌표로 매핑
   
3. 슈팅 마커
   - 골: 빨간 원 (r=6)
   - 유효슈팅: 노란 원 (r=4)
   - 빗나감: 회색 원 (r=3)
   - 호버 시 툴팁: 시간, 선수명, 슈팅 유형
   
4. 존 분석 오버레이 (토글 가능)
   - 6구역 분할
   - 각 존별 슈팅수/유효슈팅률/골전환율 텍스트 표시
   - 배경 불투명도로 밀도 표현

Props:
  shots: ShootDetailItem[]  (Zod 타입 재활용)
  showZones?: boolean
  width?: number
  height?: number
```
**완료 기준**: 샘플 데이터로 피치 위 슈팅 위치 정확히 표시

---

### Task 9: 유저 대시보드 페이지
**의존**: Task 2, 3, 4, 5, 6, 7, 8 (모두)
**산출물**: `src/app/player/[nickname]/page.tsx` + 관련 서버 액션
**지시사항**:
```
핵심 페이지. docs/full-spec.md 섹션 1-3 참고.

1. Server Component로 구현 (RSC)
2. 데이터 흐름:
   a. nickname 파라미터로 Nexon API → OUID
   b. OUID → 유저 기본정보 + 최고등급
   c. OUID → 최근 20경기 매치 ID 목록
   d. 각 매치 ID → 매치 상세 (캐시 우선, 없으면 API)
   e. 모든 데이터 Supabase에 저장
   f. 통계 계산 (stats.ts 활용)
   g. 액션 제안 평가 (action-rules.ts)
   h. 플레이 스타일 분류 (play-style.ts)

3. UI 구성:
   - 상단: 닉네임, 레벨, 매치타입 셀렉터, 경기수 셀렉터
   - TrustBadge
   - 종합 요약 카드 (승률 도넛, 역대 최고 등급)
   - 플레이 스타일 레이더 차트 + 한줄 설명
   - 4개 탭: 슈팅/패스/수비/선수
   - 각 탭 내 PercentileGauge 리스트
   - 슈팅 탭: ShootingHeatmap
   - 액션 제안 섹션 (최대 5개)
   - 최근 매치 리스트 (클릭 → /player/[nickname]/match/[id])

4. 로딩 상태: Suspense + skeleton
5. 에러 상태: 닉네임 없음, API 에러, 경기 없음
```
**완료 기준**: 실제 닉네임 검색 → 대시보드 전체 렌더링

---

## Phase 2: 확장 기능 (Task 10-12)

### Task 10: 매치 상세 페이지
**의존**: Task 9
**산출물**: `src/app/player/[nickname]/match/[id]/page.tsx`
**지시사항**:
```
개별 매치 심층 분석.
- 양쪽 유저 스탯 비교 (나란히)
- 슈팅 히트맵 (양쪽)
- 선수별 퍼포먼스 테이블
- 이상치 플래그 (평소와 다른 지표 하이라이트)
```

### Task 11: 메타데이터 동기화 크론
**의존**: Task 2, 3
**산출물**: Supabase Edge Function 또는 Vercel Cron
**지시사항**:
```
Daily: matchtype, spid, seasonid, spposition, division JSON → DB UPSERT
spid.json이 ~5만건으로 큼 → 배치 처리 (1000건 단위)
```

### Task 12: 홈페이지 + 검색
**의존**: Task 1
**산출물**: `src/app/page.tsx`
**지시사항**:
```
docs/full-spec.md 섹션 1-2 참고.
- 중앙 검색바 (닉네임 입력 → /player/[nickname] 이동)
- 최근 분석된 유저 (DB에서 조회)
- 서비스 소개 섹션 3개 카드
- debounce 검색 (300ms)
```

---

## Phase 3: 분석 강화 (Task 13-14)

### Task 13: 나 vs 랭커 비교
**의존**: Task 9, 11
**산출물**: `src/app/player/[nickname]/compare/page.tsx`

### Task 14: 변화 추적 (트렌드)
**의존**: Task 9
**산출물**: `src/app/player/[nickname]/trend/page.tsx`

---

## 태스크 의존관계 다이어그램

```
Task 1 (Next.js 초기화)
  ├── Task 3 (Nexon API 클라이언트)
  ├── Task 4 (통계 함수 TDD) ──┬── Task 5 (액션 제안)
  │                             └── Task 6 (플레이 스타일)
  ├── Task 7 (공통 UI 컴포넌트)
  ├── Task 8 (슈팅 히트맵)
  └── Task 12 (홈페이지)

Task 2 (Supabase 스키마)

Task 9 (유저 대시보드) ← Task 2,3,4,5,6,7,8 모두 필요
  ├── Task 10 (매치 상세)
  ├── Task 13 (나 vs 랭커)
  └── Task 14 (변화 추적)

Task 11 (메타 동기화) ← Task 2,3
```

## 병렬 실행 가능 그룹

| 그룹 | 태스크 | 동시 실행 가능 |
|------|--------|--------------|
| A | Task 1, Task 2 | ✅ 독립적 |
| B | Task 3, Task 4, Task 7, Task 8, Task 12 | ✅ 모두 Task 1만 의존 |
| C | Task 5, Task 6 | ✅ Task 4만 의존 |
| D | Task 9 | ❌ B,C 완료 후 |
| E | Task 10, Task 11, Task 13, Task 14 | ✅ Task 9 완료 후 병렬 가능 |

## 추천 실행 순서 (멀티에이전트)

```
Round 1: Agent A → Task 1   |  Agent B → Task 2
Round 2: Agent A → Task 4   |  Agent B → Task 3   |  Agent C → Task 7+8
Round 3: Agent A → Task 5   |  Agent B → Task 6   |  Agent C → Task 12
Round 4: Agent A → Task 9 (메인 대시보드 - 가장 복잡, 단일 에이전트 집중)
Round 5: Agent A → Task 10  |  Agent B → Task 11  |  Agent C → Task 13+14
```
