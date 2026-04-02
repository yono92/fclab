import type { Metadata } from "next";
import { createNexonClient, NexonApiError } from "@/lib/nexon-api";
import { MatchDetailView } from "./match-detail";
import Link from "next/link";

interface PageProps {
  params: Promise<{ nickname: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { nickname } = await params;
  return {
    title: `매치 상세 — ${decodeURIComponent(nickname)} — FCLab`,
    description: "FC Online 매치 상세 분석. 양쪽 유저 스탯 비교, 슈팅 히트맵, 골 타임라인.",
  };
}

export default async function MatchDetailPage({ params }: PageProps) {
  const { nickname, id } = await params;
  const decodedNick = decodeURIComponent(nickname);

  try {
    const client = createNexonClient();

    // Get ouid to identify "me"
    const { ouid } = await client.getOuid({ nickname: decodedNick });
    const match = await client.getMatchDetail({ matchid: id });

    const me = match.matchInfo.find((info) => info.ouid === ouid);
    const opponent = match.matchInfo.find((info) => info.ouid !== ouid) ?? null;

    if (!me) {
      throw new NexonApiError(404, "이 매치에서 유저 정보를 찾을 수 없습니다");
    }

    return (
      <MatchDetailView
        match={match}
        me={me}
        opponent={opponent}
        nickname={decodedNick}
      />
    );
  } catch (err) {
    const message =
      err instanceof NexonApiError
        ? `API 오류 (${err.code}): ${err.message}`
        : "매치 정보를 불러올 수 없습니다";

    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">매치 상세 로딩 실패</h1>
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
