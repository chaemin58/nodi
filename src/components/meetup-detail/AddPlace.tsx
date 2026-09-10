"use client";

import SquarePlusBtn from "@/assets/icon/squre-plus.svg";
import { useState } from "react";
import { AddPlaceModal } from "./AddPlaceModal";

interface AddPlaceProps {
  meetupId: string;
}

export function AddPlace({ meetupId }: AddPlaceProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

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
