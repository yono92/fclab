import { createSupabaseClient } from "@/lib/supabase";

export interface RankerMetaRow {
  sp_id: number;
  sp_position: number;
  player_name: string;
  goal: number;
  assist: number;
  shoot: number;
  effective_shoot: number;
  pass_success: number;
  dribble_success: number;
  tackle: number;
  block: number;
}

export interface GeneralMetaRow {
  sp_id: number;
  sp_position: number;
  usage: number;
}

export async function fetchRankerMeta(
  matchType: number,
  limit = 200,
): Promise<RankerMetaRow[]> {
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
): Promise<GeneralMetaRow[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.rpc("get_general_meta", {
    p_match_type: matchType,
    p_limit: limit,
  });
  if (error) throw error;
  return data ?? [];
}

export function groupByPosition<T extends { sp_position: number }>(
  rows: T[],
): Map<number, T[]> {
  const map = new Map<number, T[]>();
  for (const row of rows) {
    const list = map.get(row.sp_position) ?? [];
    list.push(row);
    map.set(row.sp_position, list);
  }
  return map;
}
