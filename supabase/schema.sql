-- ============================================
-- Nodi v1 스키마 + RLS  (모임별 계층 구조)
-- 계층: 모임(groups) → 약속(meetups) → 후보장소(places) → 투표(votes)
-- 사용법: Supabase 프로젝트 → SQL Editor → 통째로 붙여넣고 Run
-- ============================================

-- ---------- 1. 테이블 ----------

-- 사용자 프로필 (로그인은 Supabase auth가 담당, 여기엔 표시정보만)
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  nickname   text not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- 모임 (지속되는 사람 그룹 = 카톡방 개념)
create table groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  owner_id    uuid not null references profiles(id) on delete cascade,
  type        text not null default 'friends',  -- 'friends'(v1) | 'couple'(v2) | 'family'
  invite_code text unique not null default gen_random_uuid()::text,  -- 초대 링크용 코드
  color       text not null default 'gray',  -- 카드 커버 색 (팔레트 토큰 이름, gray=미지정)
  status_message text check (char_length(status_message) <= 100),  -- 멤버 누구나 고치는 한 줄 (null=아직 없음)
  created_at  timestamptz default now()
);

-- 모임 참여자 (모임 <-> 사용자 다대다 연결)
create table group_members (
  id        uuid primary key default gen_random_uuid(),
  group_id  uuid not null references groups(id) on delete cascade,
  user_id   uuid not null references profiles(id) on delete cascade,
  role      text not null default 'member',  -- 'owner' | 'member'
  joined_at timestamptz default now(),
  unique (group_id, user_id)                 -- 같은 모임에 중복 참여 방지
);

-- 약속 (모임 안의 "어디 갈까" 한 번의 결정 라운드)
-- 확정 결과는 한 곳이 아니라 "코스"(여러 장소) → places.is_confirmed / course_order로 표현
create table meetups (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references groups(id) on delete cascade,
  title       text not null,
  created_by  uuid not null references profiles(id) on delete cascade,
  status      text not null default 'voting',   -- 'voting' | 'confirmed'
  meet_date   date,                              -- 약속 날짜(선택)
  emoji       text check (char_length(emoji) <= 16),  -- 썸네일 이모지 (null=미지정, 로고 폴백)
  is_shared   boolean not null default false,    -- 링크 공유 여부
  share_token text unique default gen_random_uuid()::text,
  created_at  timestamptz default now()
);

-- 후보 장소 (약속에 담김) — 카테고리 구분 없이 다 담고, 확정 시 코스로 묶음
create table places (
  id             uuid primary key default gen_random_uuid(),
  meetup_id      uuid not null references meetups(id) on delete cascade,
  name           text not null,
  category       text,                              -- '밥' | '카페' | '술' | '놀거리' 등 (자유)
  address        text,
  lat            double precision,
  lng            double precision,
  naver_place_id text,
  added_by       uuid not null references profiles(id) on delete cascade,
  is_confirmed   boolean not null default false,    -- 확정 코스에 포함됐나
  course_order   int,                               -- 코스 내 순서 (1,2,3...) — is_confirmed일 때만 사용
  created_at     timestamptz default now()
);

