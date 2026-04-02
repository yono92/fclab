/**
 * Nexon FC Online OpenAPI Client
 * Constitution: Type Safety — Zod 런타임 검증, any 금지
 */

import {
  NEXON_API_BASE,
  NEXON_META_BASE,
  UserOuidSchema,
  UserBasicSchema,
  MaxDivisionSchema,
  MatchIdListSchema,
  MatchResponseSchema,
  RankerStatsSchema,
  MetaMatchTypeListSchema,
  MetaSpIdListSchema,
  MetaSeasonListSchema,
  MetaPositionListSchema,
  MetaDivisionListSchema,
  type UserOuid,
  type UserBasic,
  type MaxDivision,
  type MatchIdList,
  type MatchResponse,
  type RankerStats,
  type MetaMatchType,
  type MetaSpId,
  type MetaSeason,
  type MetaPosition,
  type MetaDivision,
  type GetOuidParams,
  type GetUserBasicParams,
  type GetUserMatchParams,
  type GetMatchDetailParams,
  type GetRankerStatsParams,
} from "@/types/nexon";
import { z } from "zod";

export class NexonApiError extends Error {
  constructor(
    public code: number,
    message: string
  ) {
    super(message);
    this.name = "NexonApiError";
  }
}

export class NexonApiClient {
  private apiKey: string;
  private maxRetries = 3;
  private timeout = 10_000;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetchWithRetry<T>(
    url: string,
    schema: z.ZodType<T>
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const res = await fetch(url, {
          headers: { "x-nxopen-api-key": this.apiKey },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.status === 429) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        if (!res.ok) {
          const body = await res.text();
          throw new NexonApiError(res.status, body);
        }

        const json: unknown = await res.json();
        return schema.parse(json);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (
          err instanceof NexonApiError &&
          err.code !== 429
        ) {
          throw err;
        }
      }
    }

    throw lastError ?? new Error("Max retries exceeded");
  }

  private url(path: string, params?: Record<string, string | number>): string {
    const u = new URL(path, NEXON_API_BASE);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined) u.searchParams.set(k, String(v));
      }
    }
    return u.toString();
  }

  async getOuid(params: GetOuidParams): Promise<UserOuid> {
    return this.fetchWithRetry(
      this.url("/fconline/v1/id", { nickname: params.nickname }),
      UserOuidSchema
    );
  }

  async getUserBasic(params: GetUserBasicParams): Promise<UserBasic> {
    return this.fetchWithRetry(
      this.url("/fconline/v1/user/basic", { ouid: params.ouid }),
      UserBasicSchema
    );
  }

  async getUserMaxDivision(params: GetUserBasicParams): Promise<MaxDivision> {
    return this.fetchWithRetry(
      this.url("/fconline/v1/user/maxdivision", { ouid: params.ouid }),
      MaxDivisionSchema
    );
  }

  async getUserMatch(params: GetUserMatchParams): Promise<MatchIdList> {
    return this.fetchWithRetry(
      this.url("/fconline/v1/user/match", {
        ouid: params.ouid,
        matchtype: params.matchtype,
        ...(params.offset !== undefined && { offset: params.offset }),
        ...(params.limit !== undefined && { limit: params.limit }),
      }),
      MatchIdListSchema
    );
  }

  async getMatchDetail(params: GetMatchDetailParams): Promise<MatchResponse> {
    return this.fetchWithRetry(
      this.url("/fconline/v1/match-detail", { matchid: params.matchid }),
      MatchResponseSchema
    );
  }

  async getRankerStats(params: GetRankerStatsParams): Promise<RankerStats> {
    return this.fetchWithRetry(
      this.url("/fconline/v1/ranker-stats", {
        matchtype: params.matchtype,
        players: params.players,
      }),
      RankerStatsSchema
    );
  }

  // Meta endpoints (static JSON, no auth needed but we include it anyway)
  async getMetaMatchTypes(): Promise<MetaMatchType[]> {
    return this.fetchWithRetry(
      this.url("/static/fconline/meta/matchtype.json"),
      MetaMatchTypeListSchema
    );
  }

  async getMetaSpIds(): Promise<MetaSpId[]> {
    return this.fetchWithRetry(
      this.url("/static/fconline/meta/spid.json"),
      MetaSpIdListSchema
    );
  }

  async getMetaSeasons(): Promise<MetaSeason[]> {
    return this.fetchWithRetry(
      this.url("/static/fconline/meta/seasonid.json"),
      MetaSeasonListSchema
    );
  }

  async getMetaPositions(): Promise<MetaPosition[]> {
    return this.fetchWithRetry(
      this.url("/static/fconline/meta/spposition.json"),
      MetaPositionListSchema
    );
  }

  async getMetaDivisions(): Promise<MetaDivision[]> {
    return this.fetchWithRetry(
      this.url("/static/fconline/meta/division.json"),
      MetaDivisionListSchema
    );
  }
}

/** Server-side singleton */
export function createNexonClient(): NexonApiClient {
  const apiKey = process.env.NEXON_API_KEY;
  if (!apiKey) throw new Error("NEXON_API_KEY is not set");
  return new NexonApiClient(apiKey);
}
