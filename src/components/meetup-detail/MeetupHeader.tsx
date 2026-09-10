import { BadgeKind } from "@/tokens/badges";
import { Badge } from "../Badge";
import { formatDateKorean } from "@/utils/date";

interface MeetupHeader {
  groupTitle: string;
  meetupTitle: string;
  date: string;
  badge: BadgeKind;
}

export function MeetupHeader({ groupTitle, meetupTitle, date, badge }: MeetupHeader) {
  return (
    <div className="flex min-w-100 flex-col gap-2 md:border-border-default w-full md:py-8 md:pl-8 md:border md:rounded-[29px] md:bg-white">
      <div className="text-text-placeholder text-sm">{groupTitle}</div>
      <div className="flex gap-3 md:gap-5 items-center ">
        <div className="text-xl md:text-3xl font-semibold">{meetupTitle}</div>
        <Badge type={badge} />
        <div>{formatDateKorean(date)}</div>
      </div>
    </div>
  );
}
