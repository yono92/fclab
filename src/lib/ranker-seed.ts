import { createSupabaseClient } from "@/lib/supabase";
import type { RankerPlayerQuery } from "@/types/nexon";

/**
 * 랭커 스탯 수집 대상 선수 목록
 *
 * Nexon API는 [{"id": spId, "po": position}] 형태로 요청
 * 한번에 최대 50명까지 가능
 */

// 주요 선수: { playerId, positions[] }
const SEED_PLAYERS: { id: number; positions: number[] }[] = [
  // FWD (ST=25, RS=24, LS=26, CF=21, RW=23, LW=27)
  { id: 231747, positions: [25, 24, 26] },       // 음바페
  { id: 20801, positions: [25, 24, 26] },         // 호날두
  { id: 158023, positions: [25, 21, 23] },        // 메시
  { id: 239085, positions: [25] },                // 홀란드
  { id: 200104, positions: [25, 27, 24] },        // 손흥민
  { id: 190871, positions: [27, 25, 23] },        // 네이마르
  { id: 209331, positions: [23, 25] },            // 살라
  { id: 202126, positions: [25] },                // 케인
  { id: 188545, positions: [25] },                // 레반도프스키
  { id: 238794, positions: [27, 25] },            // 비니시우스
  // MID (CAM=18, CM=14, CDM=10, RM=12, LM=16)
  { id: 257899, positions: [18, 14] },            // 벨링엄
  { id: 243991, positions: [14, 12] },            // 발베르데
  { id: 192985, positions: [18, 14] },            // 데브라위너
  { id: 177003, positions: [14, 18] },            // 모드리치
  { id: 251854, positions: [14, 18] },            // 페드리
  { id: 227348, positions: [10, 14] },            // 킴미히
  { id: 200145, positions: [10, 14] },            // 카제미루
  { id: 212198, positions: [18, 14] },            // 브루노 페르난데스
  // DEF (CB=5, RCB=4, LCB=6)
  { id: 203376, positions: [5, 4] },              // 반다이크
  { id: 205452, positions: [5, 6] },              // 뤼디거
  { id: 247296, positions: [5, 4] },              // 살리바
  { id: 237086, positions: [5, 4] },              // 김민재
  { id: 246155, positions: [5, 4] },              // 아라우호
  { id: 207865, positions: [5, 6] },              // 마르키뇨스
  // FB (RB=3, LB=7, RWB=2, LWB=8)
  { id: 204963, positions: [3, 2] },              // 카르바할
  { id: 234396, positions: [7, 8] },              // 알폰소 데이비스
  { id: 216535, positions: [3, 7] },              // 캉셀루
  { id: 231281, positions: [3, 2] },              // 알렉산더-아놀드
  // GK (GK=0)
  { id: 192119, positions: [0] },                 // 쿠르투아
  { id: 167495, positions: [0] },                 // 노이어
  { id: 212831, positions: [0] },                 // 알리송
  { id: 200389, positions: [0] },                 // 오블락
];

const TARGET_SEASONS = [
  300, // 25 LIVE
  517, // 25 PL
  844, // 25 TOTS
  856, // 25 UCL
  848, // WS
  828, // BLD
];

function buildSeedList(): RankerPlayerQuery[] {
  const queries: RankerPlayerQuery[] = [];
  for (const player of SEED_PLAYERS) {
    for (const seasonId of TARGET_SEASONS) {
      const spId = seasonId * 1_000_000 + player.id;
      for (const po of player.positions) {
        queries.push({ id: spId, po });
      }
    }
  }
  return queries;
}

/**
 * 수집 대상 선수+포지션 목록 반환
 * - match_player_stats에 충분한 데이터가 있으면 DB 기반
 * - 부족하면 시드 리스트 fallback
 */
export async function getTargetPlayers(): Promise<RankerPlayerQuery[]> {
  const supabase = createSupabaseClient();

  const { count } = await supabase
    .from("match_player_stats")
    .select("*", { count: "exact", head: true });

  if (count && count > 1000) {
    const { data } = await supabase.rpc("get_general_meta", {
      p_match_type: 50,
      p_limit: 200,
    });
    if (data && data.length > 0) {
      return data.map((r: { sp_id: number; sp_position: number }) => ({
        id: r.sp_id,
        po: r.sp_position,
      }));
    }
  }

  return buildSeedList();
}
