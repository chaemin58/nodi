import { getDaysLastMeetingDays, getDaysSince } from "@/utils/date";

interface NodiHistoryBoardProps {
  startDate: Date;
  nodiCount: number;
  /** 마지막 약속일. 약속이 한 번도 없으면 null */
  lastNodi: Date | null;
  visitedPlaceCounter: number;
}

export function NodiHistoryBoard({
  startDate,
  nodiCount,
  lastNodi,
  visitedPlaceCounter,
}: NodiHistoryBoardProps) {
  const day = getDaysSince(startDate);
  const lastMeetingAgo = lastNodi ? `${getDaysLastMeetingDays(lastNodi)} 전` : "-";
  return (
    <div className="hidden lg:flex gap-41 ml-10">
      <div className="flex flex-col gap-2">
        <div className="text-lg font-semibold text-text-secondary">함께한 지</div>
        <div className="text-[22px] font-bold">{day}일</div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-lg font-semibold text-text-secondary">함께한 약속</div>
        <div className="text-[22px] font-bold">{nodiCount}회</div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-lg font-semibold text-text-secondary">마지막 만남</div>
        {/* @TODO 음수로 나오는 경우 있음 */}
        <div className="text-[22px] font-bold">{lastMeetingAgo}</div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-lg font-semibold text-text-secondary">다녀온 곳</div>
        <div className="text-[22px] font-bold">{visitedPlaceCounter}곳</div>
      </div>
    </div>
  );
}
