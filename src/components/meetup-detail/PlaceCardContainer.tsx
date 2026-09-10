"use client";

import { useState } from "react";
import { PlaceCard } from "./PlaceCard";
import type { PlaceWithProfile } from "@/api";

interface PlaceListProps {
  places: PlaceWithProfile[];
}

export function PlaceCardContainer({ places }: PlaceListProps) {
  const [selectedList, setSelectedList] = useState<string[]>([]);

  const handleToggle = (placeId: string) => {
    setSelectedList((prev) =>
      //이전의 값이 placeId를 가지고 있으면 빼주고 아니면 추가해준다.
      prev.includes(placeId) ? prev.filter((id) => id !== placeId) : [...prev, placeId],
    );
  };

  return (
    <>
      {places.map((place) => (
        <PlaceCard
          key={place.id}
          place={place}
          isSelected={selectedList.includes(place.id)}
          onToggle={() => handleToggle(place.id)}
        />
      ))}
    </>
  );
}
