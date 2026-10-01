import Logo from "@/assets/icon/logo.svg";
import { CreateMeetupButton } from "./CreateMeetupButton";
import { CurrentNodi } from "./CurrentNodi";
import { MeetupRow } from "@/api";

interface CurrentNodiContainerProps {
  currentNodiList: MeetupRow[];
  groupId: string;
}

export function CurrentNodiContainer({ currentNodiList, groupId }: CurrentNodiContainerProps) {
  return (
    <div className="flex flex-col gap-3 lg:gap-5">
      <div className="flex gap-2.5 items-center">
        <Logo className="w-5.5" />
        <div className="font-semibold lg:text-lg">진행 중인 약속</div>
      </div>
      <CurrentNodi groupId={groupId} currentNodiList={currentNodiList} />
      <CreateMeetupButton groupId={groupId} />
    </div>
  );
}
