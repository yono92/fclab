/**
 * FCLab 분석 결과 DB 저장
 * 대시보드에서 분석 후 Supabase fclab 스키마에 저장
 */

import { createSupabaseServiceClient } from "@/lib/supabase";
import type { MatchResponse, MatchInfo, UserBasic } from "@/types/nexon";

export async function persistAnalysis(
  user: UserBasic,
  matches: MatchResponse[],
  allMyStats: MatchInfo[]
): Promise<void> {
  const supabase = createSupabaseServiceClient();

  // 1. Upsert user
  await supabase.from("users").upsert(
    {
      ouid: user.ouid,
      nickname: user.nickname,
      level: user.level,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "ouid" }
  );

  // 2. Upsert matches
  for (const m of matches) {
    await supabase.from("matches").upsert(
      {
        match_id: m.matchId,
        match_date: m.matchDate,
        match_type: m.matchType,
      },
      { onConflict: "match_id" }
    );

    // 3. Upsert match_user_stats for all players in the match
    for (const info of m.matchInfo) {
      const d = info.matchDetail;
      const s = info.shoot;
      const p = info.pass;
      const def = info.defence;

      await supabase.from("match_user_stats").upsert(
        {
          match_id: m.matchId,
          ouid: info.ouid,
          nickname: info.nickname,
          season_id: d.seasonId,
          match_result: d.matchResult,
          match_end_type: d.matchEndType,
          foul: d.foul,
          injury: d.injury,
          red_cards: d.redCards,
          yellow_cards: d.yellowCards,
          dribble: d.dribble,
          corner_kick: d.cornerKick,
          possession: d.possession,
          offside_count: d.OffsideCount,
          average_rating: d.averageRating,
          controller: d.controller,
          shoot_total: s.shootTotal,
          effective_shoot_total: s.effectiveShootTotal,
          shoot_out_score: s.shootOutScore,
          goal_total: s.goalTotal,
          goal_total_display: s.goalTotalDisplay,
          own_goal: s.ownGoal,
          shoot_heading: s.shootHeading,
          goal_heading: s.goalHeading,
          shoot_freekick: s.shootFreekick,
          goal_freekick: s.goalFreekick,
          shoot_in_penalty: s.shootInPenalty,
          goal_in_penalty: s.goalInPenalty,
          shoot_out_penalty: s.shootOutPenalty,
          goal_out_penalty: s.goalOutPenalty,
          shoot_penalty_kick: s.shootPenaltyKick,
          goal_penalty_kick: s.goalPenaltyKick,
          pass_try: p.passTry,
          pass_success: p.passSuccess,
          short_pass_try: p.shortPassTry,
          short_pass_success: p.shortPassSuccess,
          long_pass_try: p.longPassTry,
          long_pass_success: p.longPassSuccess,
          bouncing_lob_pass_try: p.bouncingLobPassTry,
          bouncing_lob_pass_success: p.bouncingLobPassSuccess,
          driven_ground_pass_try: p.drivenGroundPassTry,
          driven_ground_pass_success: p.drivenGroundPassSuccess,
          through_pass_try: p.throughPassTry,
          through_pass_success: p.throughPassSuccess,
          lobbied_through_pass_try: p.lobbedThroughPassTry,
          lobbied_through_pass_success: p.lobbedThroughPassSuccess,
          block_try: def.blockTry,
          block_success: def.blockSuccess,
          tackle_try: def.tackleTry,
          tackle_success: def.tackleSuccess,
        },
        { onConflict: "match_id,ouid" }
      );

      // 4. Upsert shoot details
      for (const shot of info.shootDetail) {
        await supabase.from("match_shoot_details").insert({
          match_id: m.matchId,
          ouid: info.ouid,
          goal_time: shot.goalTime,
          x: shot.x,
          y: shot.y,
          shoot_type: shot.type,
          result: shot.result,
          sp_id: shot.spId,
          sp_grade: shot.spGrade,
          sp_level: shot.spLevel,
          assist: shot.assist,
          assist_sp_id: shot.assistSpId,
          assist_x: shot.assistX,
          assist_y: shot.assistY,
          hit_post: shot.hitPost,
          in_penalty: shot.inPenalty,
        });
      }

      // 5. Upsert player stats
      for (const player of info.player) {
        await supabase.from("match_player_stats").insert({
          match_id: m.matchId,
          ouid: info.ouid,
          sp_id: player.spId,
          sp_position: player.spPosition,
          sp_grade: player.spGrade,
          ...player.status,
          sp_rating: player.status.spRating,
          pass_try: player.status.passTry,
          pass_success: player.status.passSuccess,
          dribble_try: player.status.dribbleTry,
          dribble_success: player.status.dribbleSuccess,
          ball_possesion_try: player.status.ballPossesionTry,
          ball_possesion_suc: player.status.ballPossesionSuc,
          aerial_try: player.status.aerialTry,
          aerial_success: player.status.aerialSuccess,
          block_try: player.status.blockTry,
          block: player.status.block,
          tackle_try: player.status.tackleTry,
          tackle: player.status.tackle,
          yellow_cards: player.status.yellowCards,
          red_cards: player.status.redCards,
        });
      }
    }
  }
}
