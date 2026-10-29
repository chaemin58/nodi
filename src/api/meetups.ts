// 약속(meetups) 데이터 접근
// 계층: 모임(group) 안의 "이번에 어디 갈까" 한 번의 결정 라운드.
import type { DbClient } from "@/utils/supabase/types";
import type { Tables } from "@/types/database";
import type { MeetupStatus } from "@/types";
import { requireUserId } from "./auth";

export type MeetupRow = Tables<"meetups">;

/** 한 모임의 약속 목록 (최신순) */
export async function getMeetupsByGroup(supabase: DbClient, groupId: string): Promise<MeetupRow[]> {
  const { data, error } = await supabase
    .from("meetups")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

/** 약속 하나 (id 로) */
export async function getMeetup(supabase: DbClient, meetupId: string): Promise<MeetupRow | null> {
  const { data, error } = await supabase
    .from("meetups")
    .select("*")
    .eq("id", meetupId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** 공유 링크(share_token)로 약속 조회 — 비회원 공유 뷰용 */
export async function getMeetupByShareToken(
  supabase: DbClient,
  shareToken: string,
): Promise<MeetupRow | null> {
  const { data, error } = await supabase
    .from("meetups")
    .select("*")
    .eq("share_token", shareToken)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** 약속 생성 (모임 멤버만 — created_by=본인) */
export async function createMeetup(
  supabase: DbClient,
  input: { groupId: string; title: string; meetDate?: string | null },
): Promise<MeetupRow> {
  const userId = await requireUserId(supabase);
  const { data, error } = await supabase
    .from("meetups")
    .insert({
      group_id: input.groupId,
      title: input.title,
      meet_date: input.meetDate ?? null,
      created_by: userId,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/** 약속 상태 변경 ('voting' | 'confirmed') */
export async function setMeetupStatus(
  supabase: DbClient,
  meetupId: string,
  status: MeetupStatus,
): Promise<void> {
  const { error } = await supabase.from("meetups").update({ status }).eq("id", meetupId);
  if (error) throw error;
}

/** 약속 날짜 변경 (모임 멤버 누구나 — 'YYYY-MM-DD') */
export async function setMeetupDate(
  supabase: DbClient,
  meetupId: string,
  meetDate: string,
): Promise<void> {
  const { data, error } = await supabase
    .from("meetups")
    .update({ meet_date: meetDate })
    .eq("id", meetupId)
    .select("id");
  if (error) throw error;
  if (!data || data.length === 0) throw new Error("약속 날짜를 변경할 수 없습니다.");
}

/** 링크 공유 켜기/끄기 (비회원도 볼 수 있게) */
export async function setMeetupShared(
  supabase: DbClient,
  meetupId: string,
  isShared: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("meetups")
    .update({ is_shared: isShared })
    .eq("id", meetupId);
  if (error) throw error;
}

/** 약속 삭제 (만든 본인 or 모임 주인 — RLS가 강제) */
export async function deleteMeetup(supabase: DbClient, meetupId: string): Promise<void> {
  const { error } = await supabase.from("meetups").delete().eq("id", meetupId);
  if (error) throw error;
}
