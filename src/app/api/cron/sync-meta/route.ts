import { syncAllMetadata } from "@/lib/sync-metadata";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await syncAllMetadata();
    const hasError = results.some((r) => r.error);
    return Response.json(
      { results, success: !hasError },
      { status: hasError ? 207 : 200 }
    );
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
