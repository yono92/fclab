/**
 * Nexon FC Online OpenAPI - Zod Schemas & TypeScript Types
 *
 * 공식 문서 기반 (2026-04-02 Playwright 스크래핑)
 * Base URL: https://open.api.nexon.com
 * Image URL: https://fco.dn.nexoncdn.co.kr
 */
import { z } from "zod";

/** Nexon API returns null or undefined for some numeric fields */
const n = () => z.number().nullable().optional().transform((v) => v ?? 0);
const s = () => z.string().nullable().optional().transform((v) => v ?? "");

// ============================================================================
// 공통
// ============================================================================

export const NexonErrorSchema = z.object({
  error: z.object({
    name: z.string(),
    message: z.string(),
  }),
});
export type NexonError = z.infer<typeof NexonErrorSchema>;

// ============================================================================
// 1. 계정 정보 (User)
// ============================================================================

/** GET /fconline/v1/id?nickname={nickname} */
export const UserOuidSchema = z.object({
  ouid: z.string(),
});
export type UserOuid = z.infer<typeof UserOuidSchema>;

/** GET /fconline/v1/user/basic?ouid={ouid} */
export const UserBasicSchema = z.object({
  ouid: z.string(),
  nickname: z.string(),
  level: z.number(),
});
export type UserBasic = z.infer<typeof UserBasicSchema>;

/** GET /fconline/v1/user/maxdivision?ouid={ouid} */
export const MaxDivisionItemSchema = z.object({
  matchType: z.number(),
  division: z.number(),
  achievementDate: z.string(),
});
export const MaxDivisionSchema = z.array(MaxDivisionItemSchema);
export type MaxDivisionItem = z.infer<typeof MaxDivisionItemSchema>;
export type MaxDivision = z.infer<typeof MaxDivisionSchema>;

/** GET /fconline/v1/user/match?ouid={ouid}&matchtype={}&offset={}&limit={} */
export const MatchIdListSchema = z.array(z.string());
export type MatchIdList = z.infer<typeof MatchIdListSchema>;

/** GET /fconline/v1/user/trade?tradetype={buy|sell}&offset={}&limit={} */
export const TradeItemSchema = z.object({
  tradeDate: z.string(),
  saleSn: z.string(),
  spid: z.number(),
  grade: z.number(),
  value: z.number(),
});
export const TradeListSchema = z.array(TradeItemSchema);
export type TradeItem = z.infer<typeof TradeItemSchema>;
export type TradeList = z.infer<typeof TradeListSchema>;

// ============================================================================
// 2. 매치 정보 (Match)
// ============================================================================

/** 매치 내 선수 개별 스탯 */
export const PlayerStatusSchema = z.object({
  shoot: n(),
  effectiveShoot: n(),
  assist: n(),
  goal: n(),
  dribble: n(),
  intercept: n(),
  defending: n(),
  passTry: n(),
  passSuccess: n(),
  dribbleTry: n(),
  dribbleSuccess: n(),
  ballPossesionTry: n(),
  ballPossesionSuc: n(),
  aerialTry: n(),
  aerialSuccess: n(),
  blockTry: n(),
  block: n(),
  tackleTry: n(),
  tackle: n(),
  yellowCards: n(),
  redCards: n(),
  spRating: n(),
});
export type PlayerStatus = z.infer<typeof PlayerStatusSchema>;

export const MatchPlayerSchema = z.object({
  spId: n(),
  spPosition: n(),
  spGrade: n(),
  status: PlayerStatusSchema,
});
export type MatchPlayer = z.infer<typeof MatchPlayerSchema>;

/** 슈팅 상세 */
export const ShootDetailItemSchema = z.object({
  goalTime: n(),
  x: n(),
  y: n(),
  type: n(),
  result: n(),
  spId: n(),
  spGrade: n(),
  spLevel: n(),
  spIdType: z.boolean().optional(),
  assist: z.boolean().nullable().optional().transform((v) => v ?? false),
  assistSpI: n(),
  assistSpId: n(),
  assistX: n(),
  assistY: n(),
  hitPost: z.boolean().nullable().optional().transform((v) => v ?? false),
  inPenalty: z.boolean().nullable().optional().transform((v) => v ?? false),
});
export type ShootDetailItem = z.infer<typeof ShootDetailItemSchema>;

