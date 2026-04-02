import { createNexonClient, NexonApiError } from "@/lib/nexon-api";
import { createSupabaseClient } from "@/lib/supabase";
import { weightedMovingAverage, mean } from "@/lib/stats";
import { TrendView } from "./trend-view";
import Link from "next/link";

interface PageProps {
  params: Promise<{ nickname: string }>;
  searchParams: Promise<{ matchtype?: string }>;
}

export default async function TrendPage({ params, searchParams }: PageProps) {
  const { nickname } = await params;
  const sp = await searchParams;
  const decodedNick = decodeURIComponent(nickname);
  const matchtype = Number(sp.matchtype) || 50;

  try {
    const client = createNexonClient();
    const { ouid } = await client.getOuid({ nickname: decodedNick });

    const supabase = createSupabaseClient();
    const { data: matchStats } = await supabase
      .from("match_user_stats")
      .select("*, matches!inner(match_date, match_type)")
      .eq("ouid", ouid)
      .order("match_id", { ascending: true });

    if (!matchStats || matchStats.length < 4) {
      return (
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">{decodedNick} — 변화 추적</h1>
          <p className="mt-4 text-muted-foreground">
            {matchStats && matchStats.length > 0
              ? `현재 ${matchStats.length}경기 데이터가 있습니다. 더 많은 경기 데이터가 쌓이면 변화를 추적할 수 있습니다.`
              : "다음에 다시 검색하면 변화를 추적할 수 있습니다. 먼저 대시보드에서 분석을 진행해주세요."}
          </p>
          <Link
            href={`/player/${encodeURIComponent(nickname)}`}
            className="mt-6 inline-block rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
          >
            대시보드로 돌아가기
          </Link>
        </div>
      );
    }

    // Build win rate time series
    const winValues = matchStats.map((s) =>
      s.match_result === "승" ? 100 : 0
    );
    const wmaValues = weightedMovingAverage(winValues, Math.min(5, winValues.length));

    const chartData = matchStats.map((s, i) => {
      const matchData = s.matches as { match_date: string } | null;
      const date = matchData?.match_date
        ? new Date(matchData.match_date)
        : new Date();
      return {
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        winRate: winValues[i],
        wma: i < matchStats.length - wmaValues.length
          ? winValues[i]
          : wmaValues[i - (matchStats.length - wmaValues.length)] ?? winValues[i],
      };
    });

    // Split into two halves for comparison
    const half = Math.floor(matchStats.length / 2);
    const prev = matchStats.slice(0, half);
    const curr = matchStats.slice(half);

    const safeDiv = (a: number, b: number) => (b === 0 ? 0 : a / b);

    const metrics = [
      {
        label: "승률 (%)",
        previous: safeDiv(prev.filter((s) => s.match_result === "승").length, prev.length) * 100,
        current: safeDiv(curr.filter((s) => s.match_result === "승").length, curr.length) * 100,
      },
      {
        label: "점유율 (%)",
        previous: mean(prev.map((s) => s.possession)),
        current: mean(curr.map((s) => s.possession)),
      },
      {
        label: "유효슈팅률 (%)",
        previous: safeDiv(prev.reduce((a, s) => a + s.effective_shoot_total, 0), prev.reduce((a, s) => a + s.shoot_total, 0)) * 100,
        current: safeDiv(curr.reduce((a, s) => a + s.effective_shoot_total, 0), curr.reduce((a, s) => a + s.shoot_total, 0)) * 100,
      },
      {
        label: "패스 성공률 (%)",
        previous: safeDiv(prev.reduce((a, s) => a + s.pass_success, 0), prev.reduce((a, s) => a + s.pass_try, 0)) * 100,
        current: safeDiv(curr.reduce((a, s) => a + s.pass_success, 0), curr.reduce((a, s) => a + s.pass_try, 0)) * 100,
      },
      {
        label: "경기당 골",
        previous: safeDiv(prev.reduce((a, s) => a + s.goal_total, 0), prev.length),
        current: safeDiv(curr.reduce((a, s) => a + s.goal_total, 0), curr.length),
      },
    ].map((m) => ({ ...m, delta: m.current - m.previous }));

    return (
      <TrendView
        nickname={decodedNick}
        chartData={chartData}
        metrics={metrics}
      />
    );
  } catch (err) {
    const message =
      err instanceof NexonApiError
        ? `API 오류 (${err.code})`
        : "데이터를 불러올 수 없습니다";

    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">변화 추적 실패</h1>
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
