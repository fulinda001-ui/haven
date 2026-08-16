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

export type LivingLayerConfig = {
  kind: "nearby-leaves" | "falling-leaf" | "snow" | "dust" | "embers" | "light-rain" | "fireflies";
  count?: number;
  opacity: number;
  driftPixels: number;
  durationSeconds: [number, number];
  intervalSeconds?: [number, number];
};

export type AtmosphereLayerConfig = {
  kind: "forest-haze" | "fog" | "mist";
  opacity: number;
  durationSeconds: number;
};

export type LivingSceneConfig = {
  livingLayers: LivingLayerConfig[];
  atmosphereLayers: AtmosphereLayerConfig[];
};

export type SceneMotionPreset = {
  kind: "cinematic-push-in";
  scaleFrom: 1;
  scaleTo: number;
  durationSeconds: number;
};

export type ScenePresenceConfig = {
  timeOfDay: string;
  atmosphere: string;
  whisper: string;
};

const cinematicPushIn = (scaleTo: number, durationSeconds = 42): SceneMotionPreset => ({
  kind: "cinematic-push-in",
  scaleFrom: 1,
  scaleTo,
  durationSeconds,
});

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
  motion?: SceneMotionPreset;
  livingScene?: LivingSceneConfig;
  scenePresence: ScenePresenceConfig;
  audio?: { base: string; fadeInMs: number; fadeOutMs: number };
};

export const moods: Mood[] = [
  {
    id: "quiet",
    name: "Calm",
    prompt: "I need some quiet",
    description: "Slow down. Breathe. Stay somewhere gentle.",
    coverImage: "/images/moods/calm-forest-morning.png",
    sceneIds: ["hokkaido-forest-cabin", "kyoto-rainy-cafe", "swiss-lakeside-morning"],
  },
  {
    id: "escape",
    name: "Escape",
    prompt: "Take me somewhere else",
    description: "Leave ordinary life behind for a little while.",
    coverImage: "/images/moods/escape-winter-train.png",
    sceneIds: ["iceland-aurora-lodge", "finland-glass-cabin", "norwegian-fjord-house"],
  },
  {
    id: "warm",
    name: "Warm",
    prompt: "I want to feel warm",
    description: "Soft light, familiar rooms, and a life that feels held.",
    coverImage: "/images/moods/warm-cozy-cabin.png",
    sceneIds: ["tuscany-summer-villa", "provence-kitchen", "seoul-rooftop-sunset"],
  },
  {
    id: "reset",
    name: "Reset",
    prompt: "I need a fresh start",
    description: "Clear air, early light, and space to begin again.",
    coverImage: "/images/moods/reset-mountain-sunrise.png",
    sceneIds: [BALI_SUNRISE_DESTINATION_ID, "new-zealand-mountain-cabin", "california-coastal-morning"],
  },
];

