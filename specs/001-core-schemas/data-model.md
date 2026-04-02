# Data Model: FCLab Core Schemas

## Entity Relationship

```
┌──────────────────┐     ┌────────────────────┐     ┌──────────────────────┐
│   meta_players   │     │    meta_seasons     │     │  meta_match_types    │
│──────────────────│     │────────────────────│     │──────────────────────│
│ sp_id (PK)       │     │ season_id (PK)      │     │ matchtype (PK)       │
│ name             │     │ class_name          │     │ description          │
└──────────────────┘     │ season_img          │     └──────────┬───────────┘
        │                └────────────────────┘                 │
        │                                                       │
        │  ┌────────────────────┐    ┌─────────────────────┐   │
        │  │  meta_positions    │    │   meta_divisions     │   │
        │  │────────────────────│    │─────────────────────│   │
        │  │ sp_position (PK)   │    │ division_id (PK)     │   │
        │  │ description        │    │ division_name        │   │
        │  └────────────────────┘    │ is_volta             │   │
        │                            └─────────────────────┘   │
        │                                      │                │
        │                                      │                │
┌───────┴──────────┐                ┌──────────┴───────────┐   │
│      users       │                │ user_max_divisions    │   │
│──────────────────│◄───────────────│──────────────────────│   │
│ ouid (PK)        │    ouid FK     │ ouid (PK,FK)         │   │
│ nickname         │                │ match_type (PK,FK) ──────┘
│ level            │                │ division              │
│ fetched_at       │                │ achievement_date      │
└────────┬─────────┘                └──────────────────────┘
         │
         │ ouid
         │
┌────────┴─────────────────────────────────────────────────────┐
│                        matches                                │
│───────────────────────────────────────────────────────────────│
│ match_id (PK)                                                 │
│ match_date                                                    │
│ match_type                                                    │
│ fetched_at                                                    │
│ expires_at  ← 30일 갱신 의무 추적                               │
└────────┬─────────────────────────────────────────────────────┘
         │
         │ match_id
         │
┌────────┴─────────────────────────────────────────────────────┐
│                   match_user_stats                            │
│───────────────────────────────────────────────────────────────│
│ match_id (PK,FK)                                              │
│ ouid (PK)                                                     │
│ nickname, match_result, possession, average_rating...         │
│ shoot_total, effective_shoot_total, goal_total...             │
│ pass_try, pass_success, short_pass_try...                     │
│ block_try, block_success, tackle_try, tackle_success          │
└────────┬─────────────────────────┬───────────────────────────┘
         │                         │
         │ (match_id, ouid)        │ (match_id, ouid)
         │                         │
┌────────┴───────────────┐  ┌──────┴──────────────────┐
│  match_shoot_details   │  │  match_player_stats     │
│────────────────────────│  │─────────────────────────│
│ id (PK, auto)          │  │ id (PK, auto)           │
│ match_id (FK)          │  │ match_id (FK)           │
│ ouid (FK)              │  │ ouid (FK)               │
│ goal_time              │  │ sp_id ◄─── meta_players │
│ x, y ← 히트맵 좌표     │  │ sp_position             │
│ shoot_type, result     │  │ sp_grade                │
│ sp_id                  │  │ shoot, goal, assist...  │
│ assist, assist_sp_id   │  │ pass_try, pass_success  │
│ hit_post, in_penalty   │  │ sp_rating               │
└────────────────────────┘  └─────────────────────────┘


┌──────────────────────────────────────────────────────────────┐
│                      ranker_stats                             │
│───────────────────────────────────────────────────────────────│
│ id (PK, auto)                                                 │
│ match_type                                                    │
│ sp_id ◄─── meta_players                                      │
│ sp_position                                                   │
│ create_date                                                   │
│ shoot, goal, assist, pass_try... (20경기 평균, REAL 타입)       │
│ UNIQUE (match_type, sp_id, sp_position, create_date)          │
└──────────────────────────────────────────────────────────────┘
```

## 데이터 흐름

```
1. 유저 검색
   닉네임 → GET /fconline/v1/id → ouid
                                    → INSERT users

2. 매치 수집
   ouid → GET /fconline/v1/user/match → [matchId, ...]
   각 matchId → GET /fconline/v1/match-detail
                  → INSERT matches
                  → INSERT match_user_stats (양쪽 유저)
                  → INSERT match_shoot_details
                  → INSERT match_player_stats

3. 메타 동기화 (Cron, daily)
   GET /static/.../matchtype.json → UPSERT meta_match_types
   GET /static/.../spid.json      → UPSERT meta_players
   GET /static/.../seasonid.json  → UPSERT meta_seasons
   GET /static/.../spposition.json→ UPSERT meta_positions
   GET /static/.../division.json  → UPSERT meta_divisions

4. 랭커 수집 (Cron, hourly)
   인기 선수 spId 목록 → GET /fconline/v1/ranker-stats
                          → UPSERT ranker_stats
```

## 통계 분석용 핵심 쿼리 패턴

### 1. 유저 백분위 계산
```sql
-- 유효슈팅률 기준 전체 유저 중 백분위
SELECT
  ouid,
  effective_shoot_rate,
  PERCENT_RANK() OVER (ORDER BY effective_shoot_rate) * 100 as percentile
FROM v_user_recent_stats
WHERE match_type = 50 AND total_matches >= 10;
```

### 2. 나 vs 랭커 비교
```sql
-- 내 선수 스탯 vs 랭커 평균
SELECT
  mps.sp_id,
  mp.name,
  AVG(mps.goal) as my_avg_goal,
  rs.goal as ranker_avg_goal,
  AVG(mps.sp_rating) as my_avg_rating,
  rs.sp_rating as ranker_avg_rating
FROM match_player_stats mps
JOIN meta_players mp ON mps.sp_id = mp.sp_id
LEFT JOIN ranker_stats rs ON mps.sp_id = rs.sp_id
  AND mps.sp_position = rs.sp_position
WHERE mps.ouid = :ouid
GROUP BY mps.sp_id, mp.name, rs.goal, rs.sp_rating;
```

### 3. 시간대별 실점 분포
```sql
-- 실점 시간대 히스토그램 (15분 구간)
SELECT
  (goal_time / 900) * 15 as time_bucket_min,
  COUNT(*) as conceded_goals
FROM match_shoot_details msd
JOIN match_user_stats mus ON msd.match_id = mus.match_id
WHERE mus.ouid = :ouid AND msd.ouid != :ouid AND msd.result = 1
GROUP BY time_bucket_min
ORDER BY time_bucket_min;
```

## 용량 추정 (Free Tier 500MB 기준)

| 테이블 | 1유저 100경기 기준 행 수 | 예상 행 크기 | 1000유저 예상 |
|--------|------------------------|-------------|-------------|
| matches | 100 | ~100B | 100K행 ≈ 10MB |
| match_user_stats | 200 | ~500B | 200K행 ≈ 100MB |
| match_shoot_details | ~600 | ~100B | 600K행 ≈ 60MB |
| match_player_stats | ~2,200 | ~200B | 2.2M행 ≈ 440MB |
| meta_players | ~50,000 (전체) | ~50B | 50K행 ≈ 2.5MB |
| ranker_stats | ~10,000 | ~200B | 10K행 ≈ 2MB |

> **결론**: 1,000유저 수준에서 ~600MB로 Free Tier 초과 가능.
> match_player_stats가 가장 큼 → 필요 시 최근 N경기만 유지하는 정리 정책 필요.
