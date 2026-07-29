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
    sceneIds: ["iceland-aurora-lodge", "finnish-glass-cabin", "norwegian-fjord-house"],
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
    sceneIds: ["bali-sunrise-house", "new-zealand-mountain-cabin", "california-coastal-morning"],
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
    coverImage:
      "https://unsplash.com/photos/6kVGxIHriTA/download?force=true&w=1800",
    backgroundImage:
      "https://unsplash.com/photos/6kVGxIHriTA/download?force=true&w=2600",
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
  { id: "kyoto-rainy-cafe", name: "Kyoto Rainy Café", country: "Japan", city: "Kyoto", location: "Kyoto, Japan", timezone: "Asia/Tokyo", weatherLocation: "Kyoto, JP", coverImage: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?auto=format&fit=crop&w=1800&q=88", backgroundImage: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?auto=format&fit=crop&w=2600&q=90", ambientAudio: "/scenes/kyoto-rainy-cafe/audio/rain/base.mp3", seasonalAudio: "/scenes/kyoto-rainy-cafe/audio/rain/window.mp3", description: "A small table by the window, rain tracing the glass.", mood: "quiet", weather: "16°C · Soft rain", time: "Late afternoon", aiPrompt: "Write one short quiet observation from a rainy Kyoto café.", status: "coming-soon" },
  { id: "swiss-lakeside-morning", name: "Swiss Lakeside Morning", country: "Switzerland", city: "Lake Brienz", location: "Lake Brienz, Switzerland", timezone: "Europe/Zurich", weatherLocation: "Brienz, CH", coverImage: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1800&q=88", backgroundImage: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2600&q=90", ambientAudio: "/scenes/swiss-lakeside-morning/audio/lake/base.mp3", seasonalAudio: "/scenes/swiss-lakeside-morning/audio/lake/water.mp3", description: "Cold water, pale light, and nowhere to rush to.", mood: "quiet", weather: "12°C · Clear air", time: "7:12 AM", aiPrompt: "Write one short quiet observation from a Swiss lake at morning.", status: "coming-soon" },
  { id: "iceland-aurora-lodge", name: "Iceland Aurora Lodge", country: "Iceland", city: "Akureyri", location: "Akureyri, Iceland", timezone: "Atlantic/Reykjavik", weatherLocation: "Akureyri, IS", coverImage: "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=1800&q=88", backgroundImage: "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=2600&q=90", ambientAudio: "/scenes/iceland-aurora-lodge/audio/night/base.mp3", seasonalAudio: "/scenes/iceland-aurora-lodge/audio/night/wind.mp3", description: "A night beneath a green, moving sky.", mood: "escape", weather: "−3°C · Clear sky", time: "11:48 PM", aiPrompt: "Write one short quiet observation below an Icelandic aurora.", status: "coming-soon" },
  { id: "finnish-glass-cabin", name: "Finnish Glass Cabin", country: "Finland", city: "Lapland", location: "Lapland, Finland", timezone: "Europe/Helsinki", weatherLocation: "Rovaniemi, FI", coverImage: "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=1800&q=88", backgroundImage: "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=2600&q=90", ambientAudio: "/scenes/finnish-glass-cabin/audio/winter/base.mp3", seasonalAudio: "/scenes/finnish-glass-cabin/audio/winter/snow.mp3", description: "Sleep under the sky without leaving your bed.", mood: "escape", weather: "−6°C · Snow", time: "Night", aiPrompt: "Write one short quiet observation from a Finnish glass cabin.", status: "coming-soon" },
  { id: "norwegian-fjord-house", name: "Norwegian Fjord House", country: "Norway", city: "Geiranger", location: "Geiranger, Norway", timezone: "Europe/Oslo", weatherLocation: "Geiranger, NO", coverImage: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1800&q=88", backgroundImage: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=2600&q=90", ambientAudio: "/scenes/norwegian-fjord-house/audio/water/base.mp3", seasonalAudio: "/scenes/norwegian-fjord-house/audio/water/wind.mp3", description: "A red house facing water that keeps going.", mood: "escape", weather: "8°C · Mist", time: "Morning", aiPrompt: "Write one short quiet observation from a Norwegian fjord house.", status: "coming-soon" },
  { id: "tuscany-summer-villa", name: "Tuscany Summer Villa", country: "Italy", city: "Tuscany", location: "Tuscany, Italy", timezone: "Europe/Rome", weatherLocation: "Tuscany, IT", coverImage: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1800&q=88", backgroundImage: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=2600&q=90", ambientAudio: "/scenes/tuscany-summer-villa/audio/summer/base.mp3", seasonalAudio: "/scenes/tuscany-summer-villa/audio/summer/cicadas.mp3", description: "Long lunch, open shutters, and sun on old stone.", mood: "warm", weather: "27°C · Golden sun", time: "4:40 PM", aiPrompt: "Write one short quiet observation from a Tuscan villa.", status: "coming-soon" },
  { id: "provence-kitchen", name: "Provence Kitchen", country: "France", city: "Provence", location: "Provence, France", timezone: "Europe/Paris", weatherLocation: "Provence, FR", coverImage: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1800&q=88", backgroundImage: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=2600&q=90", ambientAudio: "/scenes/provence-kitchen/audio/home/base.mp3", seasonalAudio: "/scenes/provence-kitchen/audio/home/kitchen.mp3", description: "Something is baking; the table is already set.", mood: "warm", weather: "24°C · Open windows", time: "11:15 AM", aiPrompt: "Write one short quiet observation from a Provence kitchen.", status: "coming-soon" },
  { id: "seoul-rooftop-sunset", name: "Seoul Rooftop Sunset", country: "Korea", city: "Seoul", location: "Seoul, Korea", timezone: "Asia/Seoul", weatherLocation: "Seoul, KR", coverImage: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=1800&q=88", backgroundImage: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=2600&q=90", ambientAudio: "/scenes/seoul-rooftop-sunset/audio/city/base.mp3", seasonalAudio: "/scenes/seoul-rooftop-sunset/audio/city/evening.mp3", description: "A small rooftop, takeaway dinner, and the city turning gold.", mood: "warm", weather: "22°C · Sunset breeze", time: "7:26 PM", aiPrompt: "Write one short quiet observation from a Seoul rooftop at sunset.", status: "coming-soon" },
  { id: "bali-sunrise-house", name: "Bali Sunrise House", country: "Indonesia", city: "Ubud", location: "Ubud, Bali", timezone: "Asia/Makassar", weatherLocation: "Ubud, ID", coverImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1800&q=88", backgroundImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=2600&q=90", ambientAudio: "/scenes/bali-sunrise-house/audio/morning/base.mp3", seasonalAudio: "/scenes/bali-sunrise-house/audio/morning/birds.mp3", description: "The day begins before the heat, before anyone needs you.", mood: "reset", weather: "23°C · First light", time: "6:02 AM", aiPrompt: "Write one short quiet observation from an Ubud sunrise house.", status: "coming-soon" },
  { id: "new-zealand-mountain-cabin", name: "New Zealand Mountain Cabin", country: "New Zealand", city: "South Island", location: "South Island, New Zealand", timezone: "Pacific/Auckland", weatherLocation: "South Island, NZ", coverImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1800&q=88", backgroundImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2600&q=90", ambientAudio: "/scenes/new-zealand-mountain-cabin/audio/mountain/base.mp3", seasonalAudio: "/scenes/new-zealand-mountain-cabin/audio/mountain/wind.mp3", description: "Clean sheets, mountain air, and the feeling of starting over.", mood: "reset", weather: "10°C · Bright wind", time: "8:20 AM", aiPrompt: "Write one short quiet observation from a New Zealand mountain cabin.", status: "coming-soon" },
  { id: "california-coastal-morning", name: "California Coastal Morning", country: "United States", city: "Big Sur", location: "Big Sur, California", timezone: "America/Los_Angeles", weatherLocation: "Big Sur, US", coverImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=88", backgroundImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2600&q=90", ambientAudio: "/scenes/california-coastal-morning/audio/coast/base.mp3", seasonalAudio: "/scenes/california-coastal-morning/audio/coast/waves.mp3", description: "Salt air, empty road, and an unmarked morning ahead.", mood: "reset", weather: "18°C · Ocean mist", time: "7:36 AM", aiPrompt: "Write one short quiet observation from a California coast at morning.", status: "coming-soon" },
];

export const moodById = (id?: string) => moods.find((mood) => mood.id === id);
export const sceneById = (id?: string) => scenes.find((scene) => scene.id === id);
export const scenesForMood = (moodId: string) => scenes.filter((scene) => scene.mood === moodId);
