interface VoteCountBadgeProps {
  count: number;
}

export function VoteCountBadge({ count }: VoteCountBadgeProps) {
  let VotedCount;
  if (!count) {
    VotedCount = 0;
  } else {
    VotedCount = count;
  }
  return (
    <div className="bg-badge-vote-bg text-badge-vote-fg inline-flex rounded-md px-1.5 py-1 text-sm">
      {VotedCount}표
    </div>
  );
}
