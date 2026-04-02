# FCLab 프로젝트 개요

## 프로젝트 목적
FC Online 유저를 위한 전적 검색 및 메타 분석 플랫폼

## 핵심 기능

### 1. 전적 검색
- 닉네임으로 유저 검색
- 최근 매치 기록 조회 (공식경기, 감독모드 등)
- 매치별 상세 스탯 (슈팅, 패스, 점유율, 수비 등)
- 승률/골/어시스트 등 종합 통계

### 2. 메타 분석
- 랭커들이 많이 사용하는 선수 순위
- 포지션별 인기 선수 & 평균 스탯
- 랭커 선수 사용률 트렌드

### 3. 개인 플레이 분석
- 나의 플레이 스타일 분석 (패스형/드리블형/슈팅형)
- 포지션별 선수 활용도
- 시간대별 승률 변화
- 강점/약점 리포트

### 4. 랭커 분석
- 랭커 선수 스탯 vs 내 선수 스탯 비교
- 랭커 포메이션/전술 트렌드

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js (App Router) |
| Backend/DB | Supabase (PostgreSQL, Auth, Edge Functions) |
| Styling | Tailwind CSS + shadcn/ui |
| API | Nexon FC Online OpenAPI |
| 배포 | Vercel |
| 테스트 | Vitest + Playwright |

## 데이터 흐름

```
[유저 검색] → [Nexon API: OUID 조회]
           → [Nexon API: 매치 기록 조회]
           → [Nexon API: 매치 상세 조회]
           → [Supabase에 캐싱/저장]
           → [분석 & 시각화]

[메타데이터] → [Nexon Static JSON 주기적 동기화]
            → [Supabase 저장]

[랭커 분석] → [Nexon API: 랭커 스탯 조회]
           → [Supabase 저장 & 집계]
```

## Supabase 활용 계획

### 테이블 (예상)
- `users` - 검색된 유저 정보 캐시
- `matches` - 매치 상세 데이터 캐시
- `match_stats` - 집계된 매치 통계
- `ranker_meta` - 랭커 선수 사용 데이터
- `metadata_players` - 선수 메타데이터
- `metadata_seasons` - 시즌 메타데이터

### Edge Functions
- Nexon API 프록시 (API Key 보호)
- 데이터 동기화 크론잡

### RLS (Row Level Security)
- 공개 데이터: 누구나 읽기 가능
- 관리 데이터: 관리자만 쓰기 가능