-- 투표 (한 사람이 한 장소에 한 표)
create table votes (
  id         uuid primary key default gen_random_uuid(),
  place_id   uuid not null references places(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (place_id, user_id)                 -- 중복투표 방지
);

-- 조회 속도용 인덱스
create index on meetups(group_id);
create index on places(meetup_id);
create index on votes(place_id);
create index on group_members(group_id, user_id);


-- ---------- 2. 회원가입 시 프로필 자동 생성 ----------

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nickname, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', '사용자'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ---------- 3. 권한 확인 도우미 함수 ----------
-- (RLS 무한루프를 피하려고 security definer로 만듦)

-- 이 모임의 멤버인가?
create or replace function public.is_group_member(_group_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from group_members
    where group_id = _group_id and user_id = auth.uid()
  );
$$;

-- 이 모임의 주인인가?
create or replace function public.is_group_owner(_group_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from groups
    where id = _group_id and owner_id = auth.uid()
  );
$$;

-- 초대 코드로 모임 미리보기 (멤버가 아니어도 호출 가능 — groups_select RLS는 안 거침.
-- security definer라 코드가 정확히 일치하는 한 행만 돌려주므로 전체 목록 유출 위험 없음)
create or replace function public.get_group_by_invite_code(_code text)
returns table (id uuid, name text, type text, color text, member_count bigint)
language sql security definer set search_path = public stable as $$
  select g.id, g.name, g.type, g.color,
    (select count(*) from group_members gm where gm.group_id = g.id) as member_count
  from groups g
  where g.invite_code = _code;
$$;

-- 이 약속을 볼 수 있나? (모임 멤버이거나, 공유된 약속이면 OK)
create or replace function public.can_view_meetup(_meetup_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from meetups m
    where m.id = _meetup_id
      and ( m.is_shared
            or exists (select 1 from group_members gm
                       where gm.group_id = m.group_id and gm.user_id = auth.uid()) )
  );
$$;

-- 이 약속이 속한 모임의 멤버인가? (장소·투표 추가 권한 확인용)
create or replace function public.is_meetup_member(_meetup_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from meetups m
    join group_members gm on gm.group_id = m.group_id
    where m.id = _meetup_id and gm.user_id = auth.uid()
  );
$$;

-- 이 약속이 속한 모임의 주인인가?
create or replace function public.is_meetup_group_owner(_meetup_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from meetups m
    join groups g on g.id = m.group_id
    where m.id = _meetup_id and g.owner_id = auth.uid()
  );
$$;

-- 모임 카드용 집계 (my-nodi 페이지) — 멤버수·아바타·약속수·최근 약속을 한 번에.
-- security definer + auth.uid() 필터로 내가 속한 모임만. 자세한 설명은 migrations/003 참고.
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


-- ---------- 4. RLS 켜기 ----------

alter table profiles      enable row level security;
alter table groups        enable row level security;
alter table group_members enable row level security;
alter table meetups       enable row level security;
alter table places        enable row level security;
alter table votes         enable row level security;


-- ---------- 5. 정책 ----------

-- profiles: 프로필은 공개 조회, 수정은 본인만
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_update" on profiles for update using (id = auth.uid());

-- groups: 멤버만 조회 / 생성은 본인이 만든 사람 / 수정은 멤버 누구나 / 삭제 없음
create policy "groups_select" on groups for select using (is_group_member(id));
create policy "groups_insert" on groups for insert with check (owner_id = auth.uid());
create policy "groups_update" on groups for update using (is_group_member(id));
-- 모임 삭제 정책 없음 — 방장 개념이 없으므로 삭제 대신 나가기만 한다(008).

-- group_members: 같은 모임 멤버 조회 / 본인이 참여 / 본인이 나가기 (강퇴 없음)
create policy "gmembers_select" on group_members for select using (is_group_member(group_id));
create policy "gmembers_insert" on group_members for insert
  with check (user_id = auth.uid());
create policy "gmembers_delete" on group_members for delete
  using (user_id = auth.uid());

-- meetups: 볼 수 있는 약속만 조회 / 모임 멤버가 생성(본인) / 멤버 누구나 수정 / 만든 본인만 삭제
create policy "meetups_select" on meetups for select using (can_view_meetup(id));
create policy "meetups_insert" on meetups for insert
  with check (is_group_member(group_id) and created_by = auth.uid());
create policy "meetups_update" on meetups for update
  using (is_group_member(group_id));
create policy "meetups_delete" on meetups for delete
  using (created_by = auth.uid());

-- places: 볼 수 있는 약속이면 조회 / 모임 멤버만 추가(본인 이름으로) / 멤버 누구나 수정 / 추가한 본인만 삭제
-- 참고: 코스 확정(is_confirmed·course_order 수정)도 이 update 정책을 따름.
--       "확정은 주최자만" 을 DB 레벨로 엄격히 막으려면 별도 meetup_course 테이블로 분리(추후).
create policy "places_select" on places for select using (can_view_meetup(meetup_id));
create policy "places_insert" on places for insert
  with check (is_meetup_member(meetup_id) and added_by = auth.uid());
create policy "places_update" on places for update
  using (added_by = auth.uid());
create policy "places_delete" on places for delete
  using (added_by = auth.uid() or is_meetup_group_owner(meetup_id));

-- votes: 볼 수 있는 약속이면 조회 / 모임 멤버만 본인 이름으로 투표 / 내 표만 취소
create policy "votes_select" on votes for select
  using (exists (select 1 from places p where p.id = place_id and can_view_meetup(p.meetup_id)));
create policy "votes_insert" on votes for insert
  with check (
    user_id = auth.uid()
    and exists (select 1 from places p where p.id = place_id and is_meetup_member(p.meetup_id))
  );
create policy "votes_delete" on votes for delete using (user_id = auth.uid());


-- ---------- 6. 실시간 반영 켜기 (약속·장소·투표 라이브 업데이트) ----------

alter publication supabase_realtime add table meetups;
alter publication supabase_realtime add table places;
alter publication supabase_realtime add table votes;
