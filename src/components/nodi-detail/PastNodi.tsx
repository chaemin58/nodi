import { MeetupRow } from "@/api";
import { NodiThumnail } from "./NodiThumnail";
import { Badge } from "../Badge";

interface PastNodiProps {
  pastNodiList: MeetupRow[];
}

export function PastNodi({ pastNodiList }: PastNodiProps) {
  if (pastNodiList.length === 0) {
    return (
      <div className="w-full lg:h-25 h-20 flex items-center justify-center text-text-placeholder border rounded-xl border-border-default shadow-card">
        지난 약속이 없습니다
      </div>
    );
  }
  return (
    <div className="border rounded-xl border-border-default shadow-card">
      <div className="flex flex-col gap-1">
        {pastNodiList.map((pastNodi) => (
          <div key={pastNodi.id} className="flex items-center gap-3 rounded-xl px-2 py-2.5">
            <NodiThumnail className="h-10 w-10 shrink-0 rounded-full" />
            <div className="flex min-w-0 flex-1 items-baseline gap-2">
              <div className="font-semibold truncate">{pastNodi.title}</div>
              {pastNodi.meet_date && (
                <div className="text-text-tertiary shrink-0 text-sm">
                  {new Date(pastNodi.meet_date).toLocaleDateString("ko-KR", {
                    month: "numeric",
                    day: "numeric",
                  })}
                </div>
              )}
            </div>
            <Badge type="past" />
          </div>
        ))}
      </div>
    </div>
  );
}
