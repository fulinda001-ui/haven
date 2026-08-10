import { BALI_SUNRISE_DESTINATION_ID } from "./destinations";

export type MoodId = "quiet" | "escape" | "warm" | "reset";

export type Mood = {
  id: MoodId;
  prompt: string;
  name: string;
  description: string;
  coverImage: string;
  sceneIds: string[];
};

export type SceneStatus = "available" | "coming-soon";

export type Scene = {
  id: string;
  name: string;
  country: string;
  city: string;
  location: string;
  timezone: string;
  weatherLocation: string;
  coverImage: string;
  backgroundImage: string;
  ambientAudio: string;
  seasonalAudio: string;
  description: string;
  mood: MoodId;
  weather: string;
  time: string;
  aiPrompt: string;
  status: SceneStatus;
  discoveryTiming?: "enter" | "completion";
  motion?: { scaleFrom: number; scaleTo: number; durationSeconds: number };
  audio?: { base: string; fadeInMs: number; fadeOutMs: number };
};

export const moods: Mood[] = [
  {
    id: "quiet",
    name: "Calm",
    prompt: "I need some quiet",
    description: "Slow down. Breathe. Stay somewhere gentle.",
    coverImage:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1800&q=88",
    sceneIds: ["hokkaido-forest-cabin", "kyoto-rainy-cafe", "swiss-lakeside-morning"],
  },
  {
    id: "escape",
    name: "Escape",
    prompt: "Take me somewhere else",
    description: "Leave ordinary life behind for a little while.",
    coverImage:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1800&q=88",
    sceneIds: ["iceland-aurora-lodge", "finland-glass-cabin", "norwegian-fjord-house"],
  },
  {
    id: "warm",
    name: "Warm",
    prompt: "I want to feel warm",
    description: "Soft light, familiar rooms, and a life that feels held.",
    coverImage:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1800&q=88",
    sceneIds: ["tuscany-summer-villa", "provence-kitchen", "seoul-rooftop-sunset"],
  },
  {
    id: "reset",
    name: "Reset",
    prompt: "I need a fresh start",
    description: "Clear air, early light, and space to begin again.",
    coverImage:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1800&q=88",
    sceneIds: [BALI_SUNRISE_DESTINATION_ID, "new-zealand-mountain-cabin", "california-coastal-morning"],
  },
];

