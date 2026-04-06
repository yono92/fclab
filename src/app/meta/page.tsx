import type { Metadata } from "next";
import { fetchRankerMeta, fetchGeneralMeta, groupByPosition } from "@/lib/meta-queries";
import { resolvePlayerNames } from "@/lib/resolve-meta";
import { createSupabaseClient } from "@/lib/supabase";
import { MetaDashboard } from "./meta-dashboard";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "메타 대시보드 — FCLab",
  description: "FC Online 랭커 메타와 일반 유저 메타를 분리해서 보여주는 대시보드",
};

interface PageProps {
  searchParams: Promise<{ matchtype?: string }>;
}

export default async function MetaPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const matchtype = Number(sp.matchtype) || 50;

  try {
    const [rankerRows, generalRows] = await Promise.all([
      fetchRankerMeta(matchtype),
      fetchGeneralMeta(matchtype),
    ]);

    // 일반 메타용 선수명 매핑
    const generalSpIds = generalRows.map((r) => r.sp_id);
    const nameMap = await resolvePlayerNames([...new Set(generalSpIds)]);
    const playerNameMap = Object.fromEntries(nameMap);

    // 시즌명 매핑
    const allSpIds = [...rankerRows.map((r) => r.sp_id), ...generalSpIds];
    const seasonIds = [...new Set(allSpIds.map((id) => Math.floor(id / 1_000_000)))];
    const supabase = createSupabaseClient();
    const { data: seasons } = await supabase
      .from("meta_seasons")
      .select("season_id, class_name")
      .in("season_id", seasonIds);
    const seasonMap: Record<number, string> = {};
    for (const s of seasons ?? []) {
      // "25 LIVE (25 LIVE)" → "25 LIVE"
      const short = s.class_name.split("(")[0].trim();
      seasonMap[s.season_id] = short;
    }

    const rankerByPosition = Object.fromEntries(groupByPosition(rankerRows));
    const generalByPosition = Object.fromEntries(groupByPosition(generalRows));

    return (
      <MetaDashboard
        matchtype={matchtype}
        rankerByPosition={rankerByPosition}
        generalByPosition={generalByPosition}
        playerNameMap={playerNameMap}
        seasonMap={seasonMap}
      />
    );
  } catch {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-mono text-lg text-destructive">
          &gt; ERROR: 메타 데이터를 불러올 수 없습니다
        </h1>
        <p className="mt-2 font-mono text-sm text-muted-foreground">
          잠시 후 다시 시도해주세요.
        </p>
      </div>
    );
  }
}
