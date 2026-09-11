import { createClient } from "@/utils/supabase/server";
import { PlaceCardContainer } from "./PlaceCardContainer";
import { getPlaces } from "@/api";
import { Button } from "../Button/Button";

interface VotingPlaceProps {
  meetupId: string;
  votingList: string[];
  votedCount: Record<string, number>;
}

export async function VotingPlace({ meetupId, votingList, votedCount }: VotingPlaceProps) {
  const supabase = await createClient();
  const places = await getPlaces(supabase, meetupId);

  return (
    <div className="flex flex-col gap-2 md:gap-4 lg:max-w-200 lg:mt-10">
      <div className="flex justify-between items-center">
        <div className="text-xl font-semibold ">후보 장소</div>
        <Button className="w-37.5 h-11">장소 결정하기</Button>
      </div>
      <PlaceCardContainer
        votedCount={votedCount}
        places={places}
        meetupId={meetupId}
        votingList={votingList}
      />
    </div>
  );
}
