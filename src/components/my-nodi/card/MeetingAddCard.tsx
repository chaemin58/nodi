"use client";

import SquarePlus from "@/assets/icon/squre-plus.svg";
import { useAddMeetingModal } from "@/hooks/useAddMeetingModal";

export function MeetingAddCard() {
  const modal = useAddMeetingModal();

  return (
    <div
      onClick={() => modal?.open()}
      className="w-full md:min-h-68 lg:min-h-70 cursor-pointer overflow-hidden border-border-default rounded-2xl bg-surface border-2 border-dashed p-5 flex flex-col justify-center items-center gap-3 self-stretch"
    >
      <SquarePlus className="w-10 text-gray-400" />
      <div className="flex items-center justify-center font-semibold text-gray-400">
        모임 생성하기
      </div>
    </div>
  );
}
