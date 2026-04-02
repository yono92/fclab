import { type NextRequest, NextResponse } from "next/server";

const NEXON_API_BASE = "https://open.api.nexon.com";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const apiKey = process.env.NEXON_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const { path } = await params;
  const targetPath = "/" + path.join("/");
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${NEXON_API_BASE}${targetPath}${searchParams ? `?${searchParams}` : ""}`;

  try {
    const res = await fetch(url, {
      headers: {
        "x-nxopen-api-key": apiKey,
      },
    });

    const data: unknown = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch from Nexon API" },
      { status: 502 }
    );
  }
}
