"use client";

import SquarePlusBtn from "@/assets/icon/squre-plus.svg";
import { useState } from "react";
import { AddPlaceModal } from "./AddPlaceModal";
import { MeetupRow } from "@/api";

interface AddPlaceProps {
  meetupId: string;
  meetup: MeetupRow;
}

export function AddPlace({ meetupId, meetup }: AddPlaceProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  if (meetup.status === "confirmed") return null;
  return (
    <>
      <div
        className="w-full min-h-15 cursor-pointer overflow-hidden border-border-default rounded-2xl bg-surface border-2 text-gray-400 border-dashed p-5 flex justify-center items-center gap-3 self-stretch"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        <SquarePlusBtn className="w-5 " />
        <div>장소 추가하기</div>
      </div>

      {isOpen && <AddPlaceModal meetupId={meetupId} onClose={() => setIsOpen(false)} />}
    </>
  );
}
