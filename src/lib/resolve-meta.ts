import { createSupabaseClient } from "@/lib/supabase";

const POSITION_MAP: Record<number, string> = {
  0: "GK", 1: "SW", 2: "RWB", 3: "RB", 4: "RCB", 5: "CB", 6: "LCB", 7: "LB", 8: "LWB",
  9: "RDM", 10: "CDM", 11: "LDM", 12: "RM", 13: "RCM", 14: "CM", 15: "LCM", 16: "LM",
  17: "RAM", 18: "CAM", 19: "LAM", 20: "RF", 21: "CF", 22: "LF", 23: "RW", 24: "RS",
  25: "ST", 26: "LS", 27: "LW", 28: "SUB",
};

export function getPositionName(spPosition: number): string {
  return POSITION_MAP[spPosition] ?? `P${spPosition}`;
}

export async function resolvePlayerNames(spIds: number[]): Promise<Map<number, string>> {
  const map = new Map<number, string>();
  if (spIds.length === 0) return map;

  const unique = [...new Set(spIds)];
  const supabase = createSupabaseClient();

  // Query in batches of 100
  for (let i = 0; i < unique.length; i += 100) {
    const batch = unique.slice(i, i + 100);
    const { data } = await supabase
      .from("meta_players")
      .select("sp_id, name")
      .in("sp_id", batch);

    if (data) {
      for (const row of data) {
        map.set(row.sp_id, row.name);
      }
    }
  }

  return map;
}
