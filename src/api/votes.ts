// 투표(votes) 데이터 접근 — 한 사람이 한 장소에 한 표 (unique 제약).
import type { DbClient } from "@/utils/supabase/types";
import type { Tables } from "@/types/database";
import { requireUserId } from "./auth";

export type VoteRow = Tables<"votes">;

/** 한 약속의 모든 투표 (places 조인으로 meetup 범위 필터) */
export async function getVotesByMeetup(supabase: DbClient, meetupId: string): Promise<VoteRow[]> {
  const { data, error } = await supabase
    .from("votes")
    .select("id, place_id, user_id, created_at, places!inner(meetup_id)")
    .eq("places.meetup_id", meetupId);
  if (error) throw error;
  // 조인 컬럼(places) 제거하고 VoteRow 형태만 반환
  return (data ?? []).map(({ id, place_id, user_id, created_at }) => ({
    id,
    place_id,
    user_id,
    created_at,
  }));
}

/** 장소별 득표 수 { placeId: count } */
export async function getVoteCounts(
  supabase: DbClient,
  meetupId: string,
): Promise<Record<string, number>> {
  const votes = await getVotesByMeetup(supabase, meetupId);
  const counts: Record<string, number> = {};
  for (const v of votes) {
    counts[v.place_id] = (counts[v.place_id] ?? 0) + 1;
  }
  return counts;
}

/** 이 약속에서 내가 투표한 place_id 목록 */
export async function getMyVotedPlaceIds(supabase: DbClient, meetupId: string): Promise<string[]> {
  const userId = await requireUserId(supabase);
  const votes = await getVotesByMeetup(supabase, meetupId);
  return votes.filter((v) => v.user_id === userId).map((v) => v.place_id);
}

/**
 * 내 투표를 placeIds로 맞춘다 — allPlaceIds(이 미팅의 후보 장소 전체)에 대한 내 기존 투표를
 * 전부 지우고, placeIds만 다시 넣는다 (diff 계산 없이 매번 갱신).
 */
export async function setMyVotes(
  supabase: DbClient,
  allPlaceIds: string[],
  placeIds: string[],
): Promise<void> {
  const userId = await requireUserId(supabase);

  const { error: deleteError } = await supabase
    .from("votes")
    .delete()
    .eq("user_id", userId)
    //리셋
    .in("place_id", allPlaceIds);

  if (deleteError) throw deleteError;

  //수정사항이 없으면 그냥 되돌림
  if (placeIds.length === 0) return;

  const { error: insertError } = await supabase
    .from("votes")
    .insert(placeIds.map((placeId) => ({ place_id: placeId, user_id: userId })));

  if (insertError) throw insertError;
}
