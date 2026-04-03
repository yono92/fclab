import { createSupabaseClient } from "@/lib/supabase";

export interface MetaPlayerRow {
  sp_id: number;
  sp_position: number;
  usage: number;
}

export async function fetchRankerMeta(
  matchType: number,
  limit = 200,
): Promise<MetaPlayerRow[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.rpc("get_ranker_meta", {
    p_match_type: matchType,
    p_limit: limit,
  });
  if (error) throw error;
  return data ?? [];
}

export async function fetchGeneralMeta(
  matchType: number,
  limit = 200,
): Promise<MetaPlayerRow[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.rpc("get_general_meta", {
    p_match_type: matchType,
    p_limit: limit,
  });
  if (error) throw error;
  return data ?? [];
}

export function groupByPosition(
  rows: MetaPlayerRow[],
): Map<number, MetaPlayerRow[]> {
  const map = new Map<number, MetaPlayerRow[]>();
  for (const row of rows) {
    const list = map.get(row.sp_position) ?? [];
    list.push(row);
    map.set(row.sp_position, list);
  }
  return map;
}
