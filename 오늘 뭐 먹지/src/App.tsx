import { useState, type ReactNode } from "react";
import { share, getTossShareLink } from "@apps-in-toss/web-framework";
import "./App.css";
import { getCurrentPosition } from "./geolocation";
import {
  FOOD_TYPES,
  searchRestaurants,
  type FoodType,
  type Restaurant,
} from "./kakao";

function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`;
  const km = meters / 1000;
  return `${Number.isInteger(km) ? km : km.toFixed(1)}km`;
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

const FOOD_EMOJI: Record<FoodType, string> = {
  한식: "🍚",
  중식: "🥢",
  일식: "🍣",
  양식: "🍝",
  분식: "🌶️",
  아시아: "🍜",
};

function FoodIcon({ type }: { type: FoodType }): ReactNode {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (type) {
    case "한식":
      return (
        <svg {...common}>
          <path d="M3 12h18a8 8 0 0 1-16 0" />
          <path d="M8 9c0-1.5 1-2.5 1.5-3M12 8.5c0-1.5 1-2.5 1.5-3.5M16 9c0-1.2 .7-2 1-2.8" />
          <path d="M2 12h20" />
        </svg>
      );
    case "중식":
      return (
        <svg {...common}>
          <path d="M4 13h13a6.5 6.5 0 0 1-13 0" />
          <path d="M3 13h15" />
          <line x1="13" y1="3" x2="21" y2="8" />
          <line x1="15" y1="5.5" x2="22" y2="10.5" />
        </svg>
      );
    case "일식":
      return (
        <svg {...common}>
          <rect x="3" y="10" width="18" height="7" rx="3.5" />
          <ellipse cx="12" cy="8" rx="6" ry="2.4" />
        </svg>
      );
    case "양식":
      return (
        <svg {...common}>
          <path d="M6 3v8M9 3v8M7.5 11v10M6 3a1.5 1.5 0 0 0 3 0" />
          <path d="M16 3c-1.5 0-2.5 2-2.5 5s1 4 2.5 4 2.5-1 2.5-4-1-5-2.5-5zM16 12v9" />
        </svg>
      );
    case "분식":
      return (
        <svg {...common}>
          <line x1="4" y1="20" x2="20" y2="4" />
          <circle cx="9" cy="13" r="2.4" />
          <circle cx="14" cy="8" r="2.4" />
        </svg>
      );
    case "아시아":
      return (
        <svg {...common}>
          <path d="M5 12h14a7 7 0 0 1-14 0z" />
          <path d="M4 12h16" />
          <path d="M9 8c0-1.5 1.5-2 1.5-3.5M14 8c0-1.5 1.5-2 1.5-3.5" />
        </svg>
      );
  }
}

function App() {
  const [radius, setRadius] = useState(500);
  const [selectedTypes, setSelectedTypes] = useState<FoodType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Restaurant | null>(null);
  const [resultType, setResultType] = useState<FoodType | null>(null);

  const anySelected = selectedTypes.length > 0;

  const toggleType = (type: FoodType) => {
    setError(null);
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type],
    );
  };

  const recommend = async () => {
    if (!anySelected || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setResultType(null);

    try {
      const coords = await getCurrentPosition();
      const shuffledTypes = [...selectedTypes].sort(() => Math.random() - 0.5);

      for (const type of shuffledTypes) {
        const restaurants = await searchRestaurants(coords, radius, type);
        if (restaurants.length > 0) {
          setResult(pickRandom(restaurants));
          setResultType(type);
          return;
        }
      }

      setError("조건에 맞는 밥집을 찾지 못했어요. 거리를 넓혀보세요.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  };

  const shareResult = async () => {
    if (!result) return;
    try {
      const link = await getTossShareLink(
        "intoss://today-nyamnyam/",
        "https://raw.githubusercontent.com/asjds22/today-nyamnyam/main/public/og-image.png",
      );
      await share({
        message: `오늘 뭐 먹지? 🍚 "${result.name}" 어때요?\n${link}`,
      });
    } catch {
      // 토스 앱이 아닌 환경(브라우저/로컬)에서는 공유가 동작하지 않아요.
    }
  };

  return (
    <div className="phone">
      <header className="topbar">
        <img
          className="topbar-logo"
          src="/logo.png"
          alt=""
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <span className="topbar-title">
          오늘 뭐 먹지<span className="accent">?</span>
        </span>
      </header>

      <main className="content">
        <h1 className="hero">
          오늘 뭐 <span className="accent">먹지?</span>
        </h1>
        <p className="hero-sub">내 주변 밥집을 랜덤으로 추천해 드릴게요.</p>

        <section className="block">
          <div className="dist-head">
            <span className="dist-label">거리</span>
            <span className="dist-value">{formatDistance(radius)}</span>
          </div>
          <input
            className="slider"
            type="range"
            min={100}
            max={2000}
            step={100}
            value={radius}
            onChange={(e) => {
              setRadius(Number(e.target.value));
              setResult(null);
            }}
          />
          <div className="dist-ticks">
            <span>100m</span>
            <span>1km</span>
            <span>2km</span>
          </div>
        </section>

        <section className="block">
          <div className="section-title">음식 종류</div>
          <div className="pills">
            {FOOD_TYPES.map((type) => {
              const on = selectedTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  className={`pill ${on ? "pill-on" : ""}`}
                  onClick={() => toggleType(type)}
                >
                  <FoodIcon type={type} />
                  <span>{type}</span>
                </button>
              );
            })}
          </div>
        </section>

        {result && resultType && (
          <section className="result">
            <span className="result-emoji">{FOOD_EMOJI[resultType]}</span>
            <div className="result-body">
              <div className="result-eyebrow">오늘의 추천은</div>
              <div className="result-name">
                {result.name} <span className="accent">어때요?</span>
              </div>
              <div className="result-meta">
                {result.category} · {formatDistance(result.distance)}
              </div>
              <div className="result-addr">{result.address}</div>
              {result.phone && (
                <div className="result-addr">{result.phone}</div>
              )}
              <div className="result-actions">
                <a
                  className="result-link"
                  href={result.placeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  카카오맵에서 보기 →
                </a>
                <button
                  type="button"
                  className="result-share"
                  onClick={shareResult}
                >
                  친구에게 공유하기
                </button>
              </div>
            </div>
          </section>
        )}

        <div className="spacer" />

        <button
          type="button"
          className={`cta ${anySelected && !loading ? "" : "cta-off"}`}
          onClick={recommend}
          disabled={!anySelected || loading}
        >
          {loading ? "찾는 중…" : "랜덤 추천 받기"}
        </button>
        <p className={`hint ${error ? "hint-error" : ""}`}>
          {error
            ? error
            : anySelected
              ? "원하는 음식 종류를 골라보세요"
              : "음식 종류를 하나 이상 선택해 주세요"}
        </p>
      </main>
    </div>
  );
}

export default App;
