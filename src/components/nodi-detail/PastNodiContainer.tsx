import { MeetupRow } from "@/api";
import Logo from "@/assets/icon/logo-gray.svg";
import { PastNodi } from "./PastNodi";

interface PastNodiContainerProps {
  pastNodiList: MeetupRow[];
}

export function PastNodiContainer({ pastNodiList }: PastNodiContainerProps) {
  return (
    <div className="flex flex-col gap-3 lg:gap-5">
      <div className="flex gap-2.5 items-center">
        <Logo className="w-5.5 " />
        <div className="font-semibold lg:text-lg">지난 약속</div>
      </div>
      <PastNodi pastNodiList={pastNodiList} />
    </div>
  );
}
