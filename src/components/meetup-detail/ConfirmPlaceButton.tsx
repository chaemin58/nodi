"use client";

import { useState } from "react";
import { Button } from "../Button/Button";
import { ConfirmPlaceModal } from "./ConfirmPlaceModal";
import type { PlaceRow, PlaceWithProfile } from "@/api";

interface ConfirmPlaceButtonProps {
  meetupId: string;
  places: PlaceWithProfile[];
  votedCount: Record<string, number>;
  confirmPlace: PlaceRow[];
}

export function ConfirmPlaceButton({
  meetupId,
  places,
  votedCount,
  confirmPlace,
}: ConfirmPlaceButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        disabled={places.length === 0}
        className="w-37.5 h-11"
        onClick={() => setIsOpen(true)}
      >
        장소 결정하기
      </Button>

      {isOpen && (
        <ConfirmPlaceModal
          confirmPlace={confirmPlace}
          votedCount={votedCount}
          meetupId={meetupId}
          places={places}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
