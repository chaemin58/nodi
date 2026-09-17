"use client";

import { useState } from "react";
import { Button } from "../Button/Button";
import { ConfirmPlaceModal } from "./ConfirmPlaceModal";
import type { PlaceWithProfile } from "@/api";

interface ConfirmPlaceButtonProps {
  meetupId: string;
  places: PlaceWithProfile[];
  votedCount: Record<string, number>;
}

export function ConfirmPlaceButton({ meetupId, places, votedCount }: ConfirmPlaceButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button className="w-37.5 h-11" onClick={() => setIsOpen(true)}>
        장소 결정하기
      </Button>

      {isOpen && (
        <ConfirmPlaceModal
          votedCount={votedCount}
          meetupId={meetupId}
          places={places}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
