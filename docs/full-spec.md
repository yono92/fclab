# FCLab 종합 기획서

## Context
FC Online 전적검색 시장은 레드오션이지만, "통계적 근거 기반 실력 향상 분석 제품"은 아직 빈자리.
통계학과의 강점을 살려 ZDQD(AI 요약형)와 차별화된 "근거 기반 분석형" 포지셔닝으로 진입한다.

---

## 1. 페이지 구조 & 화면 설계

### 1-1. 사이트맵

```
/                          ← 랜딩 (검색 중심)
/player/[nickname]         ← 유저 분석 대시보드 (핵심)
/player/[nickname]/match/[id] ← 매치 상세
/player/[nickname]/compare ← 나 vs 랭커 비교
/player/[nickname]/trend   ← 기간별 변화 추적
/meta                      ← 메타 대시보드
/meta/players              ← 선수별 메타 (랭커 vs 일반)
/about                     ← 서비스 소개
```

### 1-2. 홈 (`/`)

```
┌──────────────────────────────────────────────────────┐
│  FCLab — 통계로 증명하는 플레이 분석                    │
│                                                       │
│  ┌─────────────────────────────────────┐              │
│  │  🔍 닉네임을 입력하세요               │  [분석하기]  │
│  └─────────────────────────────────────┘              │
│                                                       │
│  최근 분석된 유저     인기 분석 지표                     │
│  ┌────┐ ┌────┐      유효슈팅률 | 패스성공률 | 점유율     │
│  │user│ │user│                                        │
│  └────┘ └────┘                                        │
│                                                       │
│  ─── FCLab이 다른 이유 ──────────────────────────────  │
│  📊 통계 근거    🎯 액션 제안    📈 변화 추적            │
│  "상위 15%"      "박스 내 침투↑"  "주간 트렌드"          │
└──────────────────────────────────────────────────────┘
```

### 1-3. 유저 분석 대시보드 (`/player/[nickname]`)

이 페이지가 **핵심 제품**. 검색 후 바로 보이는 페이지.

```
┌──────────────────────────────────────────────────────┐
│  [닉네임] Lv.32                    공식경기 ▼  최근 20경기 ▼ │
│                                                       │
│  ┌─── 신뢰도 배지 ──────────────────────────────────┐ │
│  │ 표본: 20경기 | 기간: 3/15~4/01 | 갱신: 4/02 13:00 │ │
│  │ 신뢰도: ████████░░ 충분                           │ │
│  └──────────────────────────────────────────────────┘ │
│                                                       │
│  ┌── 종합 요약 카드 ─────────────────────────────────┐│
│  │ 승률 65% (13승 3무 4패)   │ 역대 최고: 챔피언스    ││
│  │ ████████████████░░░░░░░░  │                       ││
│  └───────────────────────────────────────────────────┘│
│                                                       │
│  ┌── 4개 탭 ─────────────────────────────────────────┐│
│  │ [슈팅] [패스] [수비] [선수]                         ││
│  └───────────────────────────────────────────────────┘│
│                                                       │
│  ── 슈팅 탭 선택 시 ──────────────────────────────── │
│  ┌─────────────┐  ┌──────────────────────────────┐   │
│  │  슈팅 히트맵  │  │  지표            내 값  백분위  │   │
│  │  (x,y 좌표   │  │  유효슈팅률      62.3%  상위18% │   │
│  │   기반 피치   │  │  골전환율        28.1%  상위25% │   │
│  │   시각화)     │  │  박스내 슈팅비율  41.2%  상위35% │   │
│  │              │  │  헤딩골 비율      15.0%  하위42% │   │
│  └─────────────┘  └──────────────────────────────┘   │
│                                                       │
│  ┌── 액션 제안 ──────────────────────────────────────┐│
│  │ 💡 박스 밖 중거리 비중이 높고 유효슛률이 낮습니다.   ││
│  │    박스 안 침투 빈도를 높이면 골전환율 개선 가능.    ││
│  │    근거: 박스밖 슈팅 58.8% (상위권 평균 35%)        ││
│  └───────────────────────────────────────────────────┘│
│                                                       │
│  ┌── 최근 매치 리스트 ───────────────────────────────┐│
│  │ 4/01 공식 2:1 승  점유54%  슈팅5(3)  패스87%      ││
│  │ 3/31 공식 0:3 패  점유38%  슈팅2(1)  패스72%      ││
│  │ ...                                               ││
│  └───────────────────────────────────────────────────┘│
│                                                       │
│  [🔄 랭커와 비교하기] [📈 변화 추적 보기]              │
└──────────────────────────────────────────────────────┘
```

