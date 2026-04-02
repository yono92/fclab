/**
 * Nexon FC Online OpenAPI - Zod Schemas & TypeScript Types
 *
 * 공식 문서 기반 (2026-04-02 Playwright 스크래핑)
 * Base URL: https://open.api.nexon.com
 * Image URL: https://fco.dn.nexoncdn.co.kr
 */
import { z } from "zod";

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
  ballPossesionSuc: z.number(),
  aerialTry: z.number(),
  aerialSuccess: z.number(),
  blockTry: z.number(),
  block: z.number(),
  tackleTry: z.number(),
  tackle: z.number(),
  yellowCards: z.number(),
  redCards: z.number(),
  spRating: z.number(),
});
export type PlayerStatus = z.infer<typeof PlayerStatusSchema>;

export const MatchPlayerSchema = z.object({
  spId: z.number(),
  spPosition: z.number(),
  spGrade: z.number(),
  status: PlayerStatusSchema,
});
export type MatchPlayer = z.infer<typeof MatchPlayerSchema>;

/** 슈팅 상세 */
export const ShootDetailItemSchema = z.object({
  goalTime: z.number(),
  x: z.number(),
  y: z.number(),
  type: z.number(),
  result: z.number(),
  spId: z.number(),
  spGrade: z.number(),
  spLevel: z.number(),
  spIdType: z.boolean().optional(),
  assist: z.boolean(),
  assistSpI: z.number().optional(),
  assistSpId: z.number().optional(),
  assistX: z.number(),
  assistY: z.number(),
  hitPost: z.boolean(),
  inPenalty: z.boolean(),
});
export type ShootDetailItem = z.infer<typeof ShootDetailItemSchema>;

/** 슈팅 요약 */
export const ShootSummarySchema = z.object({
  shootTotal: z.number(),
  effectiveShootTotal: z.number(),
  shootOutScore: z.number(),
  goalTotal: z.number(),
  goalTotalDisplay: z.number(),
  ownGoal: z.number(),
  shootHeading: z.number(),
  goalHeading: z.number(),
  shootFreekick: z.number(),
  goalFreekick: z.number(),
  shootInPenalty: z.number(),
  goalInPenalty: z.number(),
  shootOutPenalty: z.number(),
  goalOutPenalty: z.number(),
  shootPenaltyKick: z.number(),
  goalPenaltyKick: z.number(),
});
export type ShootSummary = z.infer<typeof ShootSummarySchema>;

/** 패스 요약 */
export const PassSummarySchema = z.object({
  passTry: z.number(),
  passSuccess: z.number(),
  shortPassTry: z.number(),
  shortPassSuccess: z.number(),
  longPassTry: z.number(),
  longPassSuccess: z.number(),
  bouncingLobPassTry: z.number(),
  bouncingLobPassSuccess: z.number(),
  drivenGroundPassTry: z.number(),
  drivenGroundPassSuccess: z.number(),
  throughPassTry: z.number(),
  throughPassSuccess: z.number(),
  lobbedThroughPassTry: z.number(),
  lobbedThroughPassSuccess: z.number(),
});
export type PassSummary = z.infer<typeof PassSummarySchema>;

/** 수비 요약 */
export const DefenceSummarySchema = z.object({
  blockTry: z.number(),
  blockSuccess: z.number(),
  tackleTry: z.number(),
  tackleSuccess: z.number(),
});
export type DefenceSummary = z.infer<typeof DefenceSummarySchema>;

/** 매치 상세 - 유저별 정보 */
export const MatchDetailSchema = z.object({
  seasonId: z.number(),
  matchResult: z.string(),
  matchEndType: z.number(),
  systemPause: z.number(),
  foul: z.number(),
  injury: z.number(),
  redCards: z.number(),
  yellowCards: z.number(),
  dribble: z.number(),
  cornerKick: z.number(),
  possession: z.number(),
  OffsideCount: z.number(),
  averageRating: z.number(),
  controller: z.string(),
});
export type MatchDetailInfo = z.infer<typeof MatchDetailSchema>;

/** 매치 정보 - 유저 한 명의 전체 매치 데이터 */
export const MatchInfoSchema = z.object({
  ouid: z.string(),
  nickname: z.string(),
  matchDetail: MatchDetailSchema,
  shoot: ShootSummarySchema,
  shootDetail: z.array(ShootDetailItemSchema),
  pass: PassSummarySchema,
  defence: DefenceSummarySchema,
  player: z.array(MatchPlayerSchema),
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
