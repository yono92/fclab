# 데이터 시각화 라이브러리 선정

## 후보 비교

| | Recharts | Nivo | Victory | Tremor | shadcn/charts |
|---|---|---|---|---|---|
| **기반** | D3 + React SVG | D3 + React | D3 + React | Recharts 래핑 | Recharts 래핑 |
| **번들** | ~200KB | ~400KB (전체) | ~300KB | ~150KB | 최소 |
| **RSC 호환** | ❌ (client) | ❌ (client) | ❌ (client) | ✅ 일부 | ✅ |
| **커스텀** | 높음 | 매우 높음 | 높음 | 낮음 | 중간 |
| **학습곡선** | 낮음 | 중간 | 중간 | 매우 낮음 | 매우 낮음 |
| **차트 종류** | 기본 충분 | 가장 많음 | 기본 충분 | 대시보드 특화 | 기본 |
| **레이더** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **히트맵** | ❌ (커스텀) | ✅ 내장 | ❌ | ❌ | ❌ |
| **다크테마** | 수동 | 내장 | 수동 | 내장 | Tailwind 연동 |
| **TypeScript** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **인기도** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **유지보수** | 활발 | 활발 | 보통 | 활발 | shadcn 따름 |

## FCLab에서 필요한 차트

| 차트 | 용도 | 필수도 |
|------|------|--------|
| **도넛/파이** | 승률, 패스 유형 분포 | 필수 |
| **바 차트** | 실점 시간대 히스토그램, 존별 슈팅 | 필수 |
| **라인 차트** | 승률 트렌드, WMA | 필수 |
| **레이더** | 나 vs 랭커, 플레이 스타일 5축 | 필수 |
| **수평 바** | 백분위 게이지 | 필수 (Tailwind로 직접) |
| **히트맵** | 슈팅 위치 | 필수 (커스텀 SVG) |
| **게이지** | 신뢰도 표시 | 선택 (Tailwind로 직접) |

## 선정: Recharts + 커스텀 SVG

### 이유

1. **Recharts 선정 이유**
   - 도넛, 바, 라인, 레이더 모두 지원
   - 번들 사이즈 합리적 (~200KB)
   - 가장 큰 커뮤니티 → 문제 해결 쉬움
   - shadcn/ui와 자연스럽게 어울림
   - API가 직관적 → 빠른 개발

2. **Nivo 탈락 이유**
   - 번들 사이즈 과대 (히트맵만 필요한데 전체 가져와야)
   - 슈팅 히트맵은 어차피 축구 피치 커스텀 SVG 필요 → Nivo 히트맵 불필요

3. **커스텀 SVG가 필요한 것**
   - 슈팅 히트맵: 축구 피치 위 좌표 시각화 → 라이브러리에 없음
   - 백분위 게이지: 단순 수평 바 → Tailwind CSS로 충분
   - 신뢰도 바: 프로그레스 바 → Tailwind CSS로 충분

### 설치

```bash
npm install recharts
```

### 사용 패턴

```tsx
// 모든 차트 컴포넌트는 'use client'
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// 다크 테마 색상 팔레트
const COLORS = {
  win: '#22c55e',    // green-500
  draw: '#eab308',   // yellow-500
  loss: '#ef4444',   // red-500
  primary: '#3b82f6', // blue-500
  secondary: '#6b7280', // gray-500
  accent: '#8b5cf6',  // violet-500
};
```

## 차트별 구현 매핑

| 차트 | 라이브러리 | 컴포넌트 |
|------|----------|---------|
| 승률 도넛 | Recharts PieChart | `WinRateDonut.tsx` |
| 패스 분포 도넛 | Recharts PieChart | `PassDistribution.tsx` |
| 실점 시간대 | Recharts BarChart | `ConcededTimeHistogram.tsx` |
| 승률 트렌드 | Recharts LineChart | `WinRateTrend.tsx` |
| 나 vs 랭커 레이더 | Recharts RadarChart | `CompareRadar.tsx` |
| 플레이 스타일 레이더 | Recharts RadarChart | `PlayStyleRadar.tsx` |
| 슈팅 히트맵 | 커스텀 SVG | `ShootingHeatmap.tsx` |
| 백분위 게이지 | Tailwind CSS | `PercentileGauge.tsx` |
| 신뢰도 바 | Tailwind CSS | `TrustBadge.tsx` 내부 |
