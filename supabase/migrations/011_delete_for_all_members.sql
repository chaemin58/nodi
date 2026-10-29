-- ============================================
-- 011: 약속·장소 삭제를 모임 멤버 누구나에게 연다
--
-- 008에서는 "약속·장소는 만든 사람만 삭제"로 막아뒀는데, 방장 없는 모델 그대로
-- "멤버 누구나"로 바꾼다.
--   - 모임 삭제: 없음 (008 그대로. 나가기만)
--   - 약속 삭제: 멤버 누구나, 단 아직 장소를 안 정한 약속('voting')만.
--     확정된 약속은 지우지 않고 status='cancelled'(취소됨)로 남긴다 (meetups_update 로 처리).
--   - 장소 삭제: 멤버 누구나 (하위 투표는 on delete cascade 로 같이 삭제)
--
-- ⚠️ 한 명이 실수로 지우면 모두의 데이터가 사라진다. 화면에서 확인 모달 필수.
--
-- 사용법: Supabase 프로젝트 → SQL Editor → 통째로 붙여넣고 Run
-- ============================================

alter policy "meetups_delete" on meetups
  using (is_group_member(group_id) and status = 'voting');

alter policy "places_delete" on places
  using (is_meetup_member(meetup_id));
