import Logo from "@/assets/icon/logo.svg";
import CircleCheck from "@/assets/icon/circle-check.svg";
import { PlaceWithProfile } from "@/api";
import { cn } from "@/lib/utils";
import { VoteCountBadge } from "./VoteCountBadge";

interface PlaceCardProps {
  place: PlaceWithProfile;
  isSelected?: boolean;
  onToggle?: () => void;
  isUserVoted: boolean;
  isVotedCard?: boolean;
  votedCount: number;
}
export function PlaceCard({
  place,
  isSelected = false,
  onToggle,
  isUserVoted,
  isVotedCard = false,
  votedCount,
}: PlaceCardProps) {
  const { name, address, profiles } = place;

  return (
    <div
      className={`${isVotedCard ? "border-primary border-2 bg-[#F3FAF7]" : "border-border-default"} shadow-card flex items-center gap-3 rounded-2xl border px-4 py-6`}
    >
      <Logo className="w-9 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex gap-1">
          <div className="truncate font-semibold">{name}</div>
          <VoteCountBadge count={votedCount} />
        </div>

        <div className="text-text-placeholder truncate text-sm">
          <span>{address}</span>
          {profiles?.nickname && <span> • {profiles.nickname} 추천</span>}
        </div>
      </div>
      {!isUserVoted && (
        <CircleCheck
          onClick={onToggle}
          className={cn(
            "w-7 flex-shrink-0 cursor-pointer",
            isSelected ? "text-primary" : "text-gray-200",
          )}
        />
      )}
    </div>
  );
}