export const scenes: Scene[] = [
  {
    id: "hokkaido-forest-cabin",
    name: "Hokkaido Forest Cabin",
    country: "Japan",
    city: "Hokkaido",
    location: "Hokkaido, Japan",
    timezone: "Asia/Tokyo",
    weatherLocation: "Hokkaido, JP",
    coverImage: "/scenes/hokkaido-forest-cabin/images/hokkaido-forest-cabin.jpg",
    backgroundImage: "/scenes/hokkaido-forest-cabin/images/hokkaido-forest-cabin.jpg",
    ambientAudio: "/scenes/hokkaido-cabin/audio/ambient.mp3",
    seasonalAudio: "/scenes/hokkaido-cabin/audio/dbsound-light-breeze-through-cabin-slats-327161.mp3",
    description: "A quiet summer evening among the trees.",
    mood: "quiet",
    weather: "18°C · Gentle wind",
    time: "Early evening",
    aiPrompt:
      "Write one very short, non-directive observation for a quiet summer evening in a Hokkaido forest cabin. Mention only one subtle natural detail. Never give advice or ask a question.",
    status: "available",
    motion: { scaleFrom: 1, scaleTo: 1.02, durationSeconds: 32 },
    audio: { base: "/scenes/hokkaido-cabin/audio/ambient.mp3", fadeInMs: 3000, fadeOutMs: 2800 },
  },
  { id: "kyoto-rainy-cafe", name: "Kyoto Rainy Café", country: "Japan", city: "Kyoto", location: "Kyoto, Japan", timezone: "Asia/Tokyo", weatherLocation: "Kyoto, JP", coverImage: "/scenes/kyoto-rainy-cafe/images/kyoto-rainy-cafe.png", backgroundImage: "/scenes/kyoto-rainy-cafe/images/kyoto-rainy-cafe.png", ambientAudio: "/scenes/kyoto-rainy-cafe/audio/rain.wav", seasonalAudio: "/scenes/kyoto-rainy-cafe/audio/rain.wav", description: "A small table by the window, rain tracing the glass.", mood: "quiet", weather: "16°C · Soft rain", time: "Late afternoon", aiPrompt: "Write one short quiet observation from a rainy Kyoto café.", status: "available" },
  { id: "swiss-lakeside-morning", name: "Swiss Lakes", country: "Switzerland", city: "Swiss Lakes", location: "Switzerland", timezone: "Europe/Zurich", weatherLocation: "Brienz, CH", coverImage: "/scenes/swiss-lakes/images/swiss-lakes.png", backgroundImage: "/scenes/swiss-lakes/images/swiss-lakes.png", ambientAudio: "/scenes/swiss-lakeside-morning/audio/lake/base.mp3", seasonalAudio: "/scenes/swiss-lakeside-morning/audio/lake/water.mp3", description: "Morning settles quietly across the lake. There is nowhere you need to be.", mood: "quiet", weather: "12°C · Clear air", time: "7:12 AM", aiPrompt: "Write one short quiet observation from a Swiss lake at morning.", status: "available" },
  { id: "iceland-aurora-lodge", name: "Iceland Black Beach Cabin", country: "Iceland", city: "Vík", location: "Vík, Iceland", timezone: "Atlantic/Reykjavik", weatherLocation: "Vík, IS", coverImage: "/scenes/iceland-aurora-lodge/images/iceland-black-beach-cabin.png", backgroundImage: "/scenes/iceland-aurora-lodge/images/iceland-black-beach-cabin.png", ambientAudio: "/scenes/iceland-aurora-lodge/audio/atlantic-ocean.mp3", seasonalAudio: "", description: "Watch the Atlantic meet volcanic shores.", mood: "escape", weather: "8°C · Atlantic overcast", time: "Late afternoon", aiPrompt: "Write one short quiet observation from a cabin above Iceland's black sand coast.", status: "available" },
  { id: "finland-glass-cabin", name: "Finnish Glass Cabin", country: "Finland", city: "Finnish Glass Cabin", location: "Lapland, Finland", timezone: "Europe/Helsinki", weatherLocation: "Lapland, FI", coverImage: "/scenes/finland-glass-cabin/images/finland-glass-cabin.png", backgroundImage: "/scenes/finland-glass-cabin/images/finland-glass-cabin.png", ambientAudio: "/scenes/finland-glass-cabin/audio/fireplace.m4a", seasonalAudio: "/scenes/finland-glass-cabin/audio/outside-wind.mp3", description: "Lie beneath the northern sky.", mood: "escape", weather: "−14°C · Clear night", time: "12:16 AM", aiPrompt: "Write one short quiet observation from a warm glass cabin in Finnish Lapland. Mention only one subtle detail and never give advice.", status: "available" },
  { id: "norwegian-fjord-house", name: "Norwegian Fjord House", country: "Norway", city: "Geiranger", location: "Geiranger, Norway", timezone: "Europe/Oslo", weatherLocation: "Geiranger, NO", coverImage: "/scenes/norwegian-fjord-house/images/norwegian-fjord-house.png", backgroundImage: "/scenes/norwegian-fjord-house/images/norwegian-fjord-house.png", ambientAudio: "/scenes/norwegian-fjord-house/audio/fjord-water.mp3", seasonalAudio: "", description: "Sit quietly where the mountains meet the fjord.", mood: "escape", weather: "14°C · Quiet evening", time: "Golden hour", aiPrompt: "Write one short quiet observation from a Norwegian fjord house.", status: "available" },
  { id: "tuscany-summer-villa", name: "Tuscany Summer Villa", country: "Italy", city: "Tuscany", location: "Tuscany, Italy", timezone: "Europe/Rome", weatherLocation: "Tuscany, IT", coverImage: "/scenes/tuscany-summer-villa/images/tuscany-summer-villa.png", backgroundImage: "/scenes/tuscany-summer-villa/images/tuscany-summer-villa.png", ambientAudio: "/scenes/tuscany-summer-villa/audio/quiet-town-ambience.mp3", seasonalAudio: "", description: "Long lunch, open shutters, and sun on old stone.", mood: "warm", weather: "27°C · Golden sun", time: "4:40 PM", aiPrompt: "Write one short quiet observation from a Tuscan villa.", status: "available" },
  { id: "provence-kitchen", name: "Provence Kitchen", country: "France", city: "Provence", location: "PROVENCE, FRANCE", timezone: "Europe/Paris", weatherLocation: "Provence, FR", coverImage: "/scenes/provence-kitchen/images/provence-kitchen.png", backgroundImage: "/scenes/provence-kitchen/images/provence-kitchen.png", ambientAudio: "/scenes/provence-kitchen/audio/garden-ambience.mp3", seasonalAudio: "", description: "Something is baking; the table is already set.", mood: "warm", weather: "24°C · Open windows", time: "11:15 AM", aiPrompt: "Write one short quiet observation from a Provence kitchen.", status: "available" },
  { id: "seoul-rooftop-sunset", name: "Seoul Rooftop Sunset", country: "South Korea", city: "Seoul", location: "Seoul, Korea", timezone: "Asia/Seoul", weatherLocation: "Seoul, KR", coverImage: "/scenes/seoul-rooftop-sunset/images/seoul-rooftop-sunset.png", backgroundImage: "/scenes/seoul-rooftop-sunset/images/seoul-rooftop-sunset.png", ambientAudio: "/scenes/seoul-rooftop-sunset/audio/seoul-city-ambience.mp3", seasonalAudio: "", description: "A small rooftop, takeaway dinner, and the city turning gold.", mood: "warm", weather: "22°C · Sunset breeze", time: "7:26 PM", aiPrompt: "Write one short quiet observation from a Seoul rooftop at sunset.", status: "available" },
  { id: BALI_SUNRISE_DESTINATION_ID, name: "Bali Sunrise House", country: "Indonesia", city: "Ubud", location: "UBUD, BALI", timezone: "Asia/Makassar", weatherLocation: "Ubud, ID", coverImage: "/scenes/bali-sunrise-house/images/bali-sunrise-house.png", backgroundImage: "/scenes/bali-sunrise-house/images/bali-sunrise-house.png", ambientAudio: "/scenes/bali-sunrise-house/audio/morning-garden.mp3", seasonalAudio: "", description: "The day begins before the heat, before anyone needs you.", mood: "reset", weather: "23°C · First light", time: "6:02 AM", aiPrompt: "Write one short quiet observation from an Ubud sunrise house.", status: "available", discoveryTiming: "completion" },
  { id: "new-zealand-mountain-cabin", name: "New Zealand Mountain Cabin", country: "New Zealand", city: "South Island", location: "South Island, New Zealand", timezone: "Pacific/Auckland", weatherLocation: "South Island, NZ", coverImage: "/scenes/new-zealand-mountain-cabin/images/new-zealand-mountain-cabin.png", backgroundImage: "/scenes/new-zealand-mountain-cabin/images/new-zealand-mountain-cabin.png", ambientAudio: "/scenes/new-zealand-mountain-cabin/audio/hot-spring-water.mp3", seasonalAudio: "", description: "Clean sheets, mountain air, and the feeling of starting over.", mood: "reset", weather: "10°C · Bright wind", time: "8:20 AM", aiPrompt: "Write one short quiet observation from a New Zealand mountain cabin.", status: "available" },
  { id: "california-coastal-morning", name: "California Coastal Morning", country: "United States", city: "Big Sur", location: "Big Sur, California", timezone: "America/Los_Angeles", weatherLocation: "Big Sur, US", coverImage: "/scenes/california-coastal-morning/images/california-coastal-morning.png", backgroundImage: "/scenes/california-coastal-morning/images/california-coastal-morning.png", ambientAudio: "/scenes/california-coastal-morning/audio/coastal-waves.wav", seasonalAudio: "", description: "Salt air, empty road, and an unmarked morning ahead.", mood: "reset", weather: "18°C · Ocean mist", time: "7:36 AM", aiPrompt: "Write one short quiet observation from a California coast at morning.", status: "available" },
];

export const moodById = (id?: string) => moods.find((mood) => mood.id === id);
export const sceneById = (id?: string) => scenes.find((scene) => scene.id === id);
export const scenesForMood = (moodId: string) => scenes.filter((scene) => scene.mood === moodId);
