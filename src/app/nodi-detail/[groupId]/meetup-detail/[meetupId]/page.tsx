import { getGroup, getMeetup, getMyVotedPlaceIds, getVoteCounts } from "@/api";
import { MeetupHeader } from "@/components/meetup-detail/MeetupHeader";
import { VotingPlace } from "@/components/meetup-detail/VotingPlace";
import { BadgeKind } from "@/tokens/badges";
import { createClient } from "@/utils/supabase/server";

export default async function MeetupDetailPage({
  params,
}: {
  params: Promise<{ groupId: string; meetupId: string }>;
}) {
  const { groupId, meetupId } = await params;

  const supabase = await createClient();

  const meetup = await getMeetup(supabase, meetupId);
  const group = await getGroup(supabase, groupId);

  //유저가 투표했는지 확인
  const votingList = await getMyVotedPlaceIds(supabase, meetupId);

  //장소별 득표 수 확인
  const votedCount = await getVoteCounts(supabase, meetupId);

  if (!meetup || !group) return <div>오류발생</div>;

  return (
    <div className="flex flex-col gap-2 md:gap-6">
      {" "}
      <MeetupHeader
        groupTitle={group.name}
        meetupTitle={meetup.title}
        badge={meetup.status as BadgeKind}
        date={meetup.meet_date ?? ""}
      />
      <VotingPlace meetupId={meetupId} votingList={votingList} votedCount={votedCount} />
    </div>
  );
}
