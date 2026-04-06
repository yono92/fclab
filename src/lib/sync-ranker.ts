import { createNexonClient } from "@/lib/nexon-api";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { getTargetPlayers } from "@/lib/ranker-seed";
import type { RankerPlayerQuery } from "@/types/nexon";

interface SyncRankerResult {
  matchType: number;
  batches: number;
  upserted: number;
  skipped: number;
  errors: number;
}

const BATCH_SIZE = 50; // Nexon API 최대 50명/요청
const DELAY_MS = 300;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function syncRankerStats(
  matchType: number,
): Promise<SyncRankerResult> {
  const client = createNexonClient();
  const supabase = createSupabaseServiceClient();
  const players = await getTargetPlayers();

  // 배치로 분할
  const batches: RankerPlayerQuery[][] = [];
  for (let i = 0; i < players.length; i += BATCH_SIZE) {
    batches.push(players.slice(i, i + BATCH_SIZE));
  }

  const result: SyncRankerResult = {
    matchType,
    batches: batches.length,
    upserted: 0,
    skipped: 0,
    errors: 0,
  };

  for (const batch of batches) {
    try {
      const rankerData = await client.getRankerStats({
        matchtype: matchType,
        players: batch,
      });

      if (rankerData.length === 0) {
        result.skipped += batch.length;
        await sleep(DELAY_MS);
        continue;
      }

      const rows = rankerData.map((item) => ({
        match_type: matchType,
        sp_id: item.spid,
        sp_position: item.spPosition,
        create_date: item.createDate,
        fetched_at: new Date().toISOString(),
        shoot: item.status.shoot,
        effective_shoot: item.status.effectiveShoot,
        assist: item.status.assist,
        goal: item.status.goal,
        dribble: item.status.dribble,
        intercept: 0,
        defending: 0,
        pass_try: item.status.passTry,
        pass_success: item.status.passSuccess,
        dribble_try: item.status.dribbleTry,
        dribble_success: item.status.dribbleSuccess,
        ball_possesion_try: 0,
        ball_possesion_success: 0,
        aerial_try: 0,
        aerial_success: 0,
        block_try: 0,
        block: item.status.block,
        tackle_try: 0,
        tackle: item.status.tackle,
        sp_rating: 0,
      }));

      const { error } = await supabase
        .from("ranker_stats")
        .upsert(rows, {
          onConflict: "match_type,sp_id,sp_position,create_date",
        });

      if (error) {
        result.errors++;
      } else {
        result.upserted += rows.length;
      }
    } catch {
      result.errors++;
    }

    await sleep(DELAY_MS);
  }

  return result;
}
