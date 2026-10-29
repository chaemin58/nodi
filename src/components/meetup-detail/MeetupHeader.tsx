"use client";

import { BadgeKind } from "@/tokens/badges";
import { Badge } from "../Badge";
import { formatDateKorean } from "@/utils/date";
import { useState } from "react";
import { SetMeetDateModal } from "./SetMeetDateModal";
import { MeetDateField } from "./MeetDateField";

interface MeetupHeader {
  meetupId: string;
  groupTitle: string;
  meetupTitle: string;
  date: string | null;
  badge: BadgeKind;
}

export function MeetupHeader({ meetupId, groupTitle, meetupTitle, date, badge }: MeetupHeader) {
  const isDateDecided = !!date;
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="flex min-w-100 flex-col gap-2 md:border-border-default w-full md:py-8 md:pl-8 md:border md:rounded-[29px] md:bg-white">
      <div className="text-text-placeholder text-sm">{groupTitle}</div>
      <div className="flex gap-3 md:gap-5 items-center ">
        <div className="text-xl md:text-3xl font-semibold">{meetupTitle}</div>
        <Badge type={badge} />
        <div className="flex items-center gap-2 text-sm md:text-base">
          {isDateDecided ? (
            <div>{formatDateKorean(date)}</div>
          ) : (
            <div className="text-text-placeholder">아직 날짜를 못 정했어요</div>
          )}
          <MeetDateField isDateDecided={isDateDecided} setIsOpen={setIsOpen} />
        </div>
      </div>
      {isOpen && (
        <SetMeetDateModal meetupId={meetupId} date={date} onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
}
