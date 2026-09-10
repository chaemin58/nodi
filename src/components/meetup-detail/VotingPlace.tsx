import { AddPlace } from "./AddPlace";

interface VotingPlaceProps {
  meetupId: string;
}

export function VotingPlace({ meetupId }: VotingPlaceProps) {
  return <AddPlace meetupId={meetupId} />;
}
