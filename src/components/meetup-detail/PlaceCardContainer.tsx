"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlaceCard } from "./PlaceCard";
import { setMyVotes, type PlaceWithProfile } from "@/api";
import { AddPlace } from "./AddPlace";
import { Button } from "../Button/Button";
import { createClient } from "@/utils/supabase/client";
import { CATEGORIES } from "./AddPlaceModal";
import { EmptyPlace } from "./EmptyPlace";

interface PlaceListProps {
  places: PlaceWithProfile[];
  meetupId: string;
  votingList: string[];
  votedCount: Record<string, number>;
}

export function PlaceCardContainer({ places, meetupId, votingList, votedCount }: PlaceListProps) {
  const [selectedList, setSelectedList] = useState<string[]>(votingList);
  const [isVoted, setIsVoted] = useState<boolean>(votingList.length !== 0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleToggle = (placeId: string) => {
    setSelectedList((prev) =>
      //이전의 값이 placeId를 가지고 있으면 빼주고 아니면 추가해준다.
      prev.includes(placeId) ? prev.filter((id) => id !== placeId) : [...prev, placeId],
    );
  };

  const router = useRouter();

  const handleVoting = async () => {
    const supabase = createClient();
    try {
      setIsLoading(true);
      await setMyVotes(
        supabase,
        places.map((place) => place.id),
        selectedList,
      );
      setIsVoted(true);
      router.refresh();
    } catch (error) {
      console.error("투표 오류 ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVotingAgain = () => {
    //UI만 바꿔주기 -readonly에서 투표가 가능하도록
    setSelectedList(votingList);
    setIsVoted(false);
  };

  return (
    <div className="flex flex-col gap-2 md:gap-4">
      {places.length === 0 ? (
        <EmptyPlace />
      ) : (
        CATEGORIES.map((category) => {
          const categoryList = places.filter((place) => place.category === category);
          if (categoryList.length === 0) return null;
          return (
            <div key={category} className="flex flex-col gap-2">
              <div className="border-primary border-l-4 pl-2 text-sm font-semibold text-text-primary">
                {category}
              </div>
              {categoryList.map((place) => {
                return (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    isSelected={selectedList.includes(place.id)}
                    onToggle={() => handleToggle(place.id)}
                    isUserVoted={isVoted}
                    isVotedCard={isVoted && selectedList.includes(place.id)}
                    votedCount={votedCount[place.id]}
                  />
                );
              })}
            </div>
          );
        })
      )}

      <AddPlace meetupId={meetupId} />
      <Button
        className="bg-black hover:bg-gray-800 active:bg-gray-950"
        onClick={isVoted ? handleVotingAgain : handleVoting}
        disabled={isLoading}
      >
        {isVoted ? "다시 투표하기" : "투표하기"}
      </Button>
    </div>
  );
}
