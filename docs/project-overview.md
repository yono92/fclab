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

## Supabase 활용 (구현 완료)

### 테이블 (fclab 스키마)
- `users` - 검색된 유저 정보 (ouid, nickname, level)
- `user_max_divisions` - 유저별 역대 최고 등급
- `matches` - 매치 메타데이터 (match_id, date, type, expires_at)
- `match_user_stats` - 매치별 유저 상세 스탯 (50+ 컬럼)
- `match_shoot_details` - 개별 슈팅 데이터 (x, y, result, time)
- `match_player_stats` - 매치별 선수 스탯
- `ranker_stats` - 랭커 선수 평균 스탯
- `meta_match_types`, `meta_players` (~5만건), `meta_seasons`, `meta_positions`, `meta_divisions`

### 뷰
- `v_user_recent_stats` - 유저별 종합 집계 뷰

### API Routes (Next.js)
- `/api/nexon/[...path]` - Nexon API 프록시 (API Key 보호)
- `/api/cron/sync-meta` - 메타데이터 동기화 (Bearer 토큰 인증)

### RLS (Row Level Security)
- 모든 테이블: 공개 읽기 (anon + authenticated)
- 쓰기: service_role 전용

## 디자인 테마

터미널/사이버펑크 컨셉:
- **컬러**: 다크 배경 (oklch 0.11) + 프라이머리 사이버 그린 (#00D68F)
- **폰트**: Geist Mono (코드/데이터), Geist Sans (본문)
- **UI 요소**: 대시 보더 + ASCII 코너 마커, 터미널 프리픽스 ($, >, ✓, !)
- **이펙트**: 매트릭스 코드 레인, CRT 스캔라인, 글로우, float 애니메이션
- **로딩**: 통일된 터미널 프로그레스 UI (TerminalLoading 컴포넌트)
