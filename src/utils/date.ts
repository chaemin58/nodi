/** 특정 날짜로부터 오늘까지 며칠 지났는지 계산 (당일 = 1일) */
const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function getDaysSince(startDate: Date): number {
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const today = new Date();
  const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return Math.floor((now.getTime() - start.getTime()) / MS_PER_DAY) + 1;
}

/** meet_date가 오늘보다 이전인지 확인. 날짜가 없으면(null) 지난 것으로 보지 않는다 */
export function isPast(meetDate: string | null): boolean {
  if (!meetDate) return false;

  const target = new Date(meetDate);
  const day = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  const today = new Date();
  const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return day.getTime() < now.getTime();
}

/** 특정 날짜로부터 오늘까지 며칠 지났는지 계산 후 일/주/달/년 단위 문자열로 변환 */
export function getDaysLastMeetingDays(lastMeeting: Date): string {
  const last = new Date(lastMeeting.getFullYear(), lastMeeting.getMonth(), lastMeeting.getDate());

  const today = new Date();
  const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const days = Math.floor((now.getTime() - last.getTime()) / MS_PER_DAY) + 1;

  if (days <= 6) {
    return `${days}일`;
  } else if (days <= 30) {
    return `${Math.floor(days / 7)}주`;
  } else if (days <= 365) {
    return `${Math.floor(days / 30)}개월`;
  } else {
    return `${Math.floor(days / 365)}년`;
  }
}

/**yyyy-mm-dd 형태를 mm월 dd일 형태로 바꿈.**/
export const formatDateKorean = (date: string) => {
  const [, month, day] = date.split("-");
  return `${Number(month)}월 ${Number(day)}일`;
};
