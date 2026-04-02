import type { Metadata } from "next";
import { analyzePlayer } from "@/lib/analyze";
import { NexonApiError } from "@/lib/nexon-api";
import { persistAnalysis } from "@/lib/persist-analysis";
import { Dashboard } from "./dashboard";
import Link from "next/link";

interface PageProps {
  params: Promise<{ nickname: string }>;
  searchParams: Promise<{ matchtype?: string; limit?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { nickname } = await params;
  const name = decodeURIComponent(nickname);
  return {
    title: `${name} — FCLab 플레이 분석`,
    description: `${name}의 FC Online 전적 통계 분석. 승률, 슈팅, 패스, 수비 지표와 액션 제안.`,
  };
}

export default async function PlayerDashboardPage({
  params,
  searchParams,
}: PageProps) {
  const { nickname } = await params;
  const sp = await searchParams;
  const decodedNick = decodeURIComponent(nickname);
  const matchtype = Number(sp.matchtype) || 50;
  const limit = Number(sp.limit) || 20;

  try {
    const result = await analyzePlayer(decodedNick, matchtype, limit);

    // DB에 비동기 저장 (실패해도 대시보드는 정상 표시)
    persistAnalysis(result.user, result.matches, result.myStats).catch(() => {});

    return (
      <Dashboard
        result={result}
        nickname={decodedNick}
        matchtype={matchtype}
        limit={limit}
      />
    );
  } catch (err) {
    const message =
      err instanceof NexonApiError
        ? err.code === 404
          ? `"${decodedNick}" 닉네임의 유저를 찾을 수 없습니다`
          : err.code === 429
            ? "일시적 오류. 잠시 후 다시 시도해주세요"
            : `API 오류 (${err.code})`
        : err instanceof Error && err.message.includes("경기가 없습니다")
          ? `최근 경기가 없습니다. 다른 매치 타입을 선택해보세요`
          : "알 수 없는 오류가 발생했습니다";

    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">분석 실패</h1>
        <p className="mt-4 text-muted-foreground">{message}</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          다시 검색하기
        </Link>
      </div>
    );
  }
}
