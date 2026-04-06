import { analyzePlayer } from "@/lib/analyze";
import { createNexonClient, NexonApiError } from "@/lib/nexon-api";
import { cohensD } from "@/lib/stats";
import { CompareView, type PlayerComparison } from "./compare-view";
import Link from "next/link";
import type { RankerPlayerStatus } from "@/types/nexon";

interface PageProps {
  params: Promise<{ nickname: string }>;
  searchParams: Promise<{ matchtype?: string; limit?: string }>;
}

function getVerdict(d: number): string {
  const abs = Math.abs(d);
  if (abs < 0.2) return "✅ 유사";
  if (abs < 0.5) return "⚡ 약간 차이";
  if (abs < 0.8) return "⚠ 차이";
  return "⚠ 큰 차이";
}

export default async function ComparePage({ params, searchParams }: PageProps) {
  const { nickname } = await params;
  const sp = await searchParams;
  const decodedNick = decodeURIComponent(nickname);
  const matchtype = Number(sp.matchtype) || 50;
  const limit = Number(sp.limit) || 20;

  try {
    const result = await analyzePlayer(decodedNick, matchtype, limit);
    const client = createNexonClient();
    const comparisons: PlayerComparison[] = [];

    // For each top player, get ranker stats
    for (const player of result.playerStats.slice(0, 10)) {
      try {
        // 주요 포지션에서 랭커 데이터 조회
        const positions = [25, 24, 26, 21, 18, 14, 10, 5, 3, 7, 0]; // ST,RS,LS,CF,CAM,CM,CDM,CB,RB,LB,GK
        const rankerData = await client.getRankerStats({
          matchtype,
          players: positions.map((po) => ({ id: player.spId, po })),
        });

        if (rankerData.length === 0) continue;

        const ranker = rankerData[0].status;

        // Collect per-match stats for this player from my matches
        const myPerMatch = result.myStats
          .flatMap((m) => m.player)
          .filter((p) => p.spId === player.spId);

        if (myPerMatch.length < 2) continue;

        const metricDefs: {
          label: string;
          myKey: keyof typeof myPerMatch[0]["status"];
          rankerKey: keyof RankerPlayerStatus;
        }[] = [
          { label: "골", myKey: "goal", rankerKey: "goal" },
          { label: "어시스트", myKey: "assist", rankerKey: "assist" },
          { label: "유효슈팅", myKey: "effectiveShoot", rankerKey: "effectiveShoot" },
          { label: "패스성공", myKey: "passSuccess", rankerKey: "passSuccess" },
          { label: "드리블성공", myKey: "dribbleSuccess", rankerKey: "dribbleSuccess" },
          { label: "평점", myKey: "spRating", rankerKey: "spRating" },
        ];

        const metrics = metricDefs.map((md) => {
          const myValues = myPerMatch.map((p) => p.status[md.myKey] as number);
          const rankerValue = ranker[md.rankerKey] as number;
          const myMean = myValues.reduce((a, b) => a + b, 0) / myValues.length;
          const d = cohensD(myValues, Array(myValues.length).fill(rankerValue));

          return {
            label: md.label,
            myValue: myMean,
            rankerValue,
            diff: myMean - rankerValue,
            cohensD: d,
            verdict: getVerdict(d),
          };
        });

        const radarData = metrics.map((m) => ({
          axis: m.label,
          my: m.myValue,
          ranker: m.rankerValue,
        }));

        comparisons.push({
          spId: player.spId,
          appearances: player.appearances,
          metrics,
          radarData,
        });
      } catch {
        // Skip players with no ranker data
        continue;
      }
    }

    return <CompareView nickname={decodedNick} players={comparisons} />;
  } catch (err) {
    const message =
      err instanceof NexonApiError
        ? `API 오류 (${err.code})`
        : "분석 데이터를 불러올 수 없습니다";

    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">비교 실패</h1>
        <p className="mt-4 text-muted-foreground">{message}</p>
        <Link
          href={`/player/${encodeURIComponent(nickname)}`}
          className="mt-6 inline-block rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
        >
          대시보드로 돌아가기
        </Link>
      </div>
    );
  }
}
