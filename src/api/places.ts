// 후보 장소(places) 데이터 접근
// "확정 = 코스": 한 곳이 아니라 여러 장소를 순서대로 묶는다.
//   places.is_confirmed(코스 포함 여부) + places.course_order(순서)로 표현.
import type { DbClient } from "@/utils/supabase/types";
import type { Tables, InsertDto } from "@/types/database";
import { requireUserId } from "./auth";

export type PlaceRow = Tables<"places">;
export type PlaceWithProfile = PlaceRow & { profiles: { nickname: string } | null };

/** 한 약속의 후보 장소 목록 (담은 순서대로) */
export async function getPlaces(supabase: DbClient, meetupId: string): Promise<PlaceWithProfile[]> {
  const { data, error } = await supabase
    .from("places")
    .select("*, profiles(nickname)")
    .eq("meetup_id", meetupId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

/** 확정된 코스(is_confirmed) 만, 순서대로 */
export async function getConfirmedCourse(
  supabase: DbClient,
  meetupId: string,
): Promise<PlaceRow[]> {
  const { data, error } = await supabase
    .from("places")
    .select("*")
    .eq("meetup_id", meetupId)
    .eq("is_confirmed", true)
    .order("course_order", { ascending: true });
  if (error) throw error;
  return data;
}

/** 후보 장소 추가 (모임 멤버만 — added_by=본인) */
export async function addPlace(
  supabase: DbClient,
  input: {
    meetupId: string;
    name: string;
    category?: string | null;
    address?: string | null;
    lat?: number | null;
    lng?: number | null;
    naverPlaceId?: string | null;
  },
): Promise<PlaceRow> {
  const userId = await requireUserId(supabase);
  const row: InsertDto<"places"> = {
    meetup_id: input.meetupId,
    name: input.name,
    category: input.category ?? null,
    address: input.address ?? null,
    lat: input.lat ?? null,
    lng: input.lng ?? null,
    naver_place_id: input.naverPlaceId ?? null,
    added_by: userId,
  };
  const { data, error } = await supabase.from("places").insert(row).select("*").single();
  if (error) throw error;
  return data;
}

/** 후보 장소 삭제 (담은 본인 or 모임 주인 — RLS가 강제) */
export async function deletePlace(supabase: DbClient, placeId: string): Promise<void> {
  const { error } = await supabase.from("places").delete().eq("id", placeId);
  if (error) throw error;
}

/**
 * 코스 확정: 선택한 장소들을 순서대로 코스로 묶는다.
 * orderedPlaceIds 의 순서가 곧 course_order(1,2,3...).
 * 같은 약속의 나머지 장소는 코스에서 제외(is_confirmed=false).
 *
 * 주의: 여러 update 를 순차 실행 (DB 트랜잭션이 아님).
 *   엄격한 원자성이 필요해지면 Postgres 함수(RPC)로 옮기는 걸 권장.
 */
export async function confirmCourse(
  supabase: DbClient,
  meetupId: string,
  orderedPlaceIds: string[],
): Promise<void> {
  // 1) 이 약속의 모든 장소를 코스에서 초기화
  const { error: resetError } = await supabase
    .from("places")
    .update({ is_confirmed: false, course_order: null })
    .eq("meetup_id", meetupId);
  if (resetError) throw resetError;

  // 2) 선택한 장소만 순서대로 코스에 포함
  for (let i = 0; i < orderedPlaceIds.length; i++) {
    const { error } = await supabase
      .from("places")
      .update({ is_confirmed: true, course_order: i + 1 })
      .eq("id", orderedPlaceIds[i])
      .eq("meetup_id", meetupId); // 다른 약속 장소 오염 방지
    if (error) throw error;
  }
}

/** 코스 확정 해제 (다시 정하는 중으로) */
export async function clearCourse(supabase: DbClient, meetupId: string): Promise<void> {
  const { error } = await supabase
    .from("places")
    .update({ is_confirmed: false, course_order: null })
    .eq("meetup_id", meetupId);
  if (error) throw error;
}