export const scenes: Scene[] = [
  {
    id: "hokkaido-forest-cabin",
    name: "Among the Cedars",
    country: "Japan",
    city: "Hokkaido",
    location: "Hokkaido, Japan",
    timezone: "Asia/Tokyo",
    weatherLocation: "Hokkaido, JP",
    coverImage: "/scenes/hokkaido-forest-cabin/images/hokkaido-forest-cabin.jpg",
    backgroundImage: "/scenes/hokkaido-forest-cabin/images/hokkaido-forest-cabin.jpg",
    ambientAudio: "/scenes/hokkaido-cabin/audio/ambient.mp3",
    seasonalAudio: "/scenes/hokkaido-cabin/audio/dbsound-light-breeze-through-cabin-slats-327161.mp3",
    description: "A quiet cabin where the forest does all the talking.",
    mood: "quiet",
    weather: "18°C · Gentle wind",
    time: "Early evening",
    aiPrompt:
      "Write one very short, non-directive observation for a quiet summer evening in a Hokkaido forest cabin. Mention only one subtle natural detail. Never give advice or ask a question.",
    status: "available",
    motion: cinematicPushIn(1.035, 44),
    scenePresence: { timeOfDay: "Early Morning", atmosphere: "Cool Air · Light Breeze", whisper: "The forest is already awake." },
    livingScene: {
      livingLayers: [],
      atmosphereLayers: [],
    },
    audio: { base: "/scenes/hokkaido-cabin/audio/ambient.mp3", fadeInMs: 3000, fadeOutMs: 2800 },
  },
  { id: "kyoto-rainy-cafe", name: "Rain by the Window", country: "Japan", city: "Kyoto", location: "Kyoto, Japan", timezone: "Asia/Tokyo", weatherLocation: "Kyoto, JP", coverImage: "/scenes/kyoto-rainy-cafe/images/kyoto-rainy-cafe.png", backgroundImage: "/scenes/kyoto-rainy-cafe/images/kyoto-rainy-cafe.png", ambientAudio: "/scenes/kyoto-rainy-cafe/audio/rain.wav", seasonalAudio: "/scenes/kyoto-rainy-cafe/audio/rain.wav", description: "Watch the rain trace the glass, one drop at a time.", mood: "quiet", weather: "16°C · Soft rain", time: "Late afternoon", aiPrompt: "Write one short quiet observation from a rainy Kyoto café.", status: "available", motion: cinematicPushIn(1.028, 42), scenePresence: { timeOfDay: "Late Afternoon", atmosphere: "Window Warmth · Soft Rain", whisper: "The rain has nowhere else to be." } },
  { id: "swiss-lakeside-morning", name: "Still Waters", country: "Switzerland", city: "Swiss Lakes", location: "Lake Brienz, Switzerland", timezone: "Europe/Zurich", weatherLocation: "Brienz, CH", coverImage: "/scenes/swiss-lakes/images/swiss-lakes.png", backgroundImage: "/scenes/swiss-lakes/images/swiss-lakes.png", ambientAudio: "/scenes/swiss-lakeside-morning/audio/lake/base.mp3", seasonalAudio: "/scenes/swiss-lakeside-morning/audio/lake/water.mp3", description: "The lake asks nothing of you.", mood: "quiet", weather: "12°C · Clear air", time: "7:12 AM", aiPrompt: "Write one short quiet observation from a Swiss lake at morning.", status: "available", motion: cinematicPushIn(1.025, 45), scenePresence: { timeOfDay: "Early Morning", atmosphere: "Clear Air · Still Water", whisper: "The lake hasn't moved all morning." } },
  { id: "iceland-aurora-lodge", name: "The World's Edge", country: "Iceland", city: "Vík", location: "Vík, Iceland", timezone: "Atlantic/Reykjavik", weatherLocation: "Vík, IS", coverImage: "/scenes/iceland-aurora-lodge/images/iceland-black-beach-cabin.png", backgroundImage: "/scenes/iceland-aurora-lodge/images/iceland-black-beach-cabin.png", ambientAudio: "/scenes/iceland-aurora-lodge/audio/atlantic-ocean.mp3", seasonalAudio: "", description: "Watch the waves erase every thought.", mood: "escape", weather: "8°C · Atlantic overcast", time: "Late afternoon", aiPrompt: "Write one short quiet observation from a cabin above Iceland's black sand coast.", status: "available", motion: cinematicPushIn(1.025, 44), scenePresence: { timeOfDay: "Late Afternoon", atmosphere: "Atlantic Air · Heavy Clouds", whisper: "Nothing is asking you to hurry." } },
  { id: "finland-glass-cabin", name: "Beneath Northern Lights", country: "Finland", city: "Finnish Glass Cabin", location: "Lapland, Finland", timezone: "Europe/Helsinki", weatherLocation: "Lapland, FI", coverImage: "/scenes/finland-glass-cabin/images/finland-glass-cabin.png", backgroundImage: "/scenes/finland-glass-cabin/images/finland-glass-cabin.png", ambientAudio: "/scenes/finland-glass-cabin/audio/fireplace.m4a", seasonalAudio: "/scenes/finland-glass-cabin/audio/outside-wind.mp3", description: "Stay until the sky begins to dance.", mood: "escape", weather: "−14°C · Clear night", time: "12:16 AM", aiPrompt: "Write one short quiet observation from a warm glass cabin in Finnish Lapland. Mention only one subtle detail and never give advice.", status: "available", motion: cinematicPushIn(1.02, 45), scenePresence: { timeOfDay: "Midnight", atmosphere: "Warm Interior · Winter Quiet", whisper: "The night is wider here." } },
  { id: "norwegian-fjord-house", name: "Beyond the Fjord", country: "Norway", city: "Geiranger", location: "Geiranger, Norway", timezone: "Europe/Oslo", weatherLocation: "Geiranger, NO", coverImage: "/scenes/norwegian-fjord-house/images/norwegian-fjord-house.png", backgroundImage: "/scenes/norwegian-fjord-house/images/norwegian-fjord-house.png", ambientAudio: "/scenes/norwegian-fjord-house/audio/fjord-water.mp3", seasonalAudio: "", description: "Leave the noise on the other side.", mood: "escape", weather: "14°C · Quiet evening", time: "Golden hour", aiPrompt: "Write one short quiet observation from a Norwegian fjord house.", status: "available", motion: cinematicPushIn(1.02, 45), scenePresence: { timeOfDay: "Golden Hour", atmosphere: "Open Air · Still Fjord", whisper: "The world feels very far away." } },
  { id: "tuscany-summer-villa", name: "Home Again", country: "Italy", city: "Tuscany", location: "Tuscany, Italy", timezone: "Europe/Rome", weatherLocation: "Tuscany, IT", coverImage: "/scenes/tuscany-summer-villa/images/tuscany-summer-villa.png", backgroundImage: "/scenes/tuscany-summer-villa/images/tuscany-summer-villa.png", ambientAudio: "/scenes/tuscany-summer-villa/audio/quiet-town-ambience.mp3", seasonalAudio: "", description: "Someone has already saved you a seat.", mood: "warm", weather: "27°C · Golden sun", time: "4:40 PM", aiPrompt: "Write one short quiet observation from a Tuscan villa.", status: "available", motion: cinematicPushIn(1.03, 42), scenePresence: { timeOfDay: "Late Afternoon", atmosphere: "Warm Stone · Golden Sun", whisper: "Someone has already saved you a seat." } },
  { id: "provence-kitchen", name: "Fresh from the Oven", country: "France", city: "Provence", location: "Provence, France", timezone: "Europe/Paris", weatherLocation: "Provence, FR", coverImage: "/scenes/provence-kitchen/images/provence-kitchen.png", backgroundImage: "/scenes/provence-kitchen/images/provence-kitchen.png", ambientAudio: "/scenes/provence-kitchen/audio/garden-ambience.mp3", seasonalAudio: "", description: "The room still smells like warm bread.", mood: "warm", weather: "24°C · Open windows", time: "11:15 AM", aiPrompt: "Write one short quiet observation from a Provence kitchen.", status: "available", motion: cinematicPushIn(1.028, 43), scenePresence: { timeOfDay: "Late Morning", atmosphere: "Open Windows · Summer Air", whisper: "The bread is still warm." } },
  { id: "seoul-rooftop-sunset", name: "Dinner Above the City", country: "South Korea", city: "Seoul", location: "Seoul, South Korea", timezone: "Asia/Seoul", weatherLocation: "Seoul, KR", coverImage: "/scenes/seoul-rooftop-sunset/images/seoul-rooftop-sunset.png", backgroundImage: "/scenes/seoul-rooftop-sunset/images/seoul-rooftop-sunset.png", ambientAudio: "/scenes/seoul-rooftop-sunset/audio/seoul-city-ambience.mp3", seasonalAudio: "", description: "The lights come on, one by one.", mood: "warm", weather: "22°C · Sunset breeze", time: "7:26 PM", aiPrompt: "Write one short quiet observation from a Seoul rooftop at sunset.", status: "available", motion: cinematicPushIn(1.025, 44), scenePresence: { timeOfDay: "Sunset", atmosphere: "Warm Rooftop · Evening Breeze", whisper: "The city is lighting up below." } },
  { id: BALI_SUNRISE_DESTINATION_ID, name: "First Light", country: "Indonesia", city: "Ubud", location: "Bali, Indonesia", timezone: "Asia/Makassar", weatherLocation: "Ubud, ID", coverImage: "/scenes/bali-sunrise-house/images/bali-sunrise-house.png", backgroundImage: "/scenes/bali-sunrise-house/images/bali-sunrise-house.png", ambientAudio: "/scenes/bali-sunrise-house/audio/morning-garden.mp3", seasonalAudio: "", description: "Every morning begins with the same promise.", mood: "reset", weather: "23°C · First light", time: "6:02 AM", aiPrompt: "Write one short quiet observation from an Ubud sunrise house.", status: "available", discoveryTiming: "completion", motion: cinematicPushIn(1.03, 42), scenePresence: { timeOfDay: "Sunrise", atmosphere: "Soft Warmth · Morning Mist", whisper: "Morning has found you again." } },
  { id: "new-zealand-mountain-cabin", name: "A New Trail", country: "New Zealand", city: "South Island", location: "South Island, New Zealand", timezone: "Pacific/Auckland", weatherLocation: "South Island, NZ", coverImage: "/scenes/new-zealand-mountain-cabin/images/new-zealand-mountain-cabin.png", backgroundImage: "/scenes/new-zealand-mountain-cabin/images/new-zealand-mountain-cabin.png", ambientAudio: "/scenes/new-zealand-mountain-cabin/audio/hot-spring-water.mp3", seasonalAudio: "", description: "The next step is enough.", mood: "reset", weather: "10°C · Bright wind", time: "8:20 AM", aiPrompt: "Write one short quiet observation from a New Zealand mountain cabin.", status: "available", motion: cinematicPushIn(1.03, 43), scenePresence: { timeOfDay: "Morning", atmosphere: "Crisp Air · Mountain Light", whisper: "The next step is enough." } },
  { id: "california-coastal-morning", name: "Above the Clouds", country: "United States", city: "Big Sur", location: "Big Sur, California", timezone: "America/Los_Angeles", weatherLocation: "Big Sur, US", coverImage: "/scenes/california-coastal-morning/images/california-coastal-morning.png", backgroundImage: "/scenes/california-coastal-morning/images/california-coastal-morning.png", ambientAudio: "/scenes/california-coastal-morning/audio/coastal-waves.wav", seasonalAudio: "", description: "Some mornings change everything.", mood: "reset", weather: "18°C · Ocean mist", time: "7:36 AM", aiPrompt: "Write one short quiet observation from a California coast at morning.", status: "available", motion: cinematicPushIn(1.025, 45), scenePresence: { timeOfDay: "Early Morning", atmosphere: "Salt Air · Coastal Haze", whisper: "The day is beginning below you." } },
];

export const moodById = (id?: string) => moods.find((mood) => mood.id === id);
export const sceneById = (id?: string) => scenes.find((scene) => scene.id === id);
export const scenesForMood = (moodId: string) => scenes.filter((scene) => scene.mood === moodId);
