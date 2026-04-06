import { syncRankerStats } from "@/lib/sync-ranker";

export const maxDuration = 300;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = [
      await syncRankerStats(50),
      await syncRankerStats(52),
    ];
    const success = results.every((r) => r.errors === 0);
    return Response.json(
      { results, success },
      { status: success ? 200 : 207 },
    );
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