### 1-4. 나 vs 랭커 비교 (`/player/[nickname]/compare`)

```
┌──────────────────────────────────────────────────────┐
│  [닉네임] vs TOP 10,000 랭커                          │
│                                                       │
│  ── 포지션별 선수 비교 ──────────────────────────────  │
│                                                       │
│  ST: 메시 (TOTY)                                      │
│  ┌───────────────────────────────────────────────────┐│
│  │         레이더 차트                                 ││
│  │     슈팅                                           ││
│  │    /    \          ── 나 (실선)                     ││
│  │  패스 ── 드리블     ── 랭커 평균 (점선)              ││
│  │    \    /                                          ││
│  │     수비                                           ││
│  └───────────────────────────────────────────────────┘│
│                                                       │
│  │ 지표         │ 나     │ 랭커평균 │ 차이   │ 판정   ││
│  │ 경기당 골    │ 0.8    │ 1.2     │ -0.4  │ ⚠ 부족 ││
│  │ 유효슈팅률   │ 55%    │ 68%     │ -13%p │ ⚠ 부족 ││
│  │ 패스성공률   │ 89%    │ 85%     │ +4%p  │ ✅ 양호 ││
│  │ 경기당 어시  │ 0.6    │ 0.4     │ +0.2  │ ✅ 우수 ││
│                                                       │
│  💡 이 선수의 랭커 대비 가장 큰 차이:                    │
│     유효슈팅률 -13%p → 슈팅 타이밍/위치 개선 필요        │
└──────────────────────────────────────────────────────┘
```

### 1-5. 변화 추적 (`/player/[nickname]/trend`)

```
┌──────────────────────────────────────────────────────┐
│  [닉네임] 성장 트래커                                  │
│                                                       │
│  기간: [1주] [2주] [1개월] [3개월]                     │
│                                                       │
│  ── 승률 트렌드 ─────────────────────────────────────  │
│  80% │         *                                      │
│  60% │    * *     *  ← 가중이동평균                    │
│  40% │  *              *                              │
│  20% │                                                │
│       3/1   3/8  3/15  3/22  3/29  4/5               │
│                                                       │
│  ── 핵심 지표 변화 ──────────────────────────────────  │
│  │ 지표        │ 이전 기간 │ 현재 기간 │ 변화    │     │
│  │ 유효슈팅률  │ 52%       │ 62%       │ +10%p ↑│     │
│  │ 패스성공률  │ 84%       │ 87%       │ +3%p ↑ │     │
│  │ 점유율      │ 51%       │ 48%       │ -3%p ↓ │     │
│                                                       │
│  📊 분석: 슈팅 효율이 크게 개선되었으나                   │
│     점유율은 소폭 하락. 역습형 플레이로 전환 추세.        │
└──────────────────────────────────────────────────────┘
```

### 1-6. 메타 대시보드 (`/meta`)

```
┌──────────────────────────────────────────────────────┐
│  FC Online 메타 리포트                                 │
│                                                       │
│  [랭커 메타 (TOP 10K)] | [일반 유저 메타]  ← 두 층 분리 │
│                                                       │
│  ── 포지션별 인기 선수 TOP 5 ────────────────────────  │
│  ST: 1.메시(TOTY) 2.호날두(ICON) 3.음바페 ...          │
│  CAM: 1.지단(ICON) 2.데브라위너 ...                    │
│  CB: ...                                              │
│                                                       │
│  ── 포메이션 분포 ───────────────────────────────────  │
│  4-2-3-1  ████████████  42%                           │
│  4-3-3    ████████      31%                           │
│  4-4-2    ████          15%                           │
│  기타     ███           12%                           │
│                                                       │
│  ── 선수 클릭 시 → /meta/players?spId=xxx ──────────  │
│  해당 선수의 랭커 평균 스탯, 포지션별 사용 비율 등       │
└──────────────────────────────────────────────────────┘
```

---

## 2. 통계 분석 로직 상세 설계

### 2-1. 핵심 분석 지표 (Phase 1 MVP)

