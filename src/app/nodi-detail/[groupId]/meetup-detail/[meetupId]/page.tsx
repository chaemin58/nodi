import { getGroup, getMeetup } from "@/api";
import { MeetupHeader } from "@/components/meetup-detail/MeetupHeader";
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
  console.log(meetup?.meet_date); //

  if (!meetup || !group) return <div>오류발생</div>;

  return (
    <div>
      {" "}
      <MeetupHeader
        groupTitle={group.name}
        meetupTitle={meetup.title}
        badge={meetup.status as BadgeKind}
        date={meetup.meet_date ?? ""}
      />
    </div>
  );
}
