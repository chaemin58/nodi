// 네이버 지역 검색(Local Search) API 호출 로직 — 서버에서만 실행됨.
// Secret 키를 쓰기 때문에 절대 브라우저(클라이언트)에서 부르면 안 됨 → Route Handler 전용.
//
// 필요한 환경변수 (.env.local):
//   NAVER_SEARCH_CLIENT_ID
//   NAVER_SEARCH_CLIENT_SECRET
//   (둘 다 developers.naver.com → 애플리케이션 등록 → 검색 API 에서 발급)

// 2026-09 NAVER API HUB 이관으로 구 openapi.naver.com 엔드포인트 대신 이걸 씀.
const ENDPOINT = "https://naverapihub.apigw.ntruss.com/search/v1/local";

// 프론트에 돌려줄, 우리 앱이 쓰기 좋은 장소 모양.
// (네이버 원본 응답을 그대로 안 주고, 필요한 것만 골라 정리해서 준다)
export type SearchedPlace = {
  name: string; // 상호명 (네이버가 <b>태그</b> 붙여줘서 제거함)
  category: string; // 예: "음식점>카페"
  address: string; // 지번 주소
  roadAddress: string; // 도로명 주소
  lat: number | null; // 위도 (지도 핀용)
  lng: number | null; // 경도
  link: string; // 네이버 상세 링크
};

// 네이버 원본 item 모양 (필요한 필드만)
type NaverItem = {
  title: string;
  link: string;
  category: string;
  address: string;
  roadAddress: string;
  mapx: string; // 경도 * 1e7 (문자열)
  mapy: string; // 위도 * 1e7 (문자열)
};

/** 제목의 <b></b> 등 HTML 태그 제거 */
function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/** 네이버 mapx/mapy(정수 문자열)를 실제 위경도(도)로 변환 */
function toCoord(value: string): number | null {
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return null;
  return n / 1e7;
}

/**
 * 네이버 지역 검색.
 * @param query 검색어 (예: "성수동 카페")
 * @param display 결과 개수 (네이버 제한: 최대 5)
 */
export async function searchPlaces(query: string, display = 5): Promise<SearchedPlace[]> {
  const clientId = process.env.NAVER_SEARCH_CLIENT_ID;
  const clientSecret = process.env.NAVER_SEARCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "[네이버 검색] 환경변수가 없습니다. .env.local 에 " +
        "NAVER_SEARCH_CLIENT_ID / NAVER_SEARCH_CLIENT_SECRET 를 넣어주세요.",
    );
  }

  const url = `${ENDPOINT}?query=${encodeURIComponent(query)}&display=${display}`;

  const res = await fetch(url, {
    headers: {
      "X-NCP-APIGW-API-KEY-ID": clientId,
      "X-NCP-APIGW-API-KEY": clientSecret,
    },
    // 검색 결과는 실시간이어야 하므로 캐시 안 함
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`[네이버 검색] 응답 오류: ${res.status}`);
  }

  const data = (await res.json()) as { items?: NaverItem[] };

  return (data.items ?? []).map((item) => ({
    name: stripTags(item.title),
    category: item.category,
    address: item.address,
    roadAddress: item.roadAddress,
    lat: toCoord(item.mapy),
    lng: toCoord(item.mapx),
    link: item.link,
  }));
}
