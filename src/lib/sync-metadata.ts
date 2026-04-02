/**
 * FCLab 메타데이터 동기화
 * Nexon static JSON → Supabase fclab.meta_* 테이블 UPSERT
 */

import { createNexonClient } from "@/lib/nexon-api";
import { createSupabaseServiceClient } from "@/lib/supabase";

interface SyncResult {
  table: string;
  upserted: number;
  error?: string;
}

async function batchUpsert<T extends Record<string, unknown>>(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  table: string,
  rows: T[],
  onConflict: string,
  batchSize: number = 1000
): Promise<SyncResult> {
  let upserted = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase
      .from(table)
      .upsert(batch, { onConflict });

    if (error) {
      return { table, upserted, error: `Batch ${Math.floor(i / batchSize)}: ${error.message}` };
    }
    upserted += batch.length;
  }

  return { table, upserted };
}

export async function syncAllMetadata(): Promise<SyncResult[]> {
  const client = createNexonClient();
  const supabase = createSupabaseServiceClient();
  const results: SyncResult[] = [];

  // 1. Match Types
  try {
    const matchTypes = await client.getMetaMatchTypes();
    const rows = matchTypes.map((mt) => ({
      matchtype: mt.matchtype,
      description: mt.desc,
      synced_at: new Date().toISOString(),
    }));
    results.push(await batchUpsert(supabase, "meta_match_types", rows, "matchtype"));
  } catch (err) {
    results.push({ table: "meta_match_types", upserted: 0, error: String(err) });
  }

  // 2. Seasons
  try {
    const seasons = await client.getMetaSeasons();
    const rows = seasons.map((s) => ({
      season_id: s.seasonId,
      class_name: s.className,
      season_img: s.seasonImg,
      synced_at: new Date().toISOString(),
    }));
    results.push(await batchUpsert(supabase, "meta_seasons", rows, "season_id"));
  } catch (err) {
    results.push({ table: "meta_seasons", upserted: 0, error: String(err) });
  }

  // 3. Players (large: ~50K rows, batch 1000)
  try {
    const players = await client.getMetaSpIds();
    const rows = players.map((p) => ({
      sp_id: p.id,
      name: p.name,
      synced_at: new Date().toISOString(),
    }));
    results.push(await batchUpsert(supabase, "meta_players", rows, "sp_id", 1000));
  } catch (err) {
    results.push({ table: "meta_players", upserted: 0, error: String(err) });
  }

  // 4. Positions
  try {
    const positions = await client.getMetaPositions();
    const rows = positions.map((p) => ({
      sp_position: p.spposition,
      description: p.desc,
      synced_at: new Date().toISOString(),
    }));
    results.push(await batchUpsert(supabase, "meta_positions", rows, "sp_position"));
  } catch (err) {
    results.push({ table: "meta_positions", upserted: 0, error: String(err) });
  }

  // 5. Divisions
  try {
    const divisions = await client.getMetaDivisions();
    const rows = divisions.map((d) => ({
      division_id: d.divisionId,
      division_name: d.divisionName,
      is_volta: false,
      synced_at: new Date().toISOString(),
    }));
    results.push(await batchUpsert(supabase, "meta_divisions", rows, "division_id"));
  } catch (err) {
    results.push({ table: "meta_divisions", upserted: 0, error: String(err) });
  }

  return results;
}
