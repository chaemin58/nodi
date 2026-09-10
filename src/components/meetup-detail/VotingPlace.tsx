import { createClient } from "@/utils/supabase/server";
import { AddPlace } from "./AddPlace";
import { PlaceCardContainer } from "./PlaceCardContainer";
import { getPlaces } from "@/api";
import { Button } from "../Button/Button";

interface VotingPlaceProps {
  meetupId: string;
}

export async function VotingPlace({ meetupId }: VotingPlaceProps) {
  const supabase = await createClient();
  const places = await getPlaces(supabase, meetupId);
  return (
    <div className="flex flex-col gap-2 md:gap-4 lg:max-w-200 lg:mt-10">
      <div className="flex justify-between items-center">
        <div className="text-xl font-semibold ">후보 장소</div>
        <Button className="w-37.5 h-11">장소 결정하기</Button>
      </div>
      <PlaceCardContainer places={places} />
      <AddPlace meetupId={meetupId} />
      <Button className="bg-black hover:bg-gray-800 active:bg-gray-950">투표하기</Button>
    </div>
  );
}
