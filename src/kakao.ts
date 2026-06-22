import type { Coords } from "./geolocation";

export const FOOD_TYPES = ["한식", "중식", "일식", "양식", "분식", "아시아"] as const;
export type FoodType = (typeof FOOD_TYPES)[number];

export interface Restaurant {
  id: string;
  name: string;
  category: string;
  phone: string;
  address: string;
  distance: number; // meters
  placeUrl: string;
  lat: number;
  lng: number;
}

interface KakaoDocument {
  id: string;
  place_name: string;
  category_name: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  place_url: string;
  distance: string;
}

interface KakaoResponse {
  documents: KakaoDocument[];
  meta: { is_end: boolean; total_count: number };
}

const ENDPOINT = "https://dapi.kakao.com/v2/local/search/keyword.json";
const FOOD_CATEGORY_GROUP = "FD6"; // 카카오 장소 카테고리: 음식점

function getKey(): string {
  const key = import.meta.env.VITE_KAKAO_REST_KEY;
  if (!key) {
    throw new Error(
      "카카오 REST API 키가 없어요. .env 파일의 VITE_KAKAO_REST_KEY를 채워주세요.",
    );
  }
  return key;
}

function toRestaurant(doc: KakaoDocument): Restaurant {
  return {
    id: doc.id,
    name: doc.place_name,
    category: doc.category_name.split(" > ").pop() ?? doc.category_name,
    phone: doc.phone,
    address: doc.road_address_name || doc.address_name,
    distance: Number(doc.distance) || 0,
    placeUrl: doc.place_url,
    lat: Number(doc.y),
    lng: Number(doc.x),
  };
}

// 지정한 위치/반경/음식 종류에 맞는 식당을 모아서 반환해요.
export async function searchRestaurants(
  coords: Coords,
  radius: number,
  foodType: FoodType,
): Promise<Restaurant[]> {
  const key = getKey();
  const results: Restaurant[] = [];
  const maxPages = 3; // 페이지당 15개, 최대 45개까지 모아 랜덤 풀을 넓혀요.

  for (let page = 1; page <= maxPages; page++) {
    const params = new URLSearchParams({
      query: foodType,
      category_group_code: FOOD_CATEGORY_GROUP,
      x: String(coords.lng),
      y: String(coords.lat),
      radius: String(radius),
      sort: "distance",
      size: "15",
      page: String(page),
    });

    const res = await fetch(`${ENDPOINT}?${params.toString()}`, {
      headers: { Authorization: `KakaoAK ${key}` },
    });

    if (!res.ok) {
      throw new Error(`카카오 API 오류가 발생했어요. (${res.status})`);
    }

    const data: KakaoResponse = await res.json();
    results.push(...data.documents.map(toRestaurant));

    if (data.meta.is_end) break;
  }

  return results;
}
