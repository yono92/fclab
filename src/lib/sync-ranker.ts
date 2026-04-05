import { createNexonClient } from "@/lib/nexon-api";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { getTargetSpIds } from "@/lib/ranker-seed";

interface SyncRankerResult {
  matchType: number;
  attempted: number;
  upserted: number;
  skipped: number;
  errors: number;
}

const DELAY_MS = 200;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function syncRankerStats(
  matchType: number,
): Promise<SyncRankerResult> {
  const client = createNexonClient();
  const supabase = createSupabaseServiceClient();
  const spIds = await getTargetSpIds();

  const result: SyncRankerResult = {
    matchType,
    attempted: spIds.length,
    upserted: 0,
    skipped: 0,
    errors: 0,
  };

  for (const spId of spIds) {
    try {
      const rankerData = await client.getRankerStats({
        matchtype: matchType,
        players: spId,
      });

      if (rankerData.length === 0 || rankerData[0].players.length === 0) {
        result.skipped++;
        await sleep(DELAY_MS);
        continue;
      }

      const item = rankerData[0];
      const rows = item.players.map((p) => ({
        match_type: item.matchType,
        sp_id: p.spId,
        sp_position: p.spPosition,
        create_date: item.createDate,
        fetched_at: new Date().toISOString(),
        shoot: p.status.shoot,
        effective_shoot: p.status.effectiveShoot,
        assist: p.status.assist,
        goal: p.status.goal,
        dribble: p.status.dribble,
        intercept: p.status.intercept,
        defending: p.status.defending,
        pass_try: p.status.passTry,
        pass_success: p.status.passSuccess,
        dribble_try: p.status.dribbleTry,
        dribble_success: p.status.dribbleSuccess,
        ball_possesion_try: p.status.ballPossesionTry,
        ball_possesion_success: p.status.ballPossesionSuccess,
        aerial_try: p.status.aerialTry,
        aerial_success: p.status.aerialSuccess,
        block_try: p.status.blockTry,
        block: p.status.block,
        tackle_try: p.status.tackleTry,
        tackle: p.status.tackle,
        sp_rating: p.status.spRating,
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