| 카테고리 | 지표 | 공식 | 데이터 소스 |
|---------|------|------|-----------|
| **슈팅** | 유효슈팅률 | effectiveShootTotal / shootTotal × 100 | match_user_stats |
| | 골전환율 | goalTotal / shootTotal × 100 | match_user_stats |
| | 박스 내 슈팅 비율 | shootInPenalty / shootTotal × 100 | match_user_stats |
| | 헤딩골 비율 | goalHeading / goalTotal × 100 | match_user_stats |
| **패스** | 전체 패스 성공률 | passSuccess / passTry × 100 | match_user_stats |
| | 숏패스 성공률 | shortPassSuccess / shortPassTry × 100 | match_user_stats |
| | 롱패스 성공률 | longPassSuccess / longPassTry × 100 | match_user_stats |
| | 스루패스 성공률 | throughPassSuccess / throughPassTry × 100 | match_user_stats |
| | 패스 유형 비율 | short:long:through:lob 비율 | match_user_stats |
| **수비** | 태클 성공률 | tackleSuccess / tackleTry × 100 | match_user_stats |
| | 블록 성공률 | blockSuccess / blockTry × 100 | match_user_stats |
| **종합** | 승률 | wins / totalMatches × 100 | 집계 |
| | 경기당 평균 골 | totalGoals / totalMatches | 집계 |
| | 경기당 평균 점유율 | avg(possession) | 집계 |
| | 경기당 평균 평점 | avg(averageRating) | 집계 |

### 2-2. 통계 함수 설계

```typescript
// 핵심 통계 유틸 (src/lib/stats.ts)

/** 백분위 계산 - 전체 유저 분포 내 위치 */
percentile(value: number, distribution: number[]): number

/** 가중 이동평균 - 최근 경기에 높은 가중치 */
weightedMovingAverage(values: number[], window: number): number[]

/** 신뢰구간 계산 (Wilson Score for 비율) */
wilsonConfidenceInterval(successes: number, total: number, z?: number): { lower: number, upper: number }

/** z-score 기반 이상치 탐지 */
isOutlier(value: number, mean: number, stddev: number, threshold?: number): boolean

/** 효과 크기 (Cohen's d) - 두 그룹 비교 */
cohensD(group1: number[], group2: number[]): number

/** 상관계수 (Pearson) */
pearsonCorrelation(x: number[], y: number[]): number

/** 표본 크기 기반 신뢰도 등급 */
reliabilityGrade(n: number): 'insufficient' | 'limited' | 'sufficient'
// n < 5 → insufficient, 5 ≤ n < 15 → limited, n ≥ 15 → sufficient
```

### 2-3. 액션 제안 규칙 엔진

규칙 기반 (LLM 의존 X). 통계 임계값 → 제안 매핑.

```typescript
interface ActionRule {
  id: string;
  condition: (stats: UserStats) => boolean;
  suggestion: string;
  evidence: (stats: UserStats) => string;  // 근거 문장 생성
  priority: 'high' | 'medium' | 'low';
}

// 예시 규칙
const rules: ActionRule[] = [
  {
    id: 'low-inbox-shooting',
    condition: (s) => s.shootInPenaltyRate < 0.35 && s.goalConversionRate < 0.25,
    suggestion: '박스 안 침투 빈도를 높이세요',
    evidence: (s) => `박스 내 슈팅 비율 ${(s.shootInPenaltyRate*100).toFixed(1)}% (상위권 평균 41%)`,
    priority: 'high'
  },
  {
    id: 'low-pass-accuracy',
    condition: (s) => s.passSuccessRate < 0.75,
    suggestion: '안전한 숏패스 비중을 높이세요',
    evidence: (s) => `패스 성공률 ${(s.passSuccessRate*100).toFixed(1)}% (하위 ${s.passPercentile}%)`,
    priority: 'medium'
  },
  // ... 15-20개 규칙
];
```

---

## 3. 데이터 수집 전략

### 3-1. Rate Limit 관리

| 단계 | 초당 | 일일 | 전략 |
|------|-----|------|------|
| 개발 | 5 | 1,000 | 매치 20개 수집 = ~21 API 호출 (1 ouid + 20 match-detail). 일일 ~47유저 |
| 서비스 | 500 | 20M | 여유. 캐시 히트율 높이면 더 효율적 |

### 3-2. 데이터 수집 흐름

