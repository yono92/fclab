import { createSupabaseClient } from "@/lib/supabase";

/**
 * 랭커 스탯 수집 대상 선수 목록
 *
 * spId = seasonId(3자리) * 1_000_000 + playerId(6자리)
 * 인기 시즌(25LIVE, 25PL, 25TOTS, 25UCL, BLD, WS 등) × 포지션별 주요 선수
 */

// 주요 playerId (시즌 무관 고유 ID)
const PLAYER_IDS = {
  // FWD
  음바페: 231747,
  호날두: 20801,
  메시: 158023,
  홀란드: 239085,
  손흥민: 200104,
  네이마르: 190871,
  살라: 209331,
  케인: 202126,
  레반도프스키: 188545,
  비니시우스: 238794,
  // MID
  벨링엄: 257899,
  발베르데: 243991,
  데브라위너: 192985,
  모드리치: 177003,
  페드리: 251854,
  킴미히: 227348,
  카제미루: 200145,
  브루노페르난데스: 212198,
  // DEF
  반다이크: 203376,
  뤼디거: 205452,
  살리바: 247296,
  김민재: 237086,
  아라우호: 246155,
  마르키뇨스: 207865,
  // FB
  카르바할: 204963,
  알폰소데이비스: 234396,
  캉셀루: 216535,
  알렉산더아놀드: 231281,
  // GK
  쿠르투아: 192119,
  노이어: 167495,
  알리송: 212831,
  오블락: 200389,
};

// 수집 대상 시즌 (최신 인기 시즌)
const TARGET_SEASONS = [
  300, // 25 LIVE
  517, // 25 PL
  844, // 25 TOTS
  856, // 25 UCL
  848, // WS (Winning Streak)
  828, // BLD (Best Legends)
  834, // 24 UCL
  820, // 24 TOTS
  515, // 24 PL
];

function buildSeedList(): number[] {
  const spIds: number[] = [];
  for (const playerId of Object.values(PLAYER_IDS)) {
    for (const seasonId of TARGET_SEASONS) {
      spIds.push(seasonId * 1_000_000 + playerId);
    }
  }
  return spIds;
}

/**
 * 수집 대상 spId 목록 반환
 * - match_player_stats에 충분한 데이터가 있으면 DB 기반 상위 선수 조회
 * - 부족하면 시드 리스트 fallback
 */
export async function getTargetSpIds(): Promise<number[]> {
  const supabase = createSupabaseClient();

  // DB에 충분한 데이터가 있는지 확인
  const { count } = await supabase
    .from("match_player_stats")
    .select("*", { count: "exact", head: true });

  if (count && count > 1000) {
    // DB 기반: 사용률 상위 200명
    const { data } = await supabase.rpc("get_general_meta", {
      p_match_type: 50,
      p_limit: 200,
    });
    if (data && data.length > 0) {
      return data.map((r: { sp_id: number }) => r.sp_id);
    }
  }

  // Fallback: 시드 리스트
  return buildSeedList();
}
