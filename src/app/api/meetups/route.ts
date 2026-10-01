// POST /api/meetups
import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getSupabaseEnv } from "@/utils/supabase/env";

export async function POST(request: NextRequest) {
  const { groupId, title, meetDate } = await request.json();

  if (!groupId) {
    return Response.json({ error: "모임 정보가 필요합니다." }, { status: 400 });
  }
  if (!title || !title.trim()) {
    return Response.json({ error: "약속 이름이 필요합니다." }, { status: 400 });
  }

  // 날짜는 선택 — 안 정했으면 빈 문자열/undefined 로 오고, null 로 저장한다.
  if (meetDate && !/^\d{4}-\d{2}-\d{2}$/.test(meetDate)) {
    return Response.json({ error: "날짜 형식이 올바르지 않습니다." }, { status: 400 });
  }

  // 1: 쿠키에서 로그인 세션(토큰) 읽기
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { url, anonKey } = getSupabaseEnv();

  try {
    // 2: meetups 에 insert.
    //    created_by 를 직접 채워야 한다 — meetups_insert 정책이
    //    "is_group_member(group_id) and created_by = auth.uid()" 라서
    //    비워두면 RLS 에 막힌다. 그 모임의 멤버인지도 같은 정책이 검사한다.
    //
    //    status / is_shared / share_token 은 DB 기본값에 맡긴다.
    //    emoji 는 아직 안 받는다. meet_date 는 null 이면 "날짜 미정".
    //
    //    id 는 DB 기본값(gen_random_uuid)에 맡기지 않고 여기서 직접 만든다.
    //    insert 결과 행을 돌려받는 길(Prefer: return=representation)이 select 정책에
    //    막혀 있어서, 만든 약속의 id 를 알려면 미리 정해두는 수밖에 없다.
    //    브라우저가 보낸 값을 쓰면 남이 PK 를 정하게 되므로 반드시 서버에서 만든다.
    const meetupId = crypto.randomUUID();

    const res = await fetch(`${url}/rest/v1/meetups`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: meetupId,
        group_id: groupId,
        title: title.trim(),
        created_by: session.user.id,
        meet_date: meetDate || null,
      }),
    });

    if (!res.ok) {
      // 원인은 서버 로그로만 남긴다 (DB 에러 내용을 브라우저에 노출하지 않기 위해).
      console.error("[/api/meetups] insert 실패:", res.status, await res.text());
      return Response.json({ error: "약속 생성에 실패했어요." }, { status: 500 });
    }

    // 3) 위에서 정해둔 id 를 돌려준다 — 클라이언트가 약속 상세로 이동할 때 쓴다.
    //    (행 전체는 여전히 못 돌려받는다. 화면 갱신은 router.refresh() 로 다시 읽어온다.)
    return Response.json({ id: meetupId });
  } catch (err) {
    console.error("[/api/meetups] 약속 생성 실패:", err);
    return Response.json({ error: "약속 생성 중 오류가 발생했어요." }, { status: 500 });
  }
}
