-- ============================================================================
-- FCLab Database Schema (Supabase PostgreSQL)
-- Version: 1.0.0
-- Date: 2026-04-02
-- ============================================================================

-- ============================================================================
-- 메타데이터 테이블 (Nexon Static JSON 동기화)
-- ============================================================================

CREATE TABLE IF NOT EXISTS meta_match_types (
  matchtype     INTEGER PRIMARY KEY,
  description   TEXT NOT NULL,
  synced_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meta_seasons (
  season_id     INTEGER PRIMARY KEY,
  class_name    TEXT NOT NULL,
  season_img    TEXT NOT NULL,
  synced_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meta_players (
  sp_id         INTEGER PRIMARY KEY,   -- seasonId(3자리) * 1000000 + playerId(6자리)
  name          TEXT NOT NULL,
  synced_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meta_positions (
  sp_position   INTEGER PRIMARY KEY,
  description   TEXT NOT NULL,
  synced_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meta_divisions (
  division_id   INTEGER PRIMARY KEY,
  division_name TEXT NOT NULL,
  is_volta      BOOLEAN NOT NULL DEFAULT false,
  synced_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 유저 테이블
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  ouid          TEXT PRIMARY KEY,
  nickname      TEXT NOT NULL,
  level         INTEGER NOT NULL DEFAULT 0,
  fetched_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_nickname ON users (nickname);

CREATE TABLE IF NOT EXISTS user_max_divisions (
  ouid          TEXT NOT NULL REFERENCES users(ouid) ON DELETE CASCADE,
  match_type    INTEGER NOT NULL REFERENCES meta_match_types(matchtype),
  division      INTEGER NOT NULL,
  achievement_date TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (ouid, match_type)
);

-- ============================================================================
-- 매치 테이블
-- ============================================================================

CREATE TABLE IF NOT EXISTS matches (
  match_id      TEXT PRIMARY KEY,
  match_date    TIMESTAMPTZ NOT NULL,
  match_type    INTEGER NOT NULL,
  fetched_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- 30일 갱신 의무 추적
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days')
);

CREATE INDEX IF NOT EXISTS idx_matches_date ON matches (match_date DESC);
CREATE INDEX IF NOT EXISTS idx_matches_type ON matches (match_type);
CREATE INDEX IF NOT EXISTS idx_matches_expires ON matches (expires_at);

-- 매치 내 유저별 상세 스탯
CREATE TABLE IF NOT EXISTS match_user_stats (
  match_id      TEXT NOT NULL REFERENCES matches(match_id) ON DELETE CASCADE,
  ouid          TEXT NOT NULL,
  nickname      TEXT NOT NULL,

  -- matchDetail
  season_id         INTEGER,
  match_result      TEXT NOT NULL,        -- '승' | '무' | '패'
  match_end_type    INTEGER NOT NULL DEFAULT 0,
  system_pause      INTEGER NOT NULL DEFAULT 0,
  foul              INTEGER NOT NULL DEFAULT 0,
  injury            INTEGER NOT NULL DEFAULT 0,
  red_cards         INTEGER NOT NULL DEFAULT 0,
  yellow_cards      INTEGER NOT NULL DEFAULT 0,
  dribble           INTEGER NOT NULL DEFAULT 0,
  corner_kick       INTEGER NOT NULL DEFAULT 0,
  possession        INTEGER NOT NULL DEFAULT 0,
  offside_count     INTEGER NOT NULL DEFAULT 0,
  average_rating    REAL NOT NULL DEFAULT 0,
  controller        TEXT NOT NULL DEFAULT 'keyboard',

  -- shoot summary
  shoot_total             INTEGER NOT NULL DEFAULT 0,
  effective_shoot_total   INTEGER NOT NULL DEFAULT 0,
  shoot_out_score         INTEGER NOT NULL DEFAULT 0,
  goal_total              INTEGER NOT NULL DEFAULT 0,
  goal_total_display      INTEGER NOT NULL DEFAULT 0,
  own_goal                INTEGER NOT NULL DEFAULT 0,
  shoot_heading           INTEGER NOT NULL DEFAULT 0,
  goal_heading            INTEGER NOT NULL DEFAULT 0,
  shoot_freekick          INTEGER NOT NULL DEFAULT 0,
  goal_freekick           INTEGER NOT NULL DEFAULT 0,
  shoot_in_penalty        INTEGER NOT NULL DEFAULT 0,
  goal_in_penalty         INTEGER NOT NULL DEFAULT 0,
  shoot_out_penalty       INTEGER NOT NULL DEFAULT 0,
  goal_out_penalty        INTEGER NOT NULL DEFAULT 0,
  shoot_penalty_kick      INTEGER NOT NULL DEFAULT 0,
  goal_penalty_kick       INTEGER NOT NULL DEFAULT 0,

  -- pass summary
  pass_try              INTEGER NOT NULL DEFAULT 0,
  pass_success          INTEGER NOT NULL DEFAULT 0,
  short_pass_try        INTEGER NOT NULL DEFAULT 0,
  short_pass_success    INTEGER NOT NULL DEFAULT 0,
  long_pass_try         INTEGER NOT NULL DEFAULT 0,
  long_pass_success     INTEGER NOT NULL DEFAULT 0,
  bouncing_lob_pass_try     INTEGER NOT NULL DEFAULT 0,
  bouncing_lob_pass_success INTEGER NOT NULL DEFAULT 0,
  driven_ground_pass_try    INTEGER NOT NULL DEFAULT 0,
  driven_ground_pass_success INTEGER NOT NULL DEFAULT 0,
  through_pass_try          INTEGER NOT NULL DEFAULT 0,
  through_pass_success      INTEGER NOT NULL DEFAULT 0,
  lobbied_through_pass_try     INTEGER NOT NULL DEFAULT 0,
  lobbied_through_pass_success INTEGER NOT NULL DEFAULT 0,

  -- defence summary
  block_try         INTEGER NOT NULL DEFAULT 0,
  block_success     INTEGER NOT NULL DEFAULT 0,
  tackle_try        INTEGER NOT NULL DEFAULT 0,
  tackle_success    INTEGER NOT NULL DEFAULT 0,

  PRIMARY KEY (match_id, ouid)
);

CREATE INDEX IF NOT EXISTS idx_match_user_stats_ouid ON match_user_stats (ouid);
CREATE INDEX IF NOT EXISTS idx_match_user_stats_result ON match_user_stats (ouid, match_result);

-- 매치 내 슈팅 상세 (위치 정보 포함 → 히트맵)
CREATE TABLE IF NOT EXISTS match_shoot_details (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  match_id      TEXT NOT NULL,
  ouid          TEXT NOT NULL,
  goal_time     INTEGER NOT NULL,
  x             REAL NOT NULL,
  y             REAL NOT NULL,
  shoot_type    INTEGER NOT NULL,
  result        INTEGER NOT NULL,     -- 골/유효/비유효 등
  sp_id         INTEGER NOT NULL,
  sp_grade      INTEGER NOT NULL DEFAULT 0,
  sp_level      INTEGER NOT NULL DEFAULT 0,
  assist        BOOLEAN NOT NULL DEFAULT false,
  assist_sp_id  INTEGER,
  assist_x      REAL,
  assist_y      REAL,
  hit_post      BOOLEAN NOT NULL DEFAULT false,
  in_penalty    BOOLEAN NOT NULL DEFAULT false,

  FOREIGN KEY (match_id, ouid) REFERENCES match_user_stats(match_id, ouid) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_shoot_details_match ON match_shoot_details (match_id, ouid);

-- 매치 내 선수별 스탯
CREATE TABLE IF NOT EXISTS match_player_stats (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  match_id      TEXT NOT NULL,
  ouid          TEXT NOT NULL,
  sp_id         INTEGER NOT NULL,
  sp_position   INTEGER NOT NULL,
  sp_grade      INTEGER NOT NULL DEFAULT 0,

  -- player status
  shoot             INTEGER NOT NULL DEFAULT 0,
  effective_shoot   INTEGER NOT NULL DEFAULT 0,
  assist            INTEGER NOT NULL DEFAULT 0,
  goal              INTEGER NOT NULL DEFAULT 0,
  dribble           INTEGER NOT NULL DEFAULT 0,
  intercept         INTEGER NOT NULL DEFAULT 0,
  defending         INTEGER NOT NULL DEFAULT 0,
  pass_try          INTEGER NOT NULL DEFAULT 0,
  pass_success      INTEGER NOT NULL DEFAULT 0,
  dribble_try       INTEGER NOT NULL DEFAULT 0,
  dribble_success   INTEGER NOT NULL DEFAULT 0,
  ball_possesion_try    INTEGER NOT NULL DEFAULT 0,
  ball_possesion_suc    INTEGER NOT NULL DEFAULT 0,
  aerial_try        INTEGER NOT NULL DEFAULT 0,
  aerial_success    INTEGER NOT NULL DEFAULT 0,
  block_try         INTEGER NOT NULL DEFAULT 0,
  block             INTEGER NOT NULL DEFAULT 0,
  tackle_try        INTEGER NOT NULL DEFAULT 0,
  tackle            INTEGER NOT NULL DEFAULT 0,
  yellow_cards      INTEGER NOT NULL DEFAULT 0,
  red_cards         INTEGER NOT NULL DEFAULT 0,
  sp_rating         REAL NOT NULL DEFAULT 0,

  FOREIGN KEY (match_id, ouid) REFERENCES match_user_stats(match_id, ouid) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_player_stats_match ON match_player_stats (match_id, ouid);
CREATE INDEX IF NOT EXISTS idx_player_stats_spid ON match_player_stats (sp_id);

-- ============================================================================
-- 랭커 스탯 테이블
-- ============================================================================

CREATE TABLE IF NOT EXISTS ranker_stats (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  match_type    INTEGER NOT NULL,
  sp_id         INTEGER NOT NULL,
  sp_position   INTEGER NOT NULL,
  create_date   TIMESTAMPTZ NOT NULL,
  fetched_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- ranker player status (20경기 평균)
  shoot             REAL NOT NULL DEFAULT 0,
  effective_shoot   REAL NOT NULL DEFAULT 0,
  assist            REAL NOT NULL DEFAULT 0,
  goal              REAL NOT NULL DEFAULT 0,
  dribble           REAL NOT NULL DEFAULT 0,
  intercept         REAL NOT NULL DEFAULT 0,
  defending         REAL NOT NULL DEFAULT 0,
  pass_try          REAL NOT NULL DEFAULT 0,
  pass_success      REAL NOT NULL DEFAULT 0,
  dribble_try       REAL NOT NULL DEFAULT 0,
  dribble_success   REAL NOT NULL DEFAULT 0,
  ball_possesion_try    REAL NOT NULL DEFAULT 0,
  ball_possesion_success REAL NOT NULL DEFAULT 0,
  aerial_try        REAL NOT NULL DEFAULT 0,
  aerial_success    REAL NOT NULL DEFAULT 0,
  block_try         REAL NOT NULL DEFAULT 0,
  block             REAL NOT NULL DEFAULT 0,
  tackle_try        REAL NOT NULL DEFAULT 0,
  tackle            REAL NOT NULL DEFAULT 0,
  sp_rating         REAL NOT NULL DEFAULT 0,

  UNIQUE (match_type, sp_id, sp_position, create_date)
);

CREATE INDEX IF NOT EXISTS idx_ranker_stats_spid ON ranker_stats (sp_id);
CREATE INDEX IF NOT EXISTS idx_ranker_stats_matchtype ON ranker_stats (match_type);

-- ============================================================================
-- 분석용 집계 뷰 (통계 분석 편의)
-- ============================================================================

-- 유저별 최근 N경기 요약 통계 뷰
CREATE OR REPLACE VIEW v_user_recent_stats AS
SELECT
  mus.ouid,
  mus.nickname,
  m.match_type,
  COUNT(*) as total_matches,
  COUNT(*) FILTER (WHERE mus.match_result = '승') as wins,
  COUNT(*) FILTER (WHERE mus.match_result = '무') as draws,
  COUNT(*) FILTER (WHERE mus.match_result = '패') as losses,
  ROUND(COUNT(*) FILTER (WHERE mus.match_result = '승')::NUMERIC / NULLIF(COUNT(*), 0) * 100, 1) as win_rate,
  ROUND(AVG(mus.possession)::NUMERIC, 1) as avg_possession,
  ROUND(AVG(mus.average_rating)::NUMERIC, 2) as avg_rating,
  SUM(mus.goal_total) as total_goals,
  SUM(mus.shoot_total) as total_shoots,
  SUM(mus.effective_shoot_total) as total_effective_shoots,
  ROUND(SUM(mus.effective_shoot_total)::NUMERIC / NULLIF(SUM(mus.shoot_total), 0) * 100, 1) as effective_shoot_rate,
  ROUND(SUM(mus.goal_total)::NUMERIC / NULLIF(SUM(mus.shoot_total), 0) * 100, 1) as goal_conversion_rate,
  SUM(mus.pass_try) as total_pass_try,
  SUM(mus.pass_success) as total_pass_success,
  ROUND(SUM(mus.pass_success)::NUMERIC / NULLIF(SUM(mus.pass_try), 0) * 100, 1) as pass_success_rate,
  ROUND(AVG(mus.foul)::NUMERIC, 1) as avg_fouls,
  MAX(m.match_date) as last_match_date,
  MIN(m.match_date) as first_match_date
FROM match_user_stats mus
JOIN matches m ON mus.match_id = m.match_id
GROUP BY mus.ouid, mus.nickname, m.match_type;

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

-- 모든 테이블: 누구나 읽기 가능 (공개 데이터)
-- 쓰기는 서비스 역할(service_role)만 가능

ALTER TABLE meta_match_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_max_divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_shoot_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranker_stats ENABLE ROW LEVEL SECURITY;

-- 읽기 정책: anon + authenticated 모두 허용
CREATE POLICY "Public read" ON meta_match_types FOR SELECT USING (true);
CREATE POLICY "Public read" ON meta_seasons FOR SELECT USING (true);
CREATE POLICY "Public read" ON meta_players FOR SELECT USING (true);
CREATE POLICY "Public read" ON meta_positions FOR SELECT USING (true);
CREATE POLICY "Public read" ON meta_divisions FOR SELECT USING (true);
CREATE POLICY "Public read" ON users FOR SELECT USING (true);
CREATE POLICY "Public read" ON user_max_divisions FOR SELECT USING (true);
CREATE POLICY "Public read" ON matches FOR SELECT USING (true);
CREATE POLICY "Public read" ON match_user_stats FOR SELECT USING (true);
CREATE POLICY "Public read" ON match_shoot_details FOR SELECT USING (true);
CREATE POLICY "Public read" ON match_player_stats FOR SELECT USING (true);
CREATE POLICY "Public read" ON ranker_stats FOR SELECT USING (true);