```
유저 검색 시:
1. DB 캐시 확인 → 있으면 DB에서 반환
2. 없으면:
   a. GET /fconline/v1/id (1 call)
   b. GET /fconline/v1/user/basic (1 call)
   c. GET /fconline/v1/user/maxdivision (1 call)
   d. GET /fconline/v1/user/match?limit=20 (1 call)
   e. 각 matchId → GET /fconline/v1/match-detail (최대 20 calls)
   = 총 최대 24 API 호출 / 유저

3. 이미 캐시된 matchId는 스킵 → 실제 호출 수 감소
4. DB에 저장 (expires_at = now + 30일)
```

### 3-3. 메타데이터 동기화

```
Daily Cron (새벽 4시):
- matchtype.json → meta_match_types (UPSERT)
- spid.json → meta_players (UPSERT, ~5만 건)
- seasonid.json → meta_seasons (UPSERT)
- spposition.json → meta_positions (UPSERT)
- division.json → meta_divisions (UPSERT)
```

### 3-4. 랭커 데이터 수집

```
Hourly Cron:
- 인기 선수 TOP 100 (DB 집계 기반)
- 각 선수 → GET /fconline/v1/ranker-stats
- = 100 API 호출/시간
- ranker_stats 테이블 UPSERT
```

---

## 4. 유저 플로우

```
[첫 방문]
   │
   ▼
[홈: 닉네임 검색] ─────────────────────────────────────┐
   │                                                     │
   ▼                                                     │
[유저 대시보드] ← 핵심 전환 포인트                         │
   │  • 종합 승률/스탯                                    │
   │  • 슈팅/패스/수비 탭 분석                             │
   │  • 액션 제안                                         │
   │  • 최근 매치 리스트                                   │
   │                                                     │
   ├──→ [매치 상세] ── 개별 경기 심층 분석                  │
   │                                                     │
   ├──→ [나 vs 랭커] ── 포지션별 선수 비교                 │
   │     "내가 뭘 바꾸면 되는지" 직접 확인                   │
   │                                                     │
   ├──→ [변화 추적] ── 주간/월간 트렌드                    │
   │     "지난주보다 나아졌는지" 확인                       │
   │     → 재방문 동기                                    │
   │                                                     │
   └──→ [메타 대시보드] ── 현재 메타 확인                  │
         │                                               │
         └─── 다른 유저 검색 ────────────────────────────┘

★ 핵심 루프: 검색 → 분석 → 비교 → 제안 → (다음 주) 변화 확인 → 재검색
```

---

## 5. MVP 범위 (Phase 1) 확정

### 포함
- [ ] 닉네임 검색 → 유저 대시보드
- [ ] 슈팅/패스/수비 탭별 분석 (백분위 포함)
- [ ] 슈팅 히트맵 (x,y 좌표 시각화)
- [ ] 최근 매치 리스트 + 매치 상세
- [ ] 신뢰도 배지 (표본 수, 기간, 갱신 시각)
- [ ] 액션 제안 (규칙 기반 5-10개)
- [ ] 메타데이터 동기화

### 미포함 (Phase 2+)
- 나 vs 랭커 비교 (Phase 2)
- 변화 추적/트렌드 (Phase 3)
- 메타 대시보드 (Phase 4)
- 상대 공략 (Phase 5)
- 선수 추천 엔진

---

## 6. 기술 스택 확정

| 영역 | 선택 | 비고 |
|------|------|------|
| Framework | Next.js 15 (App Router) | RSC + Server Actions |
| DB | Supabase PostgreSQL | MCP 연동 |
| Auth | 없음 (MVP) | 공개 서비스 |
| Styling | Tailwind + shadcn/ui + impeccable.style | |
| Validation | Zod | API 응답 런타임 검증 |
| Charts | Recharts or Nivo | 통계 차트 |
| Heatmap | 커스텀 Canvas/SVG | 슈팅 위치 시각화 |
| Testing | Vitest + Playwright | 통계 함수 TDD |
| Deploy | Vercel | |
| Spec | spec-kit v0.4.4 | 스펙 주도 개발 |

---

## 7. 기존 완성 산출물

| 파일 | 내용 | 상태 |
|------|------|------|
| `docs/nexon-openapi.md` | API 명세 (Playwright 스크래핑 기반) | ✅ |
| `docs/market-analysis.md` | 시장분석 + 포지셔닝 + MVP 로드맵 | ✅ |
| `docs/project-overview.md` | 프로젝트 개요 | ✅ |
| `specs/001-core-schemas/spec.md` | Core Schemas 기능 명세 | ✅ |
| `specs/001-core-schemas/contracts/nexon-api.types.ts` | Zod 스키마 전체 | ✅ |
| `specs/001-core-schemas/contracts/db-schema.sql` | DB DDL + RLS | ✅ |
| `specs/001-core-schemas/data-model.md` | ER 다이어그램 + 쿼리 패턴 | ✅ |
| `.specify/memory/constitution.md` | 프로젝트 원칙 | ✅ |
| `.mcp.json` | Supabase MCP 설정 | ✅ (재시작 필요) |

