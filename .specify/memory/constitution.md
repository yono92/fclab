# FCLab Constitution

## Core Principles

### I. Statistics-First (통계 우선)
모든 분석 기능은 통계적 근거를 기반으로 한다. AI 요약이 아닌, 정량적 지표(백분위, 신뢰구간, 분포, 효과 크기)로 설명한다. 표본 수가 부족하면 명시적으로 경고한다. 데이터 없이 판단을 제시하지 않는다.

### II. Spec-Driven Development (스펙 주도 개발)
기능 추가 전 반드시 스펙을 먼저 작성한다. API 타입, DB 스키마, 컴포넌트 인터페이스를 스펙으로 정의한 후 구현한다. 스펙과 구현의 정합성을 지속 검증한다.

### III. Trust UX (신뢰 UX)
모든 분석 결과에 표본 수, 분석 기간, 데이터 갱신 시각, 신뢰도 등급을 명시한다. 유저가 "이 데이터를 믿어도 되는지"를 항상 판단할 수 있게 한다. API 반영 지연(~2시간)을 투명하게 고지한다.

### IV. Type Safety
TypeScript strict mode를 사용한다. Nexon API 응답은 Zod 스키마로 런타임 검증한다. DB 스키마는 Supabase 타입 생성기로 동기화한다. `any` 타입을 금지한다.

### V. Test-First
핵심 통계 연산 함수는 반드시 테스트를 먼저 작성한다. Vitest로 단위 테스트, Playwright로 E2E 테스트. 통계 함수의 경계값(n=0, n=1, 극단값)을 반드시 커버한다.

## Technical Constraints

- **Framework**: Next.js 15 (App Router)
- **Backend/DB**: Supabase (PostgreSQL, Edge Functions, RLS)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui + impeccable.style
- **Validation**: Zod
- **Testing**: Vitest + Playwright
- **Deployment**: Vercel
- **External API**: Nexon FC Online OpenAPI (Rate Limit 주의)

## Development Workflow

1. 스펙 작성 (spec.md) → 리뷰
2. 타입/스키마 정의 (types, Zod, DB migration)
3. 테스트 작성 (통계 함수 우선)
4. 구현
5. E2E 검증

## Governance

Constitution은 모든 개발 판단의 최상위 기준이다. 원칙에 위배되는 PR은 머지하지 않는다. 수정 시 버전을 올리고 사유를 기록한다.

**Version**: 1.0.0 | **Ratified**: 2026-04-02 | **Last Amended**: 2026-04-02
