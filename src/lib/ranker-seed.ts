import { createSupabaseClient } from "@/lib/supabase";
import type { RankerPlayerQuery } from "@/types/nexon";

/**
 * 랭커 스탯 수집 대상 선수 목록
 *
 * 전략: 프리미엄 시즌 선수 전원 + 25 LIVE 상위 500명을 대상으로
 * 주요 포지션 조합으로 API 호출. 데이터가 없는 선수는 빈 응답으로 자동 스킵.
 */

// 프리미엄 시즌 (선수 수가 적어 전원 수집 가능)
const PREMIUM_SEASONS = [
  517, // 25 PL (~500명)
  856, // 25 UCL (~360명)
  848, // WS (~200명)
  844, // 25 TOTS (~160명)
  828, // BLD (~90명)
];

// 25 LIVE는 19K명이라 상위만
const LIVE_SEASON = 300;
const LIVE_LIMIT = 500;

// 포지션별 주요 포지션 (전체 28개 중 핵심만)
const KEY_POSITIONS = [
  0,  // GK
  3,  // RB
  5,  // CB
  7,  // LB
  10, // CDM
  14, // CM
  18, // CAM
  23, // RW
  25, // ST
  27, // LW
];

/**
 * DB에서 수집 대상 선수+포지션 목록 생성
 */
export async function getTargetPlayers(): Promise<RankerPlayerQuery[]> {
  const supabase = createSupabaseClient();

  // 1. match_player_stats에 데이터가 충분하면 실제 사용 기반
  const { count } = await supabase
    .from("match_player_stats")
    .select("*", { count: "exact", head: true });

  if (count && count > 1000) {
    const { data } = await supabase.rpc("get_general_meta", {
      p_match_type: 50,
      p_limit: 500,
    });
    if (data && data.length > 0) {
      return data.map((r: { sp_id: number; sp_position: number }) => ({
        id: r.sp_id,
        po: r.sp_position,
      }));
    }
  }

  // 2. 프리미엄 시즌 선수 전원
  const queries: RankerPlayerQuery[] = [];
  const seen = new Set<string>();

  for (const seasonId of PREMIUM_SEASONS) {
    const { data } = await supabase
      .from("meta_players")
      .select("sp_id")
      .gte("sp_id", seasonId * 1_000_000)
      .lt("sp_id", (seasonId + 1) * 1_000_000);

    if (data) {
      for (const row of data) {
        for (const po of KEY_POSITIONS) {
          const key = `${row.sp_id}-${po}`;
          if (!seen.has(key)) {
            seen.add(key);
            queries.push({ id: row.sp_id, po });
          }
        }
      }
    }
  }

  // 3. 25 LIVE 상위 500명 (sp_id 오름차순 = 낮은 playerId = 유명 선수)
  const { data: livePlayers } = await supabase
    .from("meta_players")
    .select("sp_id")
    .gte("sp_id", LIVE_SEASON * 1_000_000)
    .lt("sp_id", (LIVE_SEASON + 1) * 1_000_000)
    .order("sp_id", { ascending: true })
    .limit(LIVE_LIMIT);

  if (livePlayers) {
    for (const row of livePlayers) {
      for (const po of KEY_POSITIONS) {
        const key = `${row.sp_id}-${po}`;
        if (!seen.has(key)) {
          seen.add(key);
          queries.push({ id: row.sp_id, po });
        }
      }
    }
  }

  return queries;
}
