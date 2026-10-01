-- ============================================
-- 010: 약속 썸네일 이모지 (emoji)
--
-- 약속마다 이모지 하나를 붙여 목록에서 빨리 알아보게 한다.
-- "🥞 주말 브런치", "🍻 금요일 한잔" 처럼 쓴다.
--
-- 이미 NodiThumnail 컴포넌트가 emoji 를 옵셔널로 받고,
-- 없으면 노디 로고를 보여주도록 만들어져 있다. 이 컬럼은 그 값을 담을 자리다.
--
-- 사용법: Supabase 프로젝트 → SQL Editor → 통째로 붙여넣고 Run
-- ============================================

-- null 허용 = "고르지 않음" → 로고 폴백. groups.status_message 와 같은 방침으로,
-- 기본값을 빈 문자열로 두지 않는다. "안 골랐다"와 "골랐다가 지웠다"를 굳이 나눌 이유가 없고
-- 폴백 분기가 null 하나만 보면 되게 단순해진다.
--
-- 길이 제한 16: 이모지 "한 글자"가 항상 코드포인트 1개가 아니다.
-- 👨‍👩‍👧‍👦 처럼 ZWJ 로 이어붙인 이모지는 7 코드포인트, 국기는 2 코드포인트다.
-- char_length 는 코드포인트를 세므로 넉넉히 잡되, 문장이 들어올 만큼 열어두지는 않는다.
--
-- 수정 권한은 meetups_update 정책을 그대로 따른다 (008에서 멤버 누구나로 열림).
alter table meetups
  add column emoji text check (char_length(emoji) <= 16);


-- get_my_groups_summary 가 current_meetup 안에 emoji 도 실어 보내게 한다.
-- 이걸 안 하면 컬럼은 생겼는데 모임 카드/진행 중인 약속에서는 여전히 못 읽는다.
-- (함수 본문은 기존과 동일하고 jsonb 에 emoji 한 줄만 추가됨)
create or replace function public.get_my_groups_summary()
returns table (
  id             uuid,
  name           text,
  type           text,
  color          text,
  created_at     timestamptz,
  member_count   bigint,
  meetup_count   bigint,
  members        jsonb,
  current_meetup jsonb
)
language sql security definer set search_path = public stable as $$
  select
    g.id, g.name, g.type, g.color, g.created_at,
    (select count(*) from group_members gm where gm.group_id = g.id) as member_count,
    (select count(*) from meetups m where m.group_id = g.id)         as meetup_count,
    (
      select coalesce(
        jsonb_agg(
          jsonb_build_object('id', p.id, 'nickname', p.nickname, 'avatar_url', p.avatar_url)
          order by gm.joined_at
        ),
        '[]'::jsonb
      )
      from group_members gm
      join profiles p on p.id = gm.user_id
      where gm.group_id = g.id
    ) as members,
    (
      select jsonb_build_object(
        'id',        m.id,
        'title',     m.title,
        'status',    m.status,
        'meet_date', m.meet_date,
        'emoji',     m.emoji,
        'place_count',
          (select count(*) from places pl where pl.meetup_id = m.id),
        'confirmed_place',
          (select pl.name from places pl
           where pl.meetup_id = m.id and pl.is_confirmed
           order by pl.course_order asc limit 1)
      )
      from meetups m
      where m.group_id = g.id
      order by m.created_at desc
      limit 1
    ) as current_meetup
  from groups g
  where exists (
    select 1 from group_members gm
    where gm.group_id = g.id and gm.user_id = auth.uid()
  )
  order by g.created_at desc;
$$;