## 8. 화면 디자인 상세 — 컴포넌트 명세

### 8-1. 공통 컴포넌트

#### `<TrustBadge />`
모든 분석 섹션 상단에 표시. Constitution "Trust UX" 원칙의 구현체.

```
Props:
  sampleSize: number       — 분석 대상 경기 수
  dateRange: [Date, Date]  — 분석 기간
  lastUpdated: Date        — 마지막 갱신 시각
  matchType: string        — "공식경기" 등

표시 규칙:
  n < 5   → 빨간 배경  "⚠ 데이터 부족 — 참고용"
  5 ≤ n < 15 → 노란 배경  "△ 제한적 — 추세 참고 가능"
  n ≥ 15  → 초록 배경  "✅ 충분 — 통계적 유의미"

렌더링:
┌─────────────────────────────────────────────────┐
│ 📊 20경기 · 공식경기 · 3/15~4/01 · 갱신 4/02 13:00 │
│ ██████████░░ 충분                                │
└─────────────────────────────────────────────────┘
```

#### `<PercentileGauge />`
유저 지표를 전체 분포 내 위치로 표시.

```
Props:
  label: string        — "유효슈팅률"
  value: number        — 62.3
  unit: string         — "%"
  percentile: number   — 82 (상위 18%)
  benchmark?: number   — 랭커 평균 (있으면 마커 표시)

렌더링:
유효슈팅률  62.3%
하위 ░░░░░░░░████░░ 상위    ← 82번째 백분위 (상위 18%)
                  ▲ 랭커 평균 68%
```

#### `<StatCard />`
지표 하나를 카드로 표시.

```
Props:
  title: string
  value: string | number
  subtitle?: string      — "경기당 평균" 등
  trend?: 'up' | 'down' | 'flat'  — 이전 기간 대비
  percentile?: number

렌더링:
┌─────────────────┐
│ 유효슈팅률       │
│  62.3%    ↑     │
│ 상위 18%        │
└─────────────────┘
```

#### `<RadarChart />`
나 vs 랭커 비교용 레이더 차트.

```
Props:
  labels: string[]       — ["슈팅", "패스", "드리블", "수비", "점유"]
  myData: number[]       — 0-100 정규화된 값
  rankerData: number[]   — 0-100 정규화된 값
  showDiff: boolean      — 차이 하이라이트 여부
```

### 8-2. 슈팅 히트맵 (`<ShootingHeatmap />`)

FC 온라인의 x, y 좌표(0~1 범위)를 실제 축구 피치 위에 시각화.

```
Props:
  shots: { x: number, y: number, result: 'goal' | 'effective' | 'miss', type: number }[]
  width?: number
  height?: number

시각 요소:
  • 피치 그리기: 하프라인, 페널티박스, 골대 (SVG)
  • 좌표 변환: x(0→1) = 왼쪽→오른쪽, y(0→1) = 위→아래
  • 마커: 골 = 🔴 큰 원, 유효 = 🟡 중간 원, 빗나감 = ⚪ 작은 원
  • 밀도: 같은 영역 슈팅 많으면 히트맵 오버레이 (canvas)

존 분석 (피치를 6구역으로 분할):
┌────────┬────────┬────────┐
│ 좌측박스 │ 중앙박스 │ 우측박스 │  ← 박스 안 (y: 0~0.17, 0.83~1.0 근처)
├────────┼────────┼────────┤
│ 좌측밖  │ 중앙밖  │ 우측밖  │  ← 박스 밖
└────────┴────────┴────────┘

각 존별 슈팅 수, 유효슈팅률, 골전환율 표시
```

### 8-3. 유저 대시보드 탭 상세

