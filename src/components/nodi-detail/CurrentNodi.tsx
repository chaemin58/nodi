import { MeetupRow } from "@/api";
import { NodiThumnail } from "./NodiThumnail";
import { Badge } from "../Badge";
import type { BadgeKind } from "@/tokens/badges";
import Link from "next/link";

interface CurrentNodiProps {
  currentNodiList: MeetupRow[];
  groupId: string;
}

export function CurrentNodi({ currentNodiList, groupId }: CurrentNodiProps) {
  if (currentNodiList.length === 0) {
    return (
      <div className="border-border-default border-2 w-full lg:h-25 h-20 rounded-3xl flex items-center justify-center text-text-placeholder">
        진행 중인 약속이 없습니다
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {currentNodiList.map((currentNodi) => (
        <Link
          href={`/nodi-detail/${groupId}/meetup-detail/${currentNodi.id}`}
          key={currentNodi.id}
          className="border-primary border-2 w-full lg:h-25 h-20 rounded-3xl flex items-center pl-3 pr-8 justify-between cursor-pointer"
        >
          <div className="flex gap-1 items-center min-w-0">
            <NodiThumnail />
            <div className="flex flex-col mr-5 min-w-0">
              <div className="lg:text-[20px] text-md font-semibold truncate">
                {currentNodi.title}
              </div>
            </div>
            <Badge type={currentNodi.status as BadgeKind} />
          </div>
        </Link>
      ))}
    </div>
  );
}