/** 슈팅 요약 */
export const ShootSummarySchema = z.object({
  shootTotal: n(),
  effectiveShootTotal: n(),
  shootOutScore: n(),
  goalTotal: n(),
  goalTotalDisplay: n(),
  ownGoal: n(),
  shootHeading: n(),
  goalHeading: n(),
  shootFreekick: n(),
  goalFreekick: n(),
  shootInPenalty: n(),
  goalInPenalty: n(),
  shootOutPenalty: n(),
  goalOutPenalty: n(),
  shootPenaltyKick: n(),
  goalPenaltyKick: n(),
});
export type ShootSummary = z.infer<typeof ShootSummarySchema>;

/** 패스 요약 */
export const PassSummarySchema = z.object({
  passTry: n(),
  passSuccess: n(),
  shortPassTry: n(),
  shortPassSuccess: n(),
  longPassTry: n(),
  longPassSuccess: n(),
  bouncingLobPassTry: n(),
  bouncingLobPassSuccess: n(),
  drivenGroundPassTry: n(),
  drivenGroundPassSuccess: n(),
  throughPassTry: n(),
  throughPassSuccess: n(),
  lobbedThroughPassTry: n(),
  lobbedThroughPassSuccess: n(),
});
export type PassSummary = z.infer<typeof PassSummarySchema>;

/** 수비 요약 */
export const DefenceSummarySchema = z.object({
  blockTry: n(),
  blockSuccess: n(),
  tackleTry: n(),
  tackleSuccess: n(),
});
export type DefenceSummary = z.infer<typeof DefenceSummarySchema>;

/** 매치 상세 - 유저별 정보 */
export const MatchDetailSchema = z.object({
  seasonId: n(),
  matchResult: s(),
  matchEndType: n(),
  systemPause: n(),
  foul: n(),
  injury: n(),
  redCards: n(),
  yellowCards: n(),
  dribble: n(),
  cornerKick: n(),
  possession: n(),
  OffsideCount: n(),
  averageRating: n(),
  controller: s(),
});
export type MatchDetailInfo = z.infer<typeof MatchDetailSchema>;

/** 매치 정보 - 유저 한 명의 전체 매치 데이터 */
export const MatchInfoSchema = z.object({
  ouid: z.string(),
  nickname: z.string().nullable().optional().transform((v) => v ?? ""),
  matchDetail: MatchDetailSchema,
  shoot: ShootSummarySchema,
  shootDetail: z.array(ShootDetailItemSchema).optional().default([]),
  pass: PassSummarySchema,
  defence: DefenceSummarySchema,
  player: z.array(MatchPlayerSchema).optional().default([]),
});
export type MatchInfo = z.infer<typeof MatchInfoSchema>;

/** GET /fconline/v1/match-detail?matchid={matchid} */
export const MatchResponseSchema = z.object({
  matchId: z.string(),
  matchDate: z.string(),
  matchType: z.number(),
  matchInfo: z.array(MatchInfoSchema),
});
export type MatchResponse = z.infer<typeof MatchResponseSchema>;

// ============================================================================
// 3. 랭커 정보 (Ranker)
// ============================================================================

export const RankerPlayerStatusSchema = z.object({
  shoot: z.number(),
  effectiveShoot: z.number(),
  assist: z.number(),
  goal: z.number(),
  dribble: z.number(),
  intercept: z.number(),
  defending: z.number(),
  passTry: z.number(),
  passSuccess: z.number(),
  dribbleTry: z.number(),
  dribbleSuccess: z.number(),
  ballPossesionTry: z.number(),
  ballPossesionSuccess: z.number(),
  aerialTry: z.number(),
  aerialSuccess: z.number(),
  blockTry: z.number(),
  block: z.number(),
  tackleTry: z.number(),
  tackle: z.number(),
  spRating: z.number(),
});
export type RankerPlayerStatus = z.infer<typeof RankerPlayerStatusSchema>;

