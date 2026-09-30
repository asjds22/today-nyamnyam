export interface Coords {
  lat: number;
  lng: number;
}

// 토스 WebView 환경에서도 표준 Web Geolocation API를 그대로 사용할 수 있어요.
export function getCurrentPosition(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("이 기기에서는 위치 정보를 사용할 수 없어요."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(new Error("위치 권한이 거부됐어요. 설정에서 허용해 주세요."));
        } else {
          reject(new Error("위치를 가져오지 못했어요. 잠시 후 다시 시도해 주세요."));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  });
}