#### 슈팅 탭
```
┌─ 슈팅 히트맵 (좌) ─────────┐ ┌─ 슈팅 지표 (우) ────────────┐
│                             │ │ 유효슈팅률  62.3%  상위18%   │
│   [ShootingHeatmap]         │ │ 골전환율    28.1%  상위25%   │
│   좌표 기반 피치 시각화       │ │ 박스내 비율  41.2%  상위35%  │
│                             │ │ 헤딩골 비율  15.0%  하위42%  │
│                             │ │ PK 성공률   80.0%  상위22%  │
└─────────────────────────────┘ └──────────────────────────────┘
┌─ 존별 분석 ──────────────────────────────────────────────────┐
│ 중앙박스: 12슈팅 8유효 5골 (전환율 41.7%)                      │
│ 좌측박스: 4슈팅 2유효 1골 (전환율 25.0%)                       │
│ 박스밖:   8슈팅 3유효 0골 (전환율 0%) ← ⚠ 개선 필요            │
└──────────────────────────────────────────────────────────────┘
```

#### 패스 탭
```
┌─ 패스 유형 분포 (도넛) ─────┐ ┌─ 패스 지표 ─────────────────┐
│                             │ │ 전체 성공률  87.2%  상위12%  │
│  숏패스 55%                 │ │ 숏패스      92.1%  상위8%   │
│  스루패스 19%               │ │ 롱패스      41.3%  하위38%  │
│  그라운더 10%               │ │ 스루패스    73.7%  상위20%  │
│  롱패스 3%                  │ │ 로빙스루    25.0%  하위55%  │
│  기타 13%                   │ │                            │
└─────────────────────────────┘ └────────────────────────────┘
┌─ 빌드업 성향 분석 ────────────────────────────────────────────┐
│ 숏패스 중심(55%) + 높은 성공률(92%) → 짧은 패스 빌드업형        │
│ 롱패스 성공률 41.3%로 낮음 → 롱볼 전환 시 실패 리스크 높음      │
└──────────────────────────────────────────────────────────────┘
```

#### 수비 탭
```
┌─ 수비 지표 ─────────────────┐ ┌─ 실점 시간대 히스토그램 ─────┐
│ 태클 성공률  81.8%  상위15% │ │ ■         ■                 │
│ 블록 성공률  33.3%  하위48% │ │ ■    ■    ■  ■              │
│ 경기당 파울  1.8    상위30% │ │ ■  ■ ■  ■ ■  ■  ■           │
│ 경기당 옐로  0.3    상위25% │ │ 0  15 30 45 60 75 90 (분)   │
│ 경기당 레드  0.0    -      │ │                              │
└─────────────────────────────┘ └──────────────────────────────┘
```

#### 선수 탭
```
┌─ 주요 사용 선수 TOP 10 ──────────────────────────────────────┐
│ # │ 선수           │ 포지션 │ 출전 │ 골  │ 어시 │ 평점  │ 비교│
│ 1 │ 메시(TOTY)     │ ST    │ 18  │ 1.2 │ 0.6 │ 7.2  │ [→] │
│ 2 │ 호날두(ICON)   │ ST    │ 15  │ 0.9 │ 0.3 │ 6.8  │ [→] │
│ 3 │ 지단(ICON)     │ CAM   │ 20  │ 0.3 │ 0.8 │ 7.5  │ [→] │
│ ...                                                          │
│ [→] 클릭 시 해당 선수의 랭커 평균과 비교 패널 열림              │
└──────────────────────────────────────────────────────────────┘
```

---

## 9. 통계 로직 상세 설계

### 9-1. 백분위 계산 방식

```typescript
/**
 * 백분위 산출 방법
 * 
 * 문제: 유저가 처음 검색할 때는 다른 유저의 분포 데이터가 부족
 * 해결: 3단계 접근
 * 
 * Phase 1 (MVP): 해당 유저의 DB 내 저장된 모든 유저 대비 백분위
 *   - 초기엔 표본 부족 → "표본 N명 기준" 표기 필수
 *   - 유저가 누적될수록 정확도 상승
 * 
 * Phase 2: 등급대별 백분위
 *   - 같은 division 유저끼리만 비교 (슈퍼챔 vs 슈퍼챔)
 *   - division 간 비교는 의미 없으므로
 * 
 * Phase 3: 모집단 추정
 *   - 충분한 데이터 축적 후, 정규분포 가정 하에
 *   - 모평균/모표준편차 추정 → 이론적 백분위 계산
 */

function calculatePercentile(
  value: number, 
  distribution: number[]
): { percentile: number; rank: string; sampleSize: number } {
  const sorted = [...distribution].sort((a, b) => a - b);
  const below = sorted.filter(v => v < value).length;
  const percentile = (below / sorted.length) * 100;
  
  return {
    percentile: Math.round(percentile * 10) / 10,
    rank: percentile >= 50 ? `상위 ${Math.round(100 - percentile)}%` : `하위 ${Math.round(percentile)}%`,
    sampleSize: sorted.length
  };
}
```