export const RankerPlayerSchema = z.object({
  spId: z.number(),
  spPosition: z.number(),
  status: RankerPlayerStatusSchema,
});
export type RankerPlayer = z.infer<typeof RankerPlayerSchema>;

/** GET /fconline/v1/ranker-stats?matchtype={}&players={spid} */
export const RankerStatsItemSchema = z.object({
  matchType: z.number(),
  players: z.array(RankerPlayerSchema),
  createDate: z.string(),
});
export const RankerStatsSchema = z.array(RankerStatsItemSchema);
export type RankerStatsItem = z.infer<typeof RankerStatsItemSchema>;
export type RankerStats = z.infer<typeof RankerStatsSchema>;

// ============================================================================
// 4. 메타데이터 (MetaData)
// ============================================================================

export const MetaMatchTypeSchema = z.object({
  matchtype: z.number(),
  desc: z.string(),
});
export const MetaMatchTypeListSchema = z.array(MetaMatchTypeSchema);
export type MetaMatchType = z.infer<typeof MetaMatchTypeSchema>;

export const MetaSpIdSchema = z.object({
  id: z.number(),
  name: z.string(),
});
export const MetaSpIdListSchema = z.array(MetaSpIdSchema);
export type MetaSpId = z.infer<typeof MetaSpIdSchema>;

export const MetaSeasonSchema = z.object({
  seasonId: z.number(),
  className: z.string(),
  seasonImg: z.string(),
});
export const MetaSeasonListSchema = z.array(MetaSeasonSchema);
export type MetaSeason = z.infer<typeof MetaSeasonSchema>;

export const MetaPositionSchema = z.object({
  spposition: z.number(),
  desc: z.string(),
});
export const MetaPositionListSchema = z.array(MetaPositionSchema);
export type MetaPosition = z.infer<typeof MetaPositionSchema>;

export const MetaDivisionSchema = z.object({
  divisionId: z.number(),
  divisionName: z.string(),
});
export const MetaDivisionListSchema = z.array(MetaDivisionSchema);
export type MetaDivision = z.infer<typeof MetaDivisionSchema>;

export const MetaDivisionVoltaSchema = z.object({
  divisionId: z.number(),
  divisionName: z.string(),
});
export const MetaDivisionVoltaListSchema = z.array(MetaDivisionVoltaSchema);
export type MetaDivisionVolta = z.infer<typeof MetaDivisionVoltaSchema>;

// ============================================================================
// 5. 이미지 URL 헬퍼
// ============================================================================

const IMAGE_BASE = "https://fco.dn.nexoncdn.co.kr";

export const ImageUrl = {
  playerAction: (spid: number) =>
    `${IMAGE_BASE}/live/externalAssets/common/playersAction/p${spid}.png`,
  playerActionByPid: (pid: number) =>
    `${IMAGE_BASE}/live/externalAssets/common/playersAction/p${pid}.png`,
  player: (spid: number) =>
    `${IMAGE_BASE}/live/externalAssets/common/players/p${spid}.png`,
  playerByPid: (pid: number) =>
    `${IMAGE_BASE}/live/externalAssets/common/players/p${pid}.png`,
} as const;

// ============================================================================
// 6. API 클라이언트 타입
// ============================================================================

export const NEXON_API_BASE = "https://open.api.nexon.com";
export const NEXON_META_BASE = "https://open.api.nexon.com";

export interface GetOuidParams {
  nickname: string;
}

export interface GetUserBasicParams {
  ouid: string;
}

export interface GetUserMatchParams {
  ouid: string;
  matchtype: number;
  offset?: number;
  limit?: number;
}

export interface GetUserTradeParams {
  tradetype: "buy" | "sell";
  offset?: number;
  limit?: number;
}

export interface GetAllMatchParams {
  matchtype: number;
  offset?: number;
  limit?: number;
  orderby?: "desc" | "asc";
}

export interface GetMatchDetailParams {
  matchid: string;
}

export interface GetRankerStatsParams {
  matchtype: number;
  players: number;
}
