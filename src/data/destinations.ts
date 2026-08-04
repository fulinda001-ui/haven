export type Place = {
  id: string;
  name: string;
  mapLabel?: string;
  country: string;
  xPercent: number;
  yPercent: number;
  sceneIds: string[];
  note: string;
  currentMoment: string;
  initialDiscoveryDate?: string;
  isDefaultSelection?: boolean;
};

export type PlaceDiscoveries = Record<string, string>;

export const DISCOVERED_DESTINATIONS_KEY = "haven.discoveredPlaces";

// This is the single source of truth for every Haven Place. Future scenes only
// need to add their scene ID to the appropriate Place's sceneIds list.
export const places: Place[] = [
  {
    id: "hokkaido",
    name: "Hokkaido",
    country: "Japan",
    xPercent: 85.6,
    yPercent: 35.7,
    sceneIds: ["hokkaido-forest-cabin"],
    note: "Snow falls quietly through the pines. The cabin stays warm while the forest slowly disappears into white.",
    currentMoment: "Snow Cabin",
    initialDiscoveryDate: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "kyoto",
    name: "Kyoto",
    country: "Japan",
    xPercent: 84.2,
    yPercent: 42.7,
    sceneIds: ["kyoto-rainy-cafe"],
    note: "Rain softens the sounds of the city. Time seems to slow with every cup of coffee.",
    currentMoment: "Rainy Café",
    initialDiscoveryDate: "2026-07-01T00:00:00.000Z",
    isDefaultSelection: true,
  },
  {
    id: "iceland",
    name: "Iceland Black Beach Cabin",
    mapLabel: "Iceland",
    country: "Vík, Iceland",
    xPercent: 34.6,
    yPercent: 28.2,
    sceneIds: ["iceland-aurora-lodge"],
    note: "Watch the Atlantic meet volcanic shores.",
    currentMoment: "Black Beach Cabin",
  },
  {
    id: "swiss-lakes",
    name: "Swiss Lakes",
    country: "Switzerland",
    xPercent: 49.4,
    yPercent: 40.1,
    sceneIds: ["swiss-lakeside-morning"],
    note: "Mist rises gently from the water.\n\nThe mountains wait quietly beyond the morning light.",
    currentMoment: "Lakeside Morning",
  },
  {
    id: "finland",
    name: "Finnish Glass Cabin",
    mapLabel: "Finnish Glass Cabin",
    country: "Finland",
    xPercent: 54.7,
    yPercent: 26.8,
    sceneIds: ["finland-glass-cabin"],
    note: "You do not have to follow the night anywhere.\n\nFor now, let the sky come to you.",
    currentMoment: "Glass Cabin",
  },
  {
    id: "norway",
    name: "Norwegian Fjord House",
    mapLabel: "Norwegian Fjord",
    country: "Geiranger, Norway",
    xPercent: 46.2,
    yPercent: 29.2,
    sceneIds: ["norwegian-fjord-house"],
    note: "Sit quietly where the mountains meet the fjord.",
    currentMoment: "Fjord House",
  },
  {
    id: "provence",
    name: "Provence Kitchen",
    mapLabel: "Provence",
    country: "Provence, France",
    xPercent: 45.4,
    yPercent: 43.1,
    sceneIds: ["provence-kitchen"],
    note: "Something is baking; the table is already set.",
    currentMoment: "Kitchen",
  },
  {
    id: "tuscany",
    name: "Tuscany Summer Villa",
    mapLabel: "Tuscany",
    country: "Tuscany, Italy",
    xPercent: 51.3,
    yPercent: 44.2,
    sceneIds: ["tuscany-summer-villa"],
    note: "Long lunch, open shutters, and sun on old stone.",
    currentMoment: "Summer Villa",
  },
  {
    id: "seoul",
    name: "Seoul Rooftop Sunset",
    mapLabel: "Seoul",
    country: "Seoul, South Korea",
    xPercent: 81.5,
    yPercent: 39.4,
    sceneIds: ["seoul-rooftop-sunset"],
    note: "A small rooftop, takeaway dinner, and the city turning gold.",
    currentMoment: "Rooftop Sunset",
  },
  {
    id: "bali",
    name: "Bali Sunrise House",
    mapLabel: "Bali",
    country: "Ubud, Bali",
    xPercent: 74.8,
    yPercent: 55.5,
    sceneIds: ["bali-sunrise-house"],
    note: "The day begins before the heat, before anyone needs you.",
    currentMoment: "Sunrise House",
  },
  { id: "patagonia", name: "Patagonia", country: "Argentina", xPercent: 28.3, yPercent: 77.9, sceneIds: [], note: "", currentMoment: "" },
  { id: "new-zealand", name: "New Zealand", country: "New Zealand", xPercent: 88.7, yPercent: 83.4, sceneIds: [], note: "", currentMoment: "" },
];

const initialDiscoveries = (): PlaceDiscoveries => Object.fromEntries(
  places
    .filter((place) => place.initialDiscoveryDate)
    .map((place) => [place.id, place.initialDiscoveryDate!]),
);

const readStoredDiscoveries = (): PlaceDiscoveries => {
  if (typeof window === "undefined") return {};
  try {
    const stored = JSON.parse(window.localStorage.getItem(DISCOVERED_DESTINATIONS_KEY) ?? "{}") as PlaceDiscoveries;
    return Object.fromEntries(Object.entries(stored).filter(([, date]) => typeof date === "string"));
  } catch {
    return {};
  }
};

export function readPlaceDiscoveries(): PlaceDiscoveries {
  return { ...initialDiscoveries(), ...readStoredDiscoveries() };
}

export function getPlaceForScene(sceneId: string) {
  return places.find((place) => place.sceneIds.includes(sceneId));
}

export function markScenePlaceDiscovered(sceneId: string) {
  const place = getPlaceForScene(sceneId);
  if (!place || typeof window === "undefined") return { place, newlyDiscovered: false };

  const discoveries = readPlaceDiscoveries();
  if (discoveries[place.id]) return { place, newlyDiscovered: false };

  const discoveredAt = new Date().toISOString();
  try {
    const stored = readStoredDiscoveries();
    window.localStorage.setItem(DISCOVERED_DESTINATIONS_KEY, JSON.stringify({ ...stored, [place.id]: discoveredAt }));
    return { place, newlyDiscovered: true };
  } catch {
    return { place, newlyDiscovered: false };
  }
}