### 9-2. 가중 이동평균 (WMA)

```typescript
/**
 * 최근 경기에 높은 가중치를 부여하여 "현재 폼" 반영
 * 
 * 가중치: 최근 경기부터 [n, n-1, ..., 2, 1]
 * 
 * 예: 최근 5경기 승률 가중이동평균
 *   경기: [승, 패, 승, 승, 패] (최신→과거)
 *   값:  [1,  0,  1,  1,  0]
 *   가중치: [5, 4, 3, 2, 1]
 *   WMA = (1×5 + 0×4 + 1×3 + 1×2 + 0×1) / (5+4+3+2+1) = 10/15 = 66.7%
 *   단순평균 = 60%
 *   → WMA가 최근 승리를 더 반영
 */
function weightedMovingAverage(values: number[], window: number): number[] {
  const result: number[] = [];
  for (let i = 0; i <= values.length - window; i++) {
    const slice = values.slice(i, i + window);
    let weightedSum = 0;
    let weightTotal = 0;
    for (let j = 0; j < slice.length; j++) {
      const weight = slice.length - j; // 최신이 가중치 높음
      weightedSum += slice[j] * weight;
      weightTotal += weight;
    }
    result.push(weightedSum / weightTotal);
  }
  return result;
}
```

### 9-3. Wilson Score Confidence Interval

```typescript
/**
 * 비율 데이터의 신뢰구간 (승률, 성공률 등)
 * 
 * 일반 신뢰구간 (p ± z√(p(1-p)/n))은 표본이 작을 때 부정확.
 * Wilson Score가 소표본에서 더 정확함.
 * 
 * 사용 예: "승률 65% (95% CI: 42%~83%)" → 표본 20경기
 *          "승률 65% (95% CI: 60%~70%)" → 표본 200경기
 *          → 표본 클수록 구간 좁아짐 = 더 확실한 추정
 */
function wilsonScore(
  successes: number, 
  total: number, 
  z: number = 1.96  // 95% 신뢰수준
): { lower: number; upper: number; center: number } {
  if (total === 0) return { lower: 0, upper: 0, center: 0 };
  
  const p = successes / total;
  const denominator = 1 + z * z / total;
  const center = (p + z * z / (2 * total)) / denominator;
  const margin = (z * Math.sqrt((p * (1 - p) + z * z / (4 * total)) / total)) / denominator;
  
  return {
    lower: Math.max(0, center - margin),
    upper: Math.min(1, center + margin),
    center
  };
}
```

### 9-4. 이상치 탐지

```typescript
/**
 * z-score 기반 이상 경기 자동 감지
 * 
 * "이 경기는 평소와 매우 다릅니다" 플래그
 * 
 * 예: 평소 점유율 평균 52%, 표준편차 6%
 *     어떤 경기 점유율 25% → z-score = (25-52)/6 = -4.5 → 이상치!
 *     
 * threshold = 2.0 기본값 (약 95% 밖)
 */
function detectOutliers(
  matchStats: MatchStat[],
  metric: keyof MatchStat,
  threshold: number = 2.0
): { matchId: string; value: number; zScore: number }[] {
  const values = matchStats.map(m => m[metric] as number);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const stddev = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length);
  
  if (stddev === 0) return [];
  
  return matchStats
    .map(m => ({
      matchId: m.matchId,
      value: m[metric] as number,
      zScore: ((m[metric] as number) - mean) / stddev
    }))
    .filter(r => Math.abs(r.zScore) > threshold);
}
```

### 9-5. 액션 제안 규칙 상세 (15개)

