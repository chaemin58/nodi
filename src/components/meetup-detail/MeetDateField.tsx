interface MeetDateFieldProps {
  isDateDecided: boolean;
  setIsOpen: (open: boolean) => void;
}

export function MeetDateField({ isDateDecided, setIsOpen }: MeetDateFieldProps) {
  return (
    <button
      type="button"
      onClick={() => setIsOpen(true)}
      className="cursor-pointer text-xs text-primary underline underline-offset-2 md:text-sm"
    >
      {isDateDecided ? "날짜 수정하기" : "날짜 정하기"}
    </button>
  );
}
