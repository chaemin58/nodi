import FlagIcon from "@/assets/icon/flag.svg";
import ConfirmCheck from "@/assets/icon/confirmed.svg";

interface StatusDisplayProps {
  type: "voting" | "confirmed";
  title: string;
  options?: number;
  url?: string;
}

export function StatusDisplay({ type, title, options, url }: StatusDisplayProps) {
  if (type === "voting") {
    return (
      <div className="flex gap-1 items-center">
        <FlagIcon className="m-2 w-4" />
        <div className="font-semibold">{title} •</div>
        <div className="text-gray-400">후보 {options}곳</div>
      </div>
    );
  }

  if (type === "confirmed") {
    return (
      <div className="flex gap-1 items-center">
        <ConfirmCheck className="m-1" />
        <div className="font-semibold">
          {title}
          <span className="font-normal">으로 확정</span>
        </div>
        {/* 추후 앱안 지도로 변경 */}
        <a href={url} className="relative z-10 text-gray-400 text-sm underline">
          장소 보러가기
        </a>
      </div>
    );
  }
}