| # | ID | 조건 | 제안 | 근거 형식 | 우선도 |
|---|-----|------|------|----------|--------|
| 1 | `low-inbox-shooting` | 박스내 비율 < 35% AND 골전환율 < 25% | 박스 안 침투 빈도 높이기 | "박스내 {v}% (상위권 41%)" | high |
| 2 | `excessive-longshot` | 박스밖 슈팅 > 50% AND 박스밖 골전환 < 5% | 중거리 슈팅 줄이기 | "박스밖 {v}개 중 골 {g}개" | high |
| 3 | `low-effective-shoot` | 유효슈팅률 < 40% | 슈팅 타이밍/각도 개선 | "유효슈팅률 {v}% (하위 {p}%)" | high |
| 4 | `low-pass-accuracy` | 패스성공률 < 75% | 안전한 숏패스 비중 높이기 | "패스 성공률 {v}% (하위 {p}%)" | medium |
| 5 | `risky-through-pass` | 스루패스 성공률 < 50% AND 스루패스 비율 > 20% | 스루패스 타이밍 신중하게 | "스루패스 {v}% 성공, 비중 {r}%" | medium |
| 6 | `weak-longpass` | 롱패스 성공률 < 40% | 롱패스 연습 또는 숏패스 전환 | "롱패스 성공률 {v}%" | low |
| 7 | `low-tackle-rate` | 태클 성공률 < 60% | 태클 타이밍 보수적으로 | "태클 성공률 {v}% (하위 {p}%)" | medium |
| 8 | `high-foul` | 경기당 파울 > 3 | 수비 접근 방식 변경 | "경기당 {v}회 파울 (상위 {p}%)" | medium |
| 9 | `card-heavy` | 경기당 옐로 > 1 | 거친 태클 자제 | "경기당 옐로 {v}장" | high |
| 10 | `late-concede` | 75분 이후 실점 비율 > 40% | 후반 수비 집중도 개선 | "75분+ 실점 {v}% (전체 실점 대비)" | high |
| 11 | `low-possession` | 점유율 < 40% AND 승률 < 50% | 볼 소유 시간 늘리기 | "점유율 {v}% + 승률 {w}%" | medium |
| 12 | `possession-no-result` | 점유율 > 60% AND 승률 < 45% | 점유 대비 결정력 부족 | "높은 점유({v}%) 대비 승률 {w}%" | high |
| 13 | `one-man-team` | 한 선수 골 비중 > 60% | 득점원 다변화 | "{name}에 골 {v}% 의존" | medium |
| 14 | `aerial-weakness` | 공중볼 성공률 < 30% | 공중전 대비 전술 조정 | "공중볼 {v}% 성공 (하위 {p}%)" | low |
| 15 | `rating-inconsistency` | 평점 표준편차 > 2.0 | 안정적 플레이 추구 | "평점 편차 {v} (변동 심함)" | medium |

### 9-6. 플레이 스타일 분류

```typescript
/**
 * 유저의 경기 스탯을 기반으로 플레이 스타일 자동 분류
 * 
 * 5가지 축에 대해 0-100 점수 부여:
 */
interface PlayStyle {
  possession: number;    // 점유형 (높은 점유율 + 패스 시도 많음)
  counter: number;       // 역습형 (낮은 점유 + 높은 슈팅 효율)
  pressing: number;      // 프레싱형 (높은 태클 시도 + 인터셉트)
  shooting: number;      // 슈팅형 (슈팅 시도 많음 + 다양한 위치)
  buildup: number;       // 빌드업형 (숏패스 비중 높음 + 높은 성공률)
}

// 분류 기준 (각 축 독립 계산)
// possession: avg_possession × 0.6 + (passTry/game 백분위) × 0.4
// counter: (100 - avg_possession) × 0.4 + effectiveShootRate × 0.6
// pressing: (tackleTry/game 백분위) × 0.5 + (intercept/game 백분위) × 0.5
// shooting: (shootTotal/game 백분위) × 0.5 + (shootZoneDiversity) × 0.5
// buildup: (shortPassRate) × 0.4 + (shortPassSuccess) × 0.6

// 렌더링: 5축 레이더 차트 + 가장 높은 축을 메인 스타일로 표시
// "당신은 빌드업형 플레이어입니다 (점수: 78/100)"
```

---

## 10. 다음 단계 (기획 후 구현)

1. Supabase MCP 연결 확인 + 기존 테이블 정리 + 새 스키마 적용
2. Next.js 프로젝트 초기화 (`create-next-app`)
3. `src/lib/stats.ts` 통계 함수 TDD (9-1 ~ 9-4)
4. `src/lib/action-rules.ts` 액션 제안 규칙 엔진 (9-5)
5. `src/lib/play-style.ts` 플레이 스타일 분류 (9-6)
6. Nexon API 클라이언트 + Zod 파싱
7. 컴포넌트: TrustBadge, PercentileGauge, StatCard, RadarChart, ShootingHeatmap
8. 유저 대시보드 페이지 (`/player/[nickname]`)
9. 매치 리스트 + 매치 상세 페이지
