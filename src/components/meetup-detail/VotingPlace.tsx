import { createClient } from "@/utils/supabase/server";
import { PlaceCardContainer } from "./PlaceCardContainer";
import { ConfirmPlaceButton } from "./ConfirmPlaceButton";
import { getPlaces, PlaceRow } from "@/api";

interface VotingPlaceProps {
  meetupId: string;
  votingList: string[];
  votedCount: Record<string, number>;
  confirmPlace: PlaceRow[];
}

export async function VotingPlace({
  confirmPlace,
  meetupId,
  votingList,
  votedCount,
}: VotingPlaceProps) {
  const supabase = await createClient();
  const places = await getPlaces(supabase, meetupId);

  return (
    <div className="flex flex-col gap-4 lg:max-w-200">
      <div className="flex justify-between items-center">
        <div className="text-xl font-semibold ">후보 장소</div>
        <ConfirmPlaceButton
          meetupId={meetupId}
          places={places}
          votedCount={votedCount}
          confirmPlace={confirmPlace}
        />
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
