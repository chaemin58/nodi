import type { BadgeKind } from "@/tokens/badges";
import { AvatarGroup, type AvatarGroupMember } from "@/components/avatar";
import { GroupInfo } from "./GroupInfo";
import { StatusDisplay } from "./StatusDisplay";
import { coverColorVar } from "@/tokens/groupColors";
import Link from "next/link";

interface NodiCardProps {
  id: string;
  title: string;
  badgeType?: BadgeKind;
  headCount: number;
  meetingCount: number;
  members: AvatarGroupMember[];
  lastMeetingText?: string;
  name: string;
  url?: string;
  option?: number;
  color?: string;
}

export function NodiCard({
  id,
  title,
  badgeType,
  headCount,
  meetingCount,
  members,
  lastMeetingText,
  name,
  url,
  option,
  color,
}: NodiCardProps) {
  return (
    <div className="relative">
      <Link href={`/nodi-detail/${id}`} aria-label={title} className="absolute inset-0 z-10" />
      <div className="w-full min-h-68 lg:min-h-70 cursor-pointer overflow-hidden border-border border-border-default rounded-2xl border bg-surface shadow-sm self-stretch">
        {/* 커버 + 멤버 아바타 */}
        <div
          className="relative h-28 w-full"
          style={{ backgroundColor: coverColorVar(color) }}
        ></div>
        <div className="px-3 -mt-4">
          <div className="inline-flex rounded-full bg-surface/40 p-1 backdrop-blur-sm">
            <AvatarGroup members={members} max={4} size={36} />
          </div>
        </div>

        {/* 본문 */}
        <div className="flex flex-col gap-3 p-4 lg:gap-5">
          <GroupInfo
            title={title}
            badgeType={badgeType}
            headCount={headCount}
            meetingCount={meetingCount}
          />
          {(badgeType === "voting" || badgeType === "confirmed") && (
            <StatusDisplay type={badgeType} title={name} options={option} url={url} />
          )}
          {badgeType === "past" && lastMeetingText && (
            <p className="text-right text-xs text-muted">{lastMeetingText}일 전 마지막 모임</p>
          )}
        </div>
      </div>
    </div>
  );
}
