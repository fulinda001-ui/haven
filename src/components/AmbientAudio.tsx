"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

type AmbientAudioProps = { sceneId: string };
type LayerName = "birds" | "breeze";
type Players = { base: HTMLAudioElement; birds: HTMLAudioElement; breeze: HTMLAudioElement };

export type AmbientAudioHandle = {
  getAmbientAudio: () => HTMLAudioElement | null;
  primeBaliTempleBell: () => void;
  startSoundscape: () => void;
  pauseSoundscape: () => void;
  resumeSoundscape: () => void;
  stopSoundscape: (fadeMs?: number) => void;
};

type PreparedPrimaryAudio = {
  sceneId: string;
  source: string;
  audio: HTMLAudioElement;
};

const AUDIO = {
  base: "/scenes/hokkaido-cabin/audio/ambient.mp3",
  birds: "/scenes/hokkaido-cabin/audio/forest-birds-ambience.m4a",
  breeze: "/scenes/hokkaido-cabin/audio/dbsound-light-breeze-through-cabin-slats-327161.mp3",
} as const;

const KYOTO_RAIN_AUDIO = "/scenes/kyoto-rainy-cafe/audio/rain.m4a";
const KYOTO_CUP_AUDIO = "/scenes/kyoto-rainy-cafe/audio/cup-and-saucer.mp3";
const KYOTO_CUP_INTERVAL = { minimum: 90000, maximum: 240000 } as const;
const KYOTO_PAGE_TURN_AUDIO = "/scenes/kyoto-rainy-cafe/audio/page-turn.mp3";
const KYOTO_PAGE_TURN_INTERVAL = { minimum: 70000, maximum: 190000 } as const;
const KYOTO_CHAIR_AUDIO = "/scenes/kyoto-rainy-cafe/audio/chair-creak.mp3";
const KYOTO_CHAIR_INTERVAL = { minimum: 180000, maximum: 420000 } as const;
const SWISS_LAKES_AMBIENCE = "/scenes/swiss-lakes/audio/morning-ambience.m4a";
const SWISS_LAKES_WATER = "/scenes/swiss-lakes/audio/lake-wavelets.mp3";
const ICELAND_OCEAN_AUDIO = "/scenes/iceland-aurora-lodge/audio/atlantic-ocean.mp3";
// Heard from inside the cabin: present enough to identify the Atlantic, but
// far enough behind the nearby fireplace to preserve the sheltered viewpoint.
const ICELAND_OCEAN_BASE_VOLUME = 0.145;
const ICELAND_OCEAN_FILTER_FREQUENCY = 4200;
const ICELAND_OCEAN_FILTER_Q = 0.5;
const ICELAND_FIREPLACE_AUDIO = "/scenes/iceland-aurora-lodge/audio/indoor-fireplace.mp3";
// The fireplace is the nearby indoor detail while the Atlantic remains outside.
const ICELAND_FIREPLACE_BASE_VOLUME = 0.07;
const PROVENCE_GARDEN_AUDIO = "/scenes/provence-kitchen/audio/garden-ambience.mp3";
// A slightly quieter bed leaves the garden details present without the outdoor air taking over.
const PROVENCE_GARDEN_BASE_VOLUME = 0.14;
const PROVENCE_CERAMIC_AUDIO = "/scenes/provence-kitchen/audio/ceramic-cup-and-saucer.mp3";
const PROVENCE_CERAMIC_INTERVAL = { minimum: 180000, maximum: 480000 } as const;
const PROVENCE_WOOD_CREAK_AUDIO = "/scenes/provence-kitchen/audio/wooden-house-creak.mp3";
const PROVENCE_WOOD_CREAK_INTERVAL = { minimum: 300000, maximum: 720000 } as const;
const TUSCANY_TOWN_AUDIO = "/scenes/tuscany-summer-villa/audio/quiet-town-ambience.mp3";
// A further +2 dB raises the village presence without processing the recording.
const TUSCANY_TOWN_BASE_VOLUME = 0.353;
const TUSCANY_TOWN_DURATION_SECONDS = 54.984;
const TUSCANY_TOWN_CROSSFADE_SECONDS = 8;
const TUSCANY_FOUNTAIN_AUDIO = "/scenes/tuscany-summer-villa/audio/stone-fountain.mp3";
// -6 dB from the first fountain mix. It now remains a distant layer beneath the village.
const TUSCANY_FOUNTAIN_BASE_VOLUME = 0.035;
const TUSCANY_FOUNTAIN_DURATION_SECONDS = 45.048;
const TUSCANY_FOUNTAIN_CROSSFADE_SECONDS = 6;
const TUSCANY_FOUNTAIN_DRIFT_DECIBELS = 2;
const TUSCANY_FOUNTAIN_DRIFT_MINIMUM_MS = 6 * 60 * 1000;
const TUSCANY_FOUNTAIN_DRIFT_MAXIMUM_MS = 10 * 60 * 1000;
const SEOUL_CITY_AMBIENCE_AUDIO = "/scenes/seoul-rooftop-sunset/audio/seoul-city-ambience.mp3";
const SEOUL_CITY_AMBIENCE_BASE_VOLUME = 0.18;
const SEOUL_CITY_AMBIENCE_DURATION_SECONDS = 203.328;
const SEOUL_CITY_CROSSFADE_SECONDS = 8;
const SEOUL_BIRD_FILTER_FREQUENCY = 4200;
const SEOUL_BIRD_FILTER_Q = 1.6;
const SEOUL_BIRD_FILTER_GAIN_DB = -3.5;
const SEOUL_WIND_CHIME_AUDIO = "/scenes/seoul-rooftop-sunset/audio/wind-chime.mp3";
const SEOUL_WIND_CHIME_FIRST_INTERVAL = { minimum: 4 * 60 * 1000, maximum: 10 * 60 * 1000 } as const;
const SEOUL_WIND_CHIME_REPEAT_INTERVAL = { minimum: 10 * 60 * 1000, maximum: 20 * 60 * 1000 } as const;
// About 16.5 dB below the city bed, with a ±1 dB natural variation per event.
const SEOUL_WIND_CHIME_VOLUME = { minimum: 0.024, maximum: 0.03 } as const;
const FINLAND_FIREPLACE_AUDIO = "/scenes/finland-glass-cabin/audio/fireplace.m4a";
const FINLAND_FIREPLACE_BASE_VOLUME = 0.3;
const FINLAND_WIND_AUDIO = "/scenes/finland-glass-cabin/audio/outside-wind.mp3";
// About 10 dB below the fireplace: audible as a distant exterior layer, never foreground.
const FINLAND_WIND_BASE_VOLUME = 0.03;
const NORWEGIAN_CABIN_SOUNDSCAPE_AUDIO = "/scenes/norwegian-fjord-house/audio/norwegian-cabin-soundscape.m4a";
// The listener is elevated and indoors; the fjord should be almost forgotten.
const NORWEGIAN_CABIN_SOUNDSCAPE_BASE_VOLUME = 0.075;
const NORWEGIAN_CABIN_FILTER_FREQUENCY = 3200;
const NORWEGIAN_CABIN_FILTER_Q = 0.45;
const NORWEGIAN_FERRY_HORN_AUDIO = "/scenes/norwegian-fjord-house/audio/distant-ferry-horn.m4a";
const NORWEGIAN_FERRY_HORN_VOLUME = 0.11;
const NORWEGIAN_FERRY_HORN_FILTER_FREQUENCY = 3400;
const NORWEGIAN_FERRY_HORN_FILTER_Q = 0.45;
const NORWEGIAN_FERRY_HORN_FIRST_INTERVAL = { minimum: 35 * 1000, maximum: 70 * 1000 } as const;
const NORWEGIAN_FERRY_HORN_REPEAT_INTERVAL = { minimum: 3 * 60 * 1000, maximum: 6 * 60 * 1000 } as const;
const NORWEGIAN_FERRY_HORN_PREPARE_LEAD_MS = 5000;
const NORWEGIAN_FERRY_HORN_AUDIBLE_OFFSET_MS = 4200;
const NEW_ZEALAND_HOT_SPRING_AUDIO = "/scenes/new-zealand-mountain-cabin/audio/hot-spring-water.mp3";
// Nearby water remains tactile, but silence now carries the scale of the alpine landscape.
const NEW_ZEALAND_HOT_SPRING_BASE_VOLUME = 0.09;
const NEW_ZEALAND_HOT_SPRING_DURATION_SECONDS = 60.456;
const NEW_ZEALAND_HOT_SPRING_CROSSFADE_SECONDS = 8;
const NEW_ZEALAND_HOT_SPRING_HIGH_PASS_FREQUENCY = 65;
const NEW_ZEALAND_HOT_SPRING_HIGH_PASS_Q = 0.7;
const NEW_ZEALAND_HOT_SPRING_LOW_SHELF_FREQUENCY = 120;
const NEW_ZEALAND_HOT_SPRING_LOW_SHELF_GAIN_DB = -2;
const NEW_ZEALAND_HOT_SPRING_STEREO_PAN = -0.08;
const NEW_ZEALAND_TUSSOCK_AUDIO = "/scenes/new-zealand-mountain-cabin/audio/alpine-tussock-breeze.m4a";
const NEW_ZEALAND_TUSSOCK_VOLUME = 0.12;
const NEW_ZEALAND_TUSSOCK_FIRST_INTERVAL = { minimum: 25 * 1000, maximum: 50 * 1000 } as const;
const NEW_ZEALAND_TUSSOCK_REPEAT_INTERVAL = { minimum: 2 * 60 * 1000, maximum: 5 * 60 * 1000 } as const;
const NEW_ZEALAND_TUSSOCK_PREPARE_LEAD_MS = 5000;
// The source begins with about 2.8 seconds of intentional silence. Scheduling
// accounts for it so the audible grass movement still lands inside the range.
const NEW_ZEALAND_TUSSOCK_AUDIBLE_OFFSET_MS = 2800;
const CALIFORNIA_COASTAL_WAVES_AUDIO = "/scenes/california-coastal-morning/audio/coastal-waves.m4a";
// The listener is high above the coastline: silence carries the height while
// the surf remains a distant environmental reference far below.
const CALIFORNIA_COASTAL_WAVES_BASE_VOLUME = 0.06;
const CALIFORNIA_COASTAL_WAVES_DURATION_SECONDS = 169.5;
const CALIFORNIA_COASTAL_WAVES_CROSSFADE_SECONDS = 10;
const CALIFORNIA_COASTAL_WAVES_LOW_SHELF_FREQUENCY = 180;
const CALIFORNIA_COASTAL_WAVES_LOW_SHELF_GAIN_DB = -3;
const CALIFORNIA_COASTAL_WAVES_PRESENCE_DIP_FREQUENCY = 2200;
const CALIFORNIA_COASTAL_WAVES_PRESENCE_DIP_Q = 0.7;
const CALIFORNIA_COASTAL_WAVES_PRESENCE_DIP_GAIN_DB = -2;
const CALIFORNIA_RIDGE_BIRD_AUDIO = "/scenes/california-coastal-morning/audio/distant-ridge-bird.m4a";
const CALIFORNIA_RIDGE_BIRD_VOLUME = 0.12;
const CALIFORNIA_RIDGE_BIRD_FIRST_INTERVAL = { minimum: 35 * 1000, maximum: 70 * 1000 } as const;
const CALIFORNIA_RIDGE_BIRD_REPEAT_INTERVAL = { minimum: 4 * 60 * 1000, maximum: 8 * 60 * 1000 } as const;
const CALIFORNIA_RIDGE_BIRD_PREPARE_LEAD_MS = 5000;
// The selected source event has about 3.1 seconds of quiet before the call.
const CALIFORNIA_RIDGE_BIRD_AUDIBLE_OFFSET_MS = 3100;
const BALI_MORNING_AUDIO = "/scenes/bali-sunrise-house/audio/morning-garden.mp3";
const BALI_MORNING_BASE_VOLUME = 0.16;
const BALI_TEMPLE_BELL_AUDIO = "/scenes/bali-sunrise-house/audio/temple-bell-single.m4a";
// About 10 dB below the previously approved verification level, so the bell
// sits well behind the morning garden rather than defining the soundscape.
const BALI_TEMPLE_BELL_VOLUME = 0.08;
const BALI_TEMPLE_BELL_FIRST_DELAY_MS = 2500;
const BALI_TEMPLE_BELL_REPEAT_INTERVAL = { minimum: 10 * 60 * 1000, maximum: 15 * 60 * 1000 } as const;
const HOKKAIDO_SECONDARY_PREPARE_LEAD_MS = 5000;

export type PrimaryAudioPreparationIntent = "preview" | "committed";

const PRIMARY_AUDIO_BY_SCENE_ID: Record<string, string> = {
  "hokkaido-forest-cabin": AUDIO.base,
  "kyoto-rainy-cafe": KYOTO_RAIN_AUDIO,
  "swiss-lakeside-morning": SWISS_LAKES_AMBIENCE,
  "iceland-aurora-lodge": ICELAND_OCEAN_AUDIO,
  "finland-glass-cabin": FINLAND_FIREPLACE_AUDIO,
  "norwegian-fjord-house": NORWEGIAN_CABIN_SOUNDSCAPE_AUDIO,
  "tuscany-summer-villa": TUSCANY_TOWN_AUDIO,
  "provence-kitchen": PROVENCE_GARDEN_AUDIO,
  "seoul-rooftop-sunset": SEOUL_CITY_AMBIENCE_AUDIO,
  "bali-sunrise-house": BALI_MORNING_AUDIO,
  "new-zealand-mountain-cabin": NEW_ZEALAND_HOT_SPRING_AUDIO,
  "california-coastal-morning": CALIFORNIA_COASTAL_WAVES_AUDIO,
};

let preparedPrimaryAudio: PreparedPrimaryAudio | null = null;

function releaseAudioElement(audio: HTMLAudioElement) {
  audio.pause();
  audio.removeAttribute("src");
  audio.load();
  audio.remove();
}

/**
 * Network/media preparation only. This function deliberately never calls
 * play(), never creates/resumes an AudioContext, and never schedules events.
 */
export function preparePrimaryAmbientAudio(sceneId: string, intent: PrimaryAudioPreparationIntent = "preview") {
  if (typeof window === "undefined") return;
  const source = PRIMARY_AUDIO_BY_SCENE_ID[sceneId];
  if (!source) return;
  const preload = intent === "committed" ? "auto" : "metadata";
  if (preparedPrimaryAudio?.sceneId === sceneId) {
    if (preload === "auto" && preparedPrimaryAudio.audio.preload !== "auto") {
      preparedPrimaryAudio.audio.preload = "auto";
      preparedPrimaryAudio.audio.load();
    }
    return;
  }
  if (preparedPrimaryAudio) releaseAudioElement(preparedPrimaryAudio.audio);

  const audio = new Audio();
  audio.preload = preload;
  audio.muted = false;
  audio.volume = 0;
  audio.setAttribute("aria-hidden", "true");
  audio.style.display = "none";
  audio.src = source;
  document.body.append(audio);
  audio.load();
  preparedPrimaryAudio = { sceneId, source, audio };
}

export function releasePreparedPrimaryAmbientAudio(sceneId?: string) {
  if (!preparedPrimaryAudio || (sceneId && preparedPrimaryAudio.sceneId !== sceneId)) return;
  releaseAudioElement(preparedPrimaryAudio.audio);
  preparedPrimaryAudio = null;
}

function acquirePrimaryAudio(sceneId: string, source: string) {
  let audio: HTMLAudioElement;
  if (preparedPrimaryAudio?.sceneId === sceneId && preparedPrimaryAudio.source === source) {
    audio = preparedPrimaryAudio.audio;
    preparedPrimaryAudio = null;
  } else {
    if (preparedPrimaryAudio) releaseAudioElement(preparedPrimaryAudio.audio);
    preparedPrimaryAudio = null;
    audio = new Audio(source);
  }
  audio.preload = "auto";
  audio.muted = false;
  audio.volume = 0;
  audio.setAttribute("aria-hidden", "true");
  audio.style.display = "none";
  if (!audio.isConnected) document.body.append(audio);
  if (audio.readyState === HTMLMediaElement.HAVE_NOTHING) audio.load();
  return audio;
}

function createDeferredStandbyAudio() {
  const audio = new Audio();
  audio.preload = "none";
  audio.loop = false;
  audio.muted = false;
  audio.volume = 0;
  audio.setAttribute("aria-hidden", "true");
  audio.style.display = "none";
  document.body.append(audio);
  return audio;
}

function prepareStandbyAudio(audio: HTMLAudioElement, source: string) {
  if (audio.getAttribute("src")) return;
  audio.preload = "auto";
  audio.src = source;
  audio.load();
}

const randomBetween = (minimum: number, maximum: number) => minimum + Math.random() * (maximum - minimum);

class HokkaidoSoundscape {
  private players: Players | null = null;
  private timers = new Set<ReturnType<typeof setTimeout>>();
  private fadeFrames = new Map<HTMLAudioElement, number>();
  private running = false;

  private createPlayer(source: string, loop = false, primarySceneId?: string) {
    const audio = primarySceneId ? acquirePrimaryAudio(primarySceneId, source) : new Audio(source);
    audio.preload = "auto";
    audio.loop = loop;
    audio.muted = false;
    audio.volume = 0;
    audio.setAttribute("aria-hidden", "true");
    audio.style.display = "none";
    if (!audio.isConnected) document.body.append(audio);
    if (audio.readyState === HTMLMediaElement.HAVE_NOTHING) audio.load();
    return audio;
  }

  private createDeferredLayerPlayer() {
    return createDeferredStandbyAudio();
  }

  ensure() {
    if (!this.players) {
      this.players = {
        base: this.createPlayer(AUDIO.base, true, "hokkaido-forest-cabin"),
        birds: this.createDeferredLayerPlayer(),
        breeze: this.createDeferredLayerPlayer(),
      };
    }
    return this.players;
  }

  getAmbientAudio() {
    return this.ensure().base;
  }

  private schedule(callback: () => void, delay: number) {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      callback();
    }, delay);
    this.timers.add(timer);
  }

  private clearTimers() {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
  }

  private cancelFade(audio: HTMLAudioElement) {
    const frame = this.fadeFrames.get(audio);
    if (frame !== undefined) cancelAnimationFrame(frame);
    this.fadeFrames.delete(audio);
  }

  private cancelFades() {
    this.fadeFrames.forEach((frame) => cancelAnimationFrame(frame));
    this.fadeFrames.clear();
  }

  private fade(audio: HTMLAudioElement, target: number, duration: number, done?: () => void) {
    this.cancelFade(audio);
    const from = audio.volume;
    const began = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      this.fadeFrames.delete(audio);
      const progress = Math.min(1, (now - began) / duration);
      const eased = progress * progress * (3 - 2 * progress);
      audio.volume = from + (target - from) * eased;
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
        this.fadeFrames.set(audio, frame);
      } else {
        done?.();
      }
    };
    frame = requestAnimationFrame(tick);
    this.fadeFrames.set(audio, frame);
  }

  private reset(audio: HTMLAudioElement) {
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 0;
  }

  private scheduleLayer(layer: LayerName, delay: number) {
    if (!this.players) return;
    const audio = layer === "birds" ? this.players.birds : this.players.breeze;
    const source = layer === "birds" ? AUDIO.birds : AUDIO.breeze;
    if (!audio.getAttribute("src")) {
      const prepareAfter = Math.max(1000, delay - HOKKAIDO_SECONDARY_PREPARE_LEAD_MS);
      this.schedule(() => {
        if (this.running) prepareStandbyAudio(audio, source);
      }, prepareAfter);
    }
    this.schedule(() => {
      if (!this.running || !this.players) return;
      if (!audio.getAttribute("src")) prepareStandbyAudio(audio, source);
      const target = layer === "birds" ? 0.23 : 0.16;
      const fadeIn = layer === "birds" ? randomBetween(2200, 3600) : randomBetween(2600, 4000);
      const fadeOut = layer === "birds" ? randomBetween(3200, 4800) : randomBetween(3600, 5000);
      const nextGap = layer === "birds" ? randomBetween(30000, 75000) : randomBetween(45000, 100000);
      const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
      const availableStart = Math.max(0, Math.min(32, duration - (fadeIn + fadeOut) / 1000 - 8));

      audio.currentTime = availableStart > 0 ? randomBetween(0, availableStart) : 0;
      audio.volume = 0;
      void audio.play().then(() => this.fade(audio, target, fadeIn)).catch(() => {});

      const remaining = duration > 0 ? Math.max(0, (duration - audio.currentTime) * 1000) : 60000;
      const fadeOutAfter = Math.max(fadeIn + 600, remaining - fadeOut - 250);
      this.schedule(() => {
        if (!this.running) return;
        this.fade(audio, 0, fadeOut, () => this.reset(audio));
      }, fadeOutAfter);
      this.schedule(() => {
        if (this.running) this.scheduleLayer(layer, nextGap);
      }, fadeOutAfter + fadeOut + 300);
    }, delay);
  }

  /** Called only after SceneStage has already called base.play() in Enter. */
  startSoundscape() {
    const { base, birds, breeze } = this.ensure();
    if (this.running) return;
    this.clearTimers();
    this.cancelFades();
    this.reset(birds);
    this.reset(breeze);
    this.running = true;
    this.fade(base, 0.52, 3000);
    this.scheduleLayer("birds", randomBetween(8000, 20000));
    this.scheduleLayer("breeze", randomBetween(15000, 35000));
  }

  pauseSoundscape() {
    if (!this.players) return;
    this.running = false;
    this.clearTimers();
    [this.players.base, this.players.birds, this.players.breeze].forEach((audio) => {
      this.fade(audio, 0, 700, () => audio.pause());
    });
  }

  resumeSoundscape() {
    if (this.running) return;
    const { base, birds, breeze } = this.ensure();
    this.clearTimers();
    this.reset(birds);
    this.reset(breeze);
    this.running = true;
    void base.play().then(() => this.fade(base, 0.52, 850)).catch(() => {});
    this.scheduleLayer("birds", randomBetween(8000, 20000));
    this.scheduleLayer("breeze", randomBetween(15000, 35000));
  }

  stopSoundscape(fadeMs = 2800) {
    if (!this.players) return;
    this.running = false;
    this.clearTimers();
    const layers = [this.players.base, this.players.birds, this.players.breeze];
    layers.forEach((audio) => {
      this.fade(audio, 0, fadeMs, () => this.reset(audio));
    });
  }

  destroy() {
    this.running = false;
    this.clearTimers();
    this.cancelFades();
    if (!this.players) return;
    Object.values(this.players).forEach((audio) => {
      this.reset(audio);
      audio.remove();
    });
    this.players = null;
  }
}

class KyotoRainSoundscape {
  private player: HTMLAudioElement | null = null;
  private cupPlayer: HTMLAudioElement | null = null;
  private pagePlayer: HTMLAudioElement | null = null;
  private chairPlayer: HTMLAudioElement | null = null;
  private fadeFrame: number | null = null;
  private cupTimer: number | null = null;
  private pageTimer: number | null = null;
  private chairTimer: number | null = null;
  private cupContext: AudioContext | null = null;
  private cupSource: MediaElementAudioSourceNode | null = null;
  private cupPanner: StereoPannerNode | null = null;
  private pageSource: MediaElementAudioSourceNode | null = null;
  private pagePanner: StereoPannerNode | null = null;
  private chairSource: MediaElementAudioSourceNode | null = null;
  private chairPanner: StereoPannerNode | null = null;
  private running = false;

  private ensure() {
    if (!this.player) {
      const audio = acquirePrimaryAudio("kyoto-rainy-cafe", KYOTO_RAIN_AUDIO);
      audio.preload = "auto";
      audio.loop = true;
      audio.muted = false;
      audio.volume = 0;
      audio.setAttribute("aria-hidden", "true");
      audio.style.display = "none";
      if (!audio.isConnected) document.body.append(audio);
      if (audio.readyState === HTMLMediaElement.HAVE_NOTHING) audio.load();
      this.player = audio;
    }
    return this.player;
  }

  getAmbientAudio() {
    return this.ensure();
  }

  private ensureCup() {
    if (!this.cupPlayer) {
      const audio = new Audio(KYOTO_CUP_AUDIO);
      audio.preload = "auto";
      audio.loop = false;
      audio.muted = false;
      audio.volume = 0.08;
      audio.setAttribute("aria-hidden", "true");
      audio.style.display = "none";
      audio.onended = () => { if (this.running) this.scheduleCup(); };
      document.body.append(audio);
      audio.load();
      this.cupPlayer = audio;
    }
    return this.cupPlayer;
  }

  private ensurePage() {
    if (!this.pagePlayer) {
      const audio = new Audio(KYOTO_PAGE_TURN_AUDIO);
      audio.preload = "auto";
      audio.loop = false;
      audio.muted = false;
      audio.volume = 0.035;
      audio.setAttribute("aria-hidden", "true");
      audio.style.display = "none";
      audio.onended = () => { if (this.running) this.schedulePage(); };
      document.body.append(audio);
      audio.load();
      this.pagePlayer = audio;
    }
    return this.pagePlayer;
  }

  private ensureChair() {
    if (!this.chairPlayer) {
      const audio = new Audio(KYOTO_CHAIR_AUDIO);
      audio.preload = "auto";
      audio.loop = false;
      audio.muted = false;
      audio.volume = 0.03;
      audio.setAttribute("aria-hidden", "true");
      audio.style.display = "none";
      audio.onended = () => { if (this.running) this.scheduleChair(); };
      document.body.append(audio);
      audio.load();
      this.chairPlayer = audio;
    }
    return this.chairPlayer;
  }

  private setupCupPosition(audio: HTMLAudioElement) {
    if (this.cupContext || !window.AudioContext) return;
    const context = new AudioContext();
    const source = context.createMediaElementSource(audio);
    const panner = context.createStereoPanner();
    source.connect(panner).connect(context.destination);
    this.cupContext = context;
    this.cupSource = source;
    this.cupPanner = panner;
  }

  private setupPagePosition(audio: HTMLAudioElement) {
    if (!this.cupContext || this.pageSource) return;
    const source = this.cupContext.createMediaElementSource(audio);
    const panner = this.cupContext.createStereoPanner();
    source.connect(panner).connect(this.cupContext.destination);
    this.pageSource = source;
    this.pagePanner = panner;
  }

  private setupChairPosition(audio: HTMLAudioElement) {
    if (!this.cupContext || this.chairSource) return;
    const source = this.cupContext.createMediaElementSource(audio);
    const panner = this.cupContext.createStereoPanner();
    source.connect(panner).connect(this.cupContext.destination);
    this.chairSource = source;
    this.chairPanner = panner;
  }

  private clearCupTimer() {
    if (this.cupTimer !== null) window.clearTimeout(this.cupTimer);
    this.cupTimer = null;
  }

  private clearPageTimer() {
    if (this.pageTimer !== null) window.clearTimeout(this.pageTimer);
    this.pageTimer = null;
  }

  private clearChairTimer() {
    if (this.chairTimer !== null) window.clearTimeout(this.chairTimer);
    this.chairTimer = null;
  }

  private scheduleCup() {
    this.clearCupTimer();
    if (!this.running) return;
    const delay = randomBetween(KYOTO_CUP_INTERVAL.minimum, KYOTO_CUP_INTERVAL.maximum);
    this.cupTimer = window.setTimeout(() => {
      this.cupTimer = null;
      this.playCup();
    }, delay);
  }

  private playCup() {
    if (!this.running) return;
    const audio = this.ensureCup();
    if (!audio.paused) return;
    this.setupCupPosition(audio);
    if (this.cupContext?.state === "suspended") void this.cupContext.resume();
    if (this.cupPanner) this.cupPanner.pan.value = randomBetween(-0.2, 0.2);
    audio.currentTime = 0;
    audio.volume = randomBetween(0.03, 0.06);
    void audio.play().catch(() => { if (this.running) this.scheduleCup(); });
  }

  private schedulePage() {
    this.clearPageTimer();
    if (!this.running) return;
    const delay = randomBetween(KYOTO_PAGE_TURN_INTERVAL.minimum, KYOTO_PAGE_TURN_INTERVAL.maximum);
    this.pageTimer = window.setTimeout(() => {
      this.pageTimer = null;
      this.playPage();
    }, delay);
  }

  private playPage() {
    if (!this.running) return;
    const audio = this.ensurePage();
    if (!audio.paused) return;
    this.setupPagePosition(audio);
    if (this.cupContext?.state === "suspended") void this.cupContext.resume();
    if (this.pagePanner) this.pagePanner.pan.value = randomBetween(-0.2, 0.2);
    audio.currentTime = 0;
    audio.volume = randomBetween(0.025, 0.05);
    void audio.play().catch(() => { if (this.running) this.schedulePage(); });
  }

  private scheduleChair() {
    this.clearChairTimer();
    if (!this.running) return;
    const delay = randomBetween(KYOTO_CHAIR_INTERVAL.minimum, KYOTO_CHAIR_INTERVAL.maximum);
    this.chairTimer = window.setTimeout(() => {
      this.chairTimer = null;
      this.playChair();
    }, delay);
  }

  private playChair() {
    if (!this.running) return;
    const audio = this.ensureChair();
    if (!audio.paused) return;
    this.setupChairPosition(audio);
    if (this.cupContext?.state === "suspended") void this.cupContext.resume();
    if (this.chairPanner) this.chairPanner.pan.value = randomBetween(-0.2, 0.2);
    audio.currentTime = 0;
    audio.volume = randomBetween(0.02, 0.04);
    void audio.play().catch(() => { if (this.running) this.scheduleChair(); });
  }

  private resetCup() {
    if (!this.cupPlayer) return;
    this.cupPlayer.pause();
    this.cupPlayer.currentTime = 0;
    this.cupPlayer.volume = 0.08;
  }

  private resetPage() {
    if (!this.pagePlayer) return;
    this.pagePlayer.pause();
    this.pagePlayer.currentTime = 0;
    this.pagePlayer.volume = 0.035;
  }

  private resetChair() {
    if (!this.chairPlayer) return;
    this.chairPlayer.pause();
    this.chairPlayer.currentTime = 0;
    this.chairPlayer.volume = 0.03;
  }

  private cancelFade() {
    if (this.fadeFrame !== null) cancelAnimationFrame(this.fadeFrame);
    this.fadeFrame = null;
  }

  private fade(target: number, duration: number, done?: () => void) {
    const audio = this.ensure();
    this.cancelFade();
    const from = audio.volume;
    const began = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - began) / duration);
      const eased = progress * progress * (3 - 2 * progress);
      audio.volume = from + (target - from) * eased;
      if (progress < 1) this.fadeFrame = requestAnimationFrame(tick);
      else { this.fadeFrame = null; done?.(); }
    };
    this.fadeFrame = requestAnimationFrame(tick);
  }

  startSoundscape() {
    const audio = this.ensure();
    if (this.running) return;
    this.running = true;
    audio.loop = true;
    audio.muted = false;
    this.fade(0.42, 2000);
    const cup = this.ensureCup();
    this.setupCupPosition(cup);
    if (this.cupContext?.state === "suspended") void this.cupContext.resume();
    this.resetCup();
    this.scheduleCup();
    const page = this.ensurePage();
    this.setupPagePosition(page);
    this.resetPage();
    this.schedulePage();
    const chair = this.ensureChair();
    this.setupChairPosition(chair);
    this.resetChair();
    this.scheduleChair();
  }

  pauseSoundscape() {
    this.running = false;
    this.clearCupTimer();
    this.clearPageTimer();
    this.clearChairTimer();
    this.resetCup();
    this.resetPage();
    this.resetChair();
    if (!this.player) return;
    this.fade(0, 700, () => this.player?.pause());
  }

  resumeSoundscape() {
    if (this.running) return;
    const audio = this.ensure();
    audio.loop = true;
    audio.muted = false;
    void audio.play().then(() => this.startSoundscape()).catch(() => {});
  }

  stopSoundscape(fadeMs = 2000) {
    this.running = false;
    this.clearCupTimer();
    this.clearPageTimer();
    this.clearChairTimer();
    this.resetCup();
    this.resetPage();
    this.resetChair();
    if (!this.player) return;
    this.fade(0, fadeMs, () => {
      if (!this.player) return;
      this.player.pause();
      this.player.currentTime = 0;
      this.player.volume = 0;
    });
  }

  destroy() {
    this.running = false;
    this.clearCupTimer();
    this.clearPageTimer();
    this.clearChairTimer();
    this.cancelFade();
    this.resetCup();
    this.resetPage();
    this.resetChair();
    this.cupPlayer?.remove();
    this.cupPlayer = null;
    this.pagePlayer?.remove();
    this.pagePlayer = null;
    this.chairPlayer?.remove();
    this.chairPlayer = null;
    this.cupSource?.disconnect();
    this.cupPanner?.disconnect();
    this.pageSource?.disconnect();
    this.pagePanner?.disconnect();
    this.chairSource?.disconnect();
    this.chairPanner?.disconnect();
    this.cupSource = null;
    this.cupPanner = null;
    this.pageSource = null;
    this.pagePanner = null;
    this.chairSource = null;
    this.chairPanner = null;
    if (this.cupContext) void this.cupContext.close();
    this.cupContext = null;
    if (!this.player) return;
    this.player.pause();
    this.player.currentTime = 0;
    this.player.remove();
    this.player = null;
  }
}

class IcelandAuroraSoundscape {
  private oceanPlayer: HTMLAudioElement | null = null;
  private fireplacePlayer: HTMLAudioElement | null = null;
  private fadeFrames = new Map<HTMLAudioElement, number>();
  private oceanContext: AudioContext | null = null;
  private oceanSource: MediaElementAudioSourceNode | null = null;
  private oceanFilter: BiquadFilterNode | null = null;
  private running = false;

  private createPlayer(source: string, primarySceneId?: string) {
    const audio = primarySceneId ? acquirePrimaryAudio(primarySceneId, source) : new Audio(source);
    audio.preload = "auto";
    audio.loop = true;
    audio.muted = false;
    audio.volume = 0;
    audio.setAttribute("aria-hidden", "true");
    audio.style.display = "none";
    if (!audio.isConnected) document.body.append(audio);
    if (audio.readyState === HTMLMediaElement.HAVE_NOTHING) audio.load();
    return audio;
  }

  private ensureOcean() {
    if (!this.oceanPlayer) this.oceanPlayer = this.createPlayer(ICELAND_OCEAN_AUDIO, "iceland-aurora-lodge");
    this.ensureOceanFilter();
    return this.oceanPlayer;
  }

  private ensureOceanFilter() {
    if (this.oceanSource || !this.oceanPlayer || typeof window === "undefined" || !window.AudioContext) return;
    this.oceanContext = new window.AudioContext();
    this.oceanSource = this.oceanContext.createMediaElementSource(this.oceanPlayer);
    this.oceanFilter = this.oceanContext.createBiquadFilter();
    this.oceanFilter.type = "lowpass";
    this.oceanFilter.frequency.value = ICELAND_OCEAN_FILTER_FREQUENCY;
    this.oceanFilter.Q.value = ICELAND_OCEAN_FILTER_Q;
    this.oceanSource.connect(this.oceanFilter).connect(this.oceanContext.destination);
  }

  private ensureFireplace() {
    if (!this.fireplacePlayer) this.fireplacePlayer = this.createPlayer(ICELAND_FIREPLACE_AUDIO);
    return this.fireplacePlayer;
  }

  getAmbientAudio() {
    return this.ensureOcean();
  }

  private cancelFade(audio: HTMLAudioElement) {
    const frame = this.fadeFrames.get(audio);
    if (frame !== undefined) cancelAnimationFrame(frame);
    this.fadeFrames.delete(audio);
  }

  private fade(audio: HTMLAudioElement, target: number, duration: number, done?: () => void) {
    this.cancelFade(audio);
    const from = audio.volume;
    const began = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - began) / duration);
      const eased = progress * progress * (3 - 2 * progress);
      audio.volume = from + (target - from) * eased;
      if (progress < 1) this.fadeFrames.set(audio, requestAnimationFrame(tick));
      else { this.fadeFrames.delete(audio); done?.(); }
    };
    this.fadeFrames.set(audio, requestAnimationFrame(tick));
  }

  private fadeAndPause(audio: HTMLAudioElement, duration: number) {
    this.fade(audio, 0, duration, () => {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0;
    });
  }

  /** Ocean playback itself begins in the real Enter click in SceneStage. */
  startSoundscape() {
    if (this.running) return;
    const ocean = this.ensureOcean();
    const fireplace = this.ensureFireplace();
    this.running = true;
    ocean.loop = true;
    ocean.muted = false;
    fireplace.loop = true;
    fireplace.muted = false;
    if (this.oceanContext?.state === "suspended") void this.oceanContext.resume();
    this.fade(ocean, ICELAND_OCEAN_BASE_VOLUME, 2000);
    void fireplace.play().then(() => this.fade(fireplace, ICELAND_FIREPLACE_BASE_VOLUME, 2000)).catch(() => {});
  }

  pauseSoundscape() {
    this.running = false;
    if (this.oceanPlayer) this.fade(this.oceanPlayer, 0, 700, () => this.oceanPlayer?.pause());
    if (this.fireplacePlayer) this.fade(this.fireplacePlayer, 0, 700, () => this.fireplacePlayer?.pause());
  }

  resumeSoundscape() {
    if (this.running) return;
    const ocean = this.ensureOcean();
    const fireplace = this.ensureFireplace();
    this.running = true;
    ocean.loop = true;
    ocean.muted = false;
    fireplace.loop = true;
    fireplace.muted = false;
    if (this.oceanContext?.state === "suspended") void this.oceanContext.resume();
    void ocean.play().then(() => this.fade(ocean, ICELAND_OCEAN_BASE_VOLUME, 850)).catch(() => {});
    void fireplace.play().then(() => this.fade(fireplace, ICELAND_FIREPLACE_BASE_VOLUME, 850)).catch(() => {});
  }

  stopSoundscape(fadeMs = 2000) {
    this.running = false;
    if (this.oceanPlayer) this.fadeAndPause(this.oceanPlayer, fadeMs);
    if (this.fireplacePlayer) this.fadeAndPause(this.fireplacePlayer, fadeMs);
  }

  destroy() {
    this.running = false;
    [this.oceanPlayer, this.fireplacePlayer].forEach((audio) => {
      if (!audio) return;
      this.cancelFade(audio);
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0;
      audio.remove();
    });
    this.oceanSource?.disconnect();
    this.oceanFilter?.disconnect();
    if (this.oceanContext) void this.oceanContext.close();
    this.oceanPlayer = null;
    this.fireplacePlayer = null;
    this.oceanContext = null;
    this.oceanSource = null;
    this.oceanFilter = null;
  }
}

class ProvenceGardenSoundscape {
  private player: HTMLAudioElement | null = null;
  private ceramicPlayer: HTMLAudioElement | null = null;
  private woodCreakPlayer: HTMLAudioElement | null = null;
  private fadeFrame: number | null = null;
  private ceramicTimer: number | null = null;
  private woodCreakTimer: number | null = null;
  private context: AudioContext | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private highPass: BiquadFilterNode | null = null;
  private lowShelf: BiquadFilterNode | null = null;
  private ceramicSource: MediaElementAudioSourceNode | null = null;
  private ceramicPanner: StereoPannerNode | null = null;
  private woodCreakSource: MediaElementAudioSourceNode | null = null;
  private woodCreakPanner: StereoPannerNode | null = null;
  private running = false;

  private ensure() {
    if (!this.player) {
      const audio = acquirePrimaryAudio("provence-kitchen", PROVENCE_GARDEN_AUDIO);
      audio.preload = "auto";
      audio.loop = true;
      audio.muted = false;
      audio.volume = 0;
      audio.setAttribute("aria-hidden", "true");
      audio.style.display = "none";
      if (!audio.isConnected) document.body.append(audio);
      if (audio.readyState === HTMLMediaElement.HAVE_NOTHING) audio.load();
      this.player = audio;
    }
    this.ensureFilters();
    return this.player;
  }

  private ensureFilters() {
    if (this.source || !this.player || typeof window === "undefined" || !window.AudioContext) return;
    this.context = new window.AudioContext();
    this.source = this.context.createMediaElementSource(this.player);
    this.highPass = this.context.createBiquadFilter();
    this.highPass.type = "highpass";
    this.highPass.frequency.value = 100;
    this.highPass.Q.value = 0.7;
    this.lowShelf = this.context.createBiquadFilter();
    this.lowShelf.type = "lowshelf";
    this.lowShelf.frequency.value = 125;
    this.lowShelf.gain.value = -3;
    this.source.connect(this.highPass).connect(this.lowShelf).connect(this.context.destination);
  }

  getAmbientAudio() {
    return this.ensure();
  }

  private ensureCeramic() {
    if (!this.ceramicPlayer) {
      const audio = new Audio(PROVENCE_CERAMIC_AUDIO);
      audio.preload = "auto";
      audio.loop = false;
      audio.muted = false;
      audio.volume = 0.026;
      audio.setAttribute("aria-hidden", "true");
      audio.style.display = "none";
      audio.onended = () => { if (this.running) this.scheduleCeramic(); };
      document.body.append(audio);
      audio.load();
      this.ceramicPlayer = audio;
    }
    this.ensureCeramicPosition();
    return this.ceramicPlayer;
  }

  private ensureCeramicPosition() {
    if (this.ceramicSource || !this.ceramicPlayer || !this.context) return;
    this.ceramicSource = this.context.createMediaElementSource(this.ceramicPlayer);
    this.ceramicPanner = this.context.createStereoPanner();
    this.ceramicSource.connect(this.ceramicPanner).connect(this.context.destination);
  }

  private ensureWoodCreak() {
    if (!this.woodCreakPlayer) {
      const audio = new Audio(PROVENCE_WOOD_CREAK_AUDIO);
      audio.preload = "auto";
      audio.loop = false;
      audio.muted = false;
      audio.volume = 0.019;
      audio.setAttribute("aria-hidden", "true");
      audio.style.display = "none";
      audio.onended = () => { if (this.running) this.scheduleWoodCreak(); };
      document.body.append(audio);
      audio.load();
      this.woodCreakPlayer = audio;
    }
    this.ensureWoodCreakPosition();
    return this.woodCreakPlayer;
  }

  private ensureWoodCreakPosition() {
    if (this.woodCreakSource || !this.woodCreakPlayer || !this.context) return;
    this.woodCreakSource = this.context.createMediaElementSource(this.woodCreakPlayer);
    this.woodCreakPanner = this.context.createStereoPanner();
    this.woodCreakSource.connect(this.woodCreakPanner).connect(this.context.destination);
  }

  private clearCeramicTimer() {
    if (this.ceramicTimer !== null) window.clearTimeout(this.ceramicTimer);
    this.ceramicTimer = null;
  }

  private clearWoodCreakTimer() {
    if (this.woodCreakTimer !== null) window.clearTimeout(this.woodCreakTimer);
    this.woodCreakTimer = null;
  }

  private resetCeramic() {
    if (!this.ceramicPlayer) return;
    this.ceramicPlayer.pause();
    this.ceramicPlayer.currentTime = 0;
    this.ceramicPlayer.volume = 0.026;
  }

  private resetWoodCreak() {
    if (!this.woodCreakPlayer) return;
    this.woodCreakPlayer.pause();
    this.woodCreakPlayer.currentTime = 0;
    this.woodCreakPlayer.volume = 0.019;
  }

  private scheduleCeramic() {
    this.clearCeramicTimer();
    if (!this.running) return;
    const delay = randomBetween(PROVENCE_CERAMIC_INTERVAL.minimum, PROVENCE_CERAMIC_INTERVAL.maximum);
    this.ceramicTimer = window.setTimeout(() => {
      this.ceramicTimer = null;
      this.playCeramic();
    }, delay);
  }

  private playCeramic() {
    if (!this.running) return;
    const audio = this.ensureCeramic();
    if (!audio.paused) return;
    if (this.context?.state === "suspended") void this.context.resume();
    if (this.ceramicPanner) this.ceramicPanner.pan.value = randomBetween(-0.12, 0.12);
    audio.currentTime = 0;
    // Roughly 14 dB under the garden bed, quiet enough to remain a discovered detail.
    audio.volume = randomBetween(0.022, 0.03);
    void audio.play().catch(() => { if (this.running) this.scheduleCeramic(); });
  }

  private scheduleWoodCreak() {
    this.clearWoodCreakTimer();
    if (!this.running) return;
    const delay = randomBetween(PROVENCE_WOOD_CREAK_INTERVAL.minimum, PROVENCE_WOOD_CREAK_INTERVAL.maximum);
    this.woodCreakTimer = window.setTimeout(() => {
      this.woodCreakTimer = null;
      this.playWoodCreak();
    }, delay);
  }

  private playWoodCreak() {
    if (!this.running) return;
    const audio = this.ensureWoodCreak();
    if (!audio.paused) return;
    if (this.context?.state === "suspended") void this.context.resume();
    if (this.woodCreakPanner) this.woodCreakPanner.pan.value = randomBetween(-0.1, 0.1);
    audio.currentTime = 0;
    // 16–19 dB under the garden bed: part of the building, never a foreground event.
    audio.volume = randomBetween(0.016, 0.022);
    void audio.play().catch(() => { if (this.running) this.scheduleWoodCreak(); });
  }

  private cancelFade() {
    if (this.fadeFrame !== null) cancelAnimationFrame(this.fadeFrame);
    this.fadeFrame = null;
  }

  private fade(target: number, duration: number, done?: () => void) {
    const audio = this.ensure();
    this.cancelFade();
    const from = audio.volume;
    const began = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - began) / duration);
      const eased = progress * progress * (3 - 2 * progress);
      audio.volume = from + (target - from) * eased;
      if (progress < 1) this.fadeFrame = requestAnimationFrame(tick);
      else { this.fadeFrame = null; done?.(); }
    };
    this.fadeFrame = requestAnimationFrame(tick);
  }

  /** The garden playback itself begins in the real Enter click in SceneStage. */
  startSoundscape() {
    if (this.running) return;
    const audio = this.ensure();
    this.running = true;
    audio.loop = true;
    audio.muted = false;
    if (this.context?.state === "suspended") void this.context.resume();
    this.fade(PROVENCE_GARDEN_BASE_VOLUME, 2000);
    this.ensureCeramic();
    this.resetCeramic();
    this.scheduleCeramic();
    this.ensureWoodCreak();
    this.resetWoodCreak();
    this.scheduleWoodCreak();
  }

  pauseSoundscape() {
    this.running = false;
    this.clearCeramicTimer();
    this.resetCeramic();
    this.clearWoodCreakTimer();
    this.resetWoodCreak();
    if (!this.player) return;
    this.fade(0, 700, () => this.player?.pause());
  }

  resumeSoundscape() {
    if (this.running) return;
    const audio = this.ensure();
    this.running = true;
    audio.loop = true;
    audio.muted = false;
    if (this.context?.state === "suspended") void this.context.resume();
    void audio.play().then(() => {
      this.fade(PROVENCE_GARDEN_BASE_VOLUME, 850);
      this.resetCeramic();
      this.scheduleCeramic();
      this.resetWoodCreak();
      this.scheduleWoodCreak();
    }).catch(() => {});
  }

  stopSoundscape(fadeMs = 2000) {
    this.running = false;
    this.clearCeramicTimer();
    this.resetCeramic();
    this.clearWoodCreakTimer();
    this.resetWoodCreak();
    if (!this.player) return;
    this.fade(0, fadeMs, () => {
      if (!this.player) return;
      this.player.pause();
      this.player.currentTime = 0;
      this.player.volume = 0;
    });
  }

  destroy() {
    this.running = false;
    this.clearCeramicTimer();
    this.clearWoodCreakTimer();
    this.cancelFade();
    this.resetCeramic();
    this.resetWoodCreak();
    if (this.player) {
      this.player.pause();
      this.player.currentTime = 0;
      this.player.volume = 0;
      this.player.remove();
    }
    this.source?.disconnect();
    this.highPass?.disconnect();
    this.lowShelf?.disconnect();
    this.ceramicSource?.disconnect();
    this.ceramicPanner?.disconnect();
    this.ceramicPlayer?.remove();
    this.woodCreakSource?.disconnect();
    this.woodCreakPanner?.disconnect();
    this.woodCreakPlayer?.remove();
    if (this.context) void this.context.close();
    this.player = null;
    this.source = null;
    this.highPass = null;
    this.lowShelf = null;
    this.ceramicPlayer = null;
    this.ceramicSource = null;
    this.ceramicPanner = null;
    this.woodCreakPlayer = null;
    this.woodCreakSource = null;
    this.woodCreakPanner = null;
    this.context = null;
  }
}

class TuscanyTownSoundscape {
  private players: [HTMLAudioElement, HTMLAudioElement] | null = null;
  private activeIndex = 0;
  private fountainPlayers: [HTMLAudioElement, HTMLAudioElement] | null = null;
  private fountainActiveIndex = 0;
  private fadeFrames = new Map<HTMLAudioElement, number>();
  private crossfadeFrame: number | null = null;
  private loopTimer: number | null = null;
  private fountainCrossfadeFrame: number | null = null;
  private fountainLoopTimer: number | null = null;
  private fountainContext: AudioContext | null = null;
  private fountainSources: [MediaElementAudioSourceNode, MediaElementAudioSourceNode] | null = null;
  private fountainPanners: [StereoPannerNode, StereoPannerNode] | null = null;
  private fountainGain: GainNode | null = null;
  private fountainDriftFrame: number | null = null;
  private fountainDriftStartedAt = 0;
  private fountainDriftDuration = 0;
  private fountainDriftFrom = 1;
  private fountainDriftTo = 1;
  private running = false;

  private createPlayer(source: string, primarySceneId?: string) {
    const audio = primarySceneId ? acquirePrimaryAudio(primarySceneId, source) : new Audio(source);
    audio.preload = "auto";
    audio.loop = false;
    audio.muted = false;
    audio.volume = 0;
    audio.setAttribute("aria-hidden", "true");
    audio.style.display = "none";
    if (!audio.isConnected) document.body.append(audio);
    if (audio.readyState === HTMLMediaElement.HAVE_NOTHING) audio.load();
    return audio;
  }

  private ensure() {
    if (!this.players) this.players = [this.createPlayer(TUSCANY_TOWN_AUDIO, "tuscany-summer-villa"), createDeferredStandbyAudio()];
    return this.players;
  }

  private ensureFountains() {
    if (!this.fountainPlayers) {
      this.fountainPlayers = [this.createPlayer(TUSCANY_FOUNTAIN_AUDIO), createDeferredStandbyAudio()];
    }
    this.ensureFountainPosition();
    return this.fountainPlayers;
  }

  private ensureFountainPosition() {
    if (this.fountainSources || !this.fountainPlayers || typeof window === "undefined" || !window.AudioContext) return;
    this.fountainContext = new window.AudioContext();
    const [first, second] = this.fountainPlayers;
    const firstSource = this.fountainContext.createMediaElementSource(first);
    const secondSource = this.fountainContext.createMediaElementSource(second);
    const firstPanner = this.fountainContext.createStereoPanner();
    const secondPanner = this.fountainContext.createStereoPanner();
    const fountainGain = this.fountainContext.createGain();
    // The fountain sits a little to the right of the listener, never hard-panned.
    firstPanner.pan.value = 0.16;
    secondPanner.pan.value = 0.16;
    fountainGain.gain.value = 1;
    firstSource.connect(firstPanner).connect(fountainGain);
    secondSource.connect(secondPanner).connect(fountainGain);
    fountainGain.connect(this.fountainContext.destination);
    this.fountainSources = [firstSource, secondSource];
    this.fountainPanners = [firstPanner, secondPanner];
    this.fountainGain = fountainGain;
  }

  getAmbientAudio() {
    return this.ensure()[this.activeIndex];
  }

  private clearLoopTimer() {
    if (this.loopTimer !== null) window.clearTimeout(this.loopTimer);
    this.loopTimer = null;
  }

  private clearFountainLoopTimer() {
    if (this.fountainLoopTimer !== null) window.clearTimeout(this.fountainLoopTimer);
    this.fountainLoopTimer = null;
  }

  private cancelFade(audio: HTMLAudioElement) {
    const frame = this.fadeFrames.get(audio);
    if (frame !== undefined) cancelAnimationFrame(frame);
    this.fadeFrames.delete(audio);
  }

  private cancelFades() {
    this.fadeFrames.forEach((frame) => cancelAnimationFrame(frame));
    this.fadeFrames.clear();
    if (this.crossfadeFrame !== null) cancelAnimationFrame(this.crossfadeFrame);
    this.crossfadeFrame = null;
    if (this.fountainCrossfadeFrame !== null) cancelAnimationFrame(this.fountainCrossfadeFrame);
    this.fountainCrossfadeFrame = null;
  }

  private stopFountainDrift(resetGain = false) {
    if (this.fountainDriftFrame !== null) cancelAnimationFrame(this.fountainDriftFrame);
    this.fountainDriftFrame = null;
    if (resetGain && this.fountainGain) this.fountainGain.gain.value = 1;
  }

  private startFountainDrift() {
    const gain = this.fountainGain;
    if (!gain || !this.running) return;

    this.stopFountainDrift();
    const variation = Math.pow(10, TUSCANY_FOUNTAIN_DRIFT_DECIBELS / 20);
    this.fountainDriftFrom = gain.gain.value;
    this.fountainDriftTo = randomBetween(1 / variation, variation);
    this.fountainDriftDuration = randomBetween(TUSCANY_FOUNTAIN_DRIFT_MINIMUM_MS, TUSCANY_FOUNTAIN_DRIFT_MAXIMUM_MS);
    this.fountainDriftStartedAt = performance.now();

    const tick = (now: number) => {
      if (!this.running || !this.fountainGain) return;
      const progress = Math.min(1, (now - this.fountainDriftStartedAt) / this.fountainDriftDuration);
      // A sine ease removes perceptible ramps while keeping the fountain naturally alive.
      const eased = 0.5 - Math.cos(Math.PI * progress) * 0.5;
      this.fountainGain.gain.value = this.fountainDriftFrom + (this.fountainDriftTo - this.fountainDriftFrom) * eased;
      if (progress < 1) this.fountainDriftFrame = requestAnimationFrame(tick);
      else {
        this.fountainDriftFrame = null;
        this.startFountainDrift();
      }
    };
    this.fountainDriftFrame = requestAnimationFrame(tick);
  }

  private fade(audio: HTMLAudioElement, target: number, duration: number, done?: () => void) {
    this.cancelFade(audio);
    const from = audio.volume;
    const began = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - began) / duration);
      const eased = progress * progress * (3 - 2 * progress);
      audio.volume = from + (target - from) * eased;
      if (progress < 1) this.fadeFrames.set(audio, requestAnimationFrame(tick));
      else { this.fadeFrames.delete(audio); done?.(); }
    };
    this.fadeFrames.set(audio, requestAnimationFrame(tick));
  }

  private scheduleCrossfade() {
    this.clearLoopTimer();
    if (!this.running) return;
    const active = this.getAmbientAudio();
    const duration = Number.isFinite(active.duration) && active.duration > TUSCANY_TOWN_CROSSFADE_SECONDS
      ? active.duration
      : TUSCANY_TOWN_DURATION_SECONDS;
    const delay = Math.max(0, (duration - active.currentTime - TUSCANY_TOWN_CROSSFADE_SECONDS) * 1000);
    this.loopTimer = window.setTimeout(() => {
      this.loopTimer = null;
      this.crossfadeToNext();
    }, delay);
  }

  private getActiveFountain() {
    return this.ensureFountains()[this.fountainActiveIndex];
  }

  private scheduleFountainCrossfade() {
    this.clearFountainLoopTimer();
    if (!this.running) return;
    const active = this.getActiveFountain();
    const duration = Number.isFinite(active.duration) && active.duration > TUSCANY_FOUNTAIN_CROSSFADE_SECONDS
      ? active.duration
      : TUSCANY_FOUNTAIN_DURATION_SECONDS;
    const delay = Math.max(0, (duration - active.currentTime - TUSCANY_FOUNTAIN_CROSSFADE_SECONDS) * 1000);
    this.fountainLoopTimer = window.setTimeout(() => {
      this.fountainLoopTimer = null;
      this.crossfadeFountainToNext();
    }, delay);
  }

  private crossfadeToNext() {
    if (!this.running) return;
    const [first, second] = this.ensure();
    const outgoing = this.activeIndex === 0 ? first : second;
    const incoming = this.activeIndex === 0 ? second : first;
    if (!outgoing.paused && !incoming.paused) return;

    prepareStandbyAudio(incoming, TUSCANY_TOWN_AUDIO);

    this.cancelFade(outgoing);
    this.cancelFade(incoming);
    if (this.crossfadeFrame !== null) cancelAnimationFrame(this.crossfadeFrame);
    this.crossfadeFrame = null;
    incoming.pause();
    incoming.currentTime = 0;
    incoming.volume = 0;
    incoming.loop = false;
    incoming.muted = false;
    void incoming.play().then(() => {
      if (!this.running) { incoming.pause(); return; }
      const began = performance.now();
      const durationMs = TUSCANY_TOWN_CROSSFADE_SECONDS * 1000;
      const tick = (now: number) => {
        const progress = Math.min(1, (now - began) / durationMs);
        // Equal-power curves retain a stable perceived loudness through the overlap.
        outgoing.volume = TUSCANY_TOWN_BASE_VOLUME * Math.cos(progress * Math.PI * 0.5);
        incoming.volume = TUSCANY_TOWN_BASE_VOLUME * Math.sin(progress * Math.PI * 0.5);
        if (progress < 1) this.crossfadeFrame = requestAnimationFrame(tick);
        else {
          this.crossfadeFrame = null;
          outgoing.pause();
          outgoing.currentTime = 0;
          outgoing.volume = 0;
          this.activeIndex = this.activeIndex === 0 ? 1 : 0;
          this.scheduleCrossfade();
        }
      };
      this.crossfadeFrame = requestAnimationFrame(tick);
    }).catch(() => {
      if (this.running) this.scheduleCrossfade();
    });
  }

  private crossfadeFountainToNext() {
    if (!this.running) return;
    const [first, second] = this.ensureFountains();
    const outgoing = this.fountainActiveIndex === 0 ? first : second;
    const incoming = this.fountainActiveIndex === 0 ? second : first;
    if (!outgoing.paused && !incoming.paused) return;

    prepareStandbyAudio(incoming, TUSCANY_FOUNTAIN_AUDIO);

    this.cancelFade(outgoing);
    this.cancelFade(incoming);
    if (this.fountainCrossfadeFrame !== null) cancelAnimationFrame(this.fountainCrossfadeFrame);
    this.fountainCrossfadeFrame = null;
    incoming.pause();
    incoming.currentTime = 0;
    incoming.volume = 0;
    incoming.loop = false;
    incoming.muted = false;
    void incoming.play().then(() => {
      if (!this.running) { incoming.pause(); return; }
      const began = performance.now();
      const durationMs = TUSCANY_FOUNTAIN_CROSSFADE_SECONDS * 1000;
      const tick = (now: number) => {
        const progress = Math.min(1, (now - began) / durationMs);
        outgoing.volume = TUSCANY_FOUNTAIN_BASE_VOLUME * Math.cos(progress * Math.PI * 0.5);
        incoming.volume = TUSCANY_FOUNTAIN_BASE_VOLUME * Math.sin(progress * Math.PI * 0.5);
        if (progress < 1) this.fountainCrossfadeFrame = requestAnimationFrame(tick);
        else {
          this.fountainCrossfadeFrame = null;
          outgoing.pause();
          outgoing.currentTime = 0;
          outgoing.volume = 0;
          this.fountainActiveIndex = this.fountainActiveIndex === 0 ? 1 : 0;
          this.scheduleFountainCrossfade();
        }
      };
      this.fountainCrossfadeFrame = requestAnimationFrame(tick);
    }).catch(() => {
      if (this.running) this.scheduleFountainCrossfade();
    });
  }

  private startFountain(fadeMs: number) {
    const active = this.getActiveFountain();
    active.loop = false;
    active.muted = false;
    if (this.fountainContext?.state === "suspended") void this.fountainContext.resume();
    void active.play().then(() => {
      if (!this.running) return;
      this.fade(active, TUSCANY_FOUNTAIN_BASE_VOLUME, fadeMs);
      this.startFountainDrift();
      this.scheduleFountainCrossfade();
    }).catch(() => {});
  }

  /** The first town player starts from the real Enter click in SceneStage. */
  startSoundscape() {
    if (this.running) return;
    const active = this.getAmbientAudio();
    this.running = true;
    active.loop = false;
    active.muted = false;
    this.fade(active, TUSCANY_TOWN_BASE_VOLUME, 2000);
    this.scheduleCrossfade();
    this.startFountain(2000);
  }

  pauseSoundscape() {
    this.running = false;
    this.clearLoopTimer();
    this.clearFountainLoopTimer();
    this.cancelFades();
    this.stopFountainDrift();
    this.ensure().forEach((audio) => this.fade(audio, 0, 700, () => audio.pause()));
    this.ensureFountains().forEach((audio) => this.fade(audio, 0, 700, () => audio.pause()));
  }

  resumeSoundscape() {
    if (this.running) return;
    const active = this.getAmbientAudio();
    this.running = true;
    active.loop = false;
    active.muted = false;
    void active.play().then(() => {
      this.fade(active, TUSCANY_TOWN_BASE_VOLUME, 850);
      this.scheduleCrossfade();
      this.startFountain(850);
    }).catch(() => { this.running = false; });
  }

  stopSoundscape(fadeMs = 2000) {
    this.running = false;
    this.clearLoopTimer();
    this.clearFountainLoopTimer();
    this.cancelFades();
    this.stopFountainDrift(true);
    this.ensure().forEach((audio) => this.fade(audio, 0, fadeMs, () => {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0;
    }));
    this.ensureFountains().forEach((audio) => this.fade(audio, 0, fadeMs, () => {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0;
    }));
    this.activeIndex = 0;
    this.fountainActiveIndex = 0;
  }

  destroy() {
    this.running = false;
    this.clearLoopTimer();
    this.clearFountainLoopTimer();
    this.cancelFades();
    this.stopFountainDrift(true);
    this.players?.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0;
      audio.remove();
    });
    this.fountainPlayers?.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0;
      audio.remove();
    });
    this.fountainSources?.forEach((source) => source.disconnect());
    this.fountainPanners?.forEach((panner) => panner.disconnect());
    this.fountainGain?.disconnect();
    if (this.fountainContext) void this.fountainContext.close();
    this.players = null;
    this.activeIndex = 0;
    this.fountainPlayers = null;
    this.fountainActiveIndex = 0;
    this.fountainSources = null;
    this.fountainPanners = null;
    this.fountainGain = null;
    this.fountainContext = null;
  }
}

class FinlandFireplaceSoundscape {
  private fireplacePlayer: HTMLAudioElement | null = null;
  private windPlayer: HTMLAudioElement | null = null;
  private fadeFrames = new Map<HTMLAudioElement, number>();
  private windContext: AudioContext | null = null;
  private windSource: MediaElementAudioSourceNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private running = false;

  private createPlayer(source: string, primarySceneId?: string) {
    const audio = primarySceneId ? acquirePrimaryAudio(primarySceneId, source) : new Audio(source);
    audio.preload = "auto";
    audio.loop = true;
    audio.muted = false;
    audio.volume = 0;
    audio.setAttribute("aria-hidden", "true");
    audio.style.display = "none";
    if (!audio.isConnected) document.body.append(audio);
    if (audio.readyState === HTMLMediaElement.HAVE_NOTHING) audio.load();
    return audio;
  }

  private ensureFireplace() {
    if (!this.fireplacePlayer) {
      this.fireplacePlayer = this.createPlayer(FINLAND_FIREPLACE_AUDIO, "finland-glass-cabin");
    }
    return this.fireplacePlayer;
  }

  private ensureWind() {
    if (!this.windPlayer) {
      this.windPlayer = this.createPlayer(FINLAND_WIND_AUDIO);
    }
    this.ensureWindFilter();
    return this.windPlayer;
  }

  private ensureWindFilter() {
    if (this.windSource || !this.windPlayer || typeof window === "undefined") return;
    if (!window.AudioContext) return;

    this.windContext = new window.AudioContext();
    this.windSource = this.windContext.createMediaElementSource(this.windPlayer);
    this.windFilter = this.windContext.createBiquadFilter();
    this.windFilter.type = "lowpass";
    this.windFilter.frequency.value = 1800;
    this.windFilter.Q.value = 0.55;
    this.windSource.connect(this.windFilter).connect(this.windContext.destination);
  }

  getAmbientAudio() {
    return this.ensureFireplace();
  }

  private cancelFade(audio: HTMLAudioElement) {
    const frame = this.fadeFrames.get(audio);
    if (frame !== undefined) cancelAnimationFrame(frame);
    this.fadeFrames.delete(audio);
  }

  private cancelFades() {
    this.fadeFrames.forEach((frame) => cancelAnimationFrame(frame));
    this.fadeFrames.clear();
  }

  private fade(audio: HTMLAudioElement, target: number, duration: number, done?: () => void) {
    this.cancelFade(audio);
    const from = audio.volume;
    const began = performance.now();
    const tick = (now: number) => {
      this.fadeFrames.delete(audio);
      const progress = Math.min(1, (now - began) / duration);
      const eased = progress * progress * (3 - 2 * progress);
      audio.volume = from + (target - from) * eased;
      if (progress < 1) this.fadeFrames.set(audio, requestAnimationFrame(tick));
      else done?.();
    };
    this.fadeFrames.set(audio, requestAnimationFrame(tick));
  }

  private startWind(fadeMs: number) {
    const wind = this.ensureWind();
    wind.loop = true;
    wind.muted = false;
    wind.volume = 0;
    if (this.windContext?.state === "suspended") void this.windContext.resume();
    void wind.play().then(() => {
      if (this.running) this.fade(wind, FINLAND_WIND_BASE_VOLUME, fadeMs);
    }).catch(() => {
      // The fireplace remains available if a browser rejects this quiet secondary layer.
    });
  }

  /** The primary fireplace playback itself is initiated by the actual Enter click in SceneStage. */
  startSoundscape() {
    if (this.running) return;
    const fireplace = this.ensureFireplace();
    this.running = true;
    fireplace.loop = true;
    fireplace.muted = false;
    this.fade(fireplace, FINLAND_FIREPLACE_BASE_VOLUME, 2000);
    this.startWind(2000);
  }

  pauseSoundscape() {
    this.running = false;
    [this.fireplacePlayer, this.windPlayer].forEach((audio) => {
      if (audio) this.fade(audio, 0, 700, () => audio.pause());
    });
  }

  resumeSoundscape() {
    if (this.running) return;
    const fireplace = this.ensureFireplace();
    const wind = this.ensureWind();
    this.running = true;
    fireplace.loop = true;
    wind.loop = true;
    fireplace.muted = false;
    wind.muted = false;
    if (this.windContext?.state === "suspended") void this.windContext.resume();
    void fireplace.play().then(() => this.fade(fireplace, FINLAND_FIREPLACE_BASE_VOLUME, 850)).catch(() => {});
    void wind.play().then(() => this.fade(wind, FINLAND_WIND_BASE_VOLUME, 850)).catch(() => {});
  }

  stopSoundscape(fadeMs = 2000) {
    this.running = false;
    [this.fireplacePlayer, this.windPlayer].forEach((audio) => {
      if (!audio) return;
      this.fade(audio, 0, fadeMs, () => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0;
      });
    });
  }

  destroy() {
    this.running = false;
    this.cancelFades();
    [this.fireplacePlayer, this.windPlayer].forEach((audio) => {
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0;
      audio.remove();
    });
    this.windSource?.disconnect();
    this.windFilter?.disconnect();
    void this.windContext?.close();
    this.fireplacePlayer = null;
    this.windPlayer = null;
    this.windSource = null;
    this.windFilter = null;
    this.windContext = null;
  }
}

class SeoulCitySoundscape {
  private players: [HTMLAudioElement, HTMLAudioElement] | null = null;
  private activeIndex = 0;
  private fadeFrames = new Map<HTMLAudioElement, number>();
  private crossfadeFrame: number | null = null;
  private loopTimer: number | null = null;
  private context: AudioContext | null = null;
  private sources: [MediaElementAudioSourceNode, MediaElementAudioSourceNode] | null = null;
  private birdFilters: [BiquadFilterNode, BiquadFilterNode] | null = null;
  private windChimePlayer: HTMLAudioElement | null = null;
  private windChimeTimer: number | null = null;
  private windChimeSource: MediaElementAudioSourceNode | null = null;
  private windChimePanner: StereoPannerNode | null = null;
  private windChimeHasPlayed = false;
  private running = false;

  private createPlayer(primary = false) {
    const audio = primary
      ? acquirePrimaryAudio("seoul-rooftop-sunset", SEOUL_CITY_AMBIENCE_AUDIO)
      : createDeferredStandbyAudio();
    audio.preload = primary ? "auto" : "none";
    audio.loop = false;
    audio.muted = false;
    audio.volume = 0;
    audio.setAttribute("aria-hidden", "true");
    audio.style.display = "none";
    if (!audio.isConnected) document.body.append(audio);
    if (primary && audio.readyState === HTMLMediaElement.HAVE_NOTHING) audio.load();
    return audio;
  }

  private ensure() {
    if (!this.players) this.players = [this.createPlayer(true), this.createPlayer()];
    this.ensureBirdReduction();
    return this.players;
  }

  private ensureBirdReduction() {
    if (this.sources || !this.players || typeof window === "undefined" || !window.AudioContext) return;
    this.context = new window.AudioContext();
    const [first, second] = this.players;
    const firstSource = this.context.createMediaElementSource(first);
    const secondSource = this.context.createMediaElementSource(second);
    const firstBirdFilter = this.context.createBiquadFilter();
    const secondBirdFilter = this.context.createBiquadFilter();

    [firstBirdFilter, secondBirdFilter].forEach((filter) => {
      // A focused presence-band dip softens prominent bird calls while leaving
      // the city's low hum, traffic bed, and stereo character intact.
      filter.type = "peaking";
      filter.frequency.value = SEOUL_BIRD_FILTER_FREQUENCY;
      filter.Q.value = SEOUL_BIRD_FILTER_Q;
      filter.gain.value = SEOUL_BIRD_FILTER_GAIN_DB;
    });
    firstSource.connect(firstBirdFilter).connect(this.context.destination);
    secondSource.connect(secondBirdFilter).connect(this.context.destination);
    this.sources = [firstSource, secondSource];
    this.birdFilters = [firstBirdFilter, secondBirdFilter];
  }

  private ensureWindChime() {
    if (!this.windChimePlayer) {
      const audio = new Audio(SEOUL_WIND_CHIME_AUDIO);
      audio.preload = "auto";
      audio.loop = false;
      audio.muted = false;
      audio.volume = 0;
      audio.setAttribute("aria-hidden", "true");
      audio.style.display = "none";
      audio.onended = () => { if (this.running) this.scheduleWindChime(); };
      document.body.append(audio);
      audio.load();
      this.windChimePlayer = audio;
    }
    this.ensureWindChimePosition();
    return this.windChimePlayer;
  }

  private ensureWindChimePosition() {
    if (this.windChimeSource || !this.windChimePlayer) return;
    this.ensure();
    if (!this.context) return;
    const source = this.context.createMediaElementSource(this.windChimePlayer);
    const panner = this.context.createStereoPanner();
    source.connect(panner).connect(this.context.destination);
    this.windChimeSource = source;
    this.windChimePanner = panner;
  }

  getAmbientAudio() {
    return this.ensure()[this.activeIndex];
  }

  private clearLoopTimer() {
    if (this.loopTimer !== null) window.clearTimeout(this.loopTimer);
    this.loopTimer = null;
  }

  private clearWindChimeTimer() {
    if (this.windChimeTimer !== null) window.clearTimeout(this.windChimeTimer);
    this.windChimeTimer = null;
  }

  private scheduleWindChime() {
    this.clearWindChimeTimer();
    if (!this.running) return;
    const interval = this.windChimeHasPlayed ? SEOUL_WIND_CHIME_REPEAT_INTERVAL : SEOUL_WIND_CHIME_FIRST_INTERVAL;
    const delay = randomBetween(interval.minimum, interval.maximum);
    this.windChimeTimer = window.setTimeout(() => {
      this.windChimeTimer = null;
      this.playWindChime();
    }, delay);
  }

  private playWindChime() {
    if (!this.running) return;
    const chime = this.ensureWindChime();
    if (!chime.paused) return;
    if (this.context?.state === "suspended") void this.context.resume();
    if (this.windChimePanner) this.windChimePanner.pan.value = randomBetween(-0.12, 0.12);
    chime.currentTime = 0;
    chime.volume = randomBetween(SEOUL_WIND_CHIME_VOLUME.minimum, SEOUL_WIND_CHIME_VOLUME.maximum);
    void chime.play().then(() => {
      this.windChimeHasPlayed = true;
    }).catch(() => {
      if (this.running) this.scheduleWindChime();
    });
  }

  private resetWindChime() {
    if (!this.windChimePlayer) return;
    this.windChimePlayer.pause();
    this.windChimePlayer.currentTime = 0;
    this.windChimePlayer.volume = 0;
  }

  private cancelFade(audio: HTMLAudioElement) {
    const frame = this.fadeFrames.get(audio);
    if (frame !== undefined) cancelAnimationFrame(frame);
    this.fadeFrames.delete(audio);
  }

  private cancelFades() {
    this.fadeFrames.forEach((frame) => cancelAnimationFrame(frame));
    this.fadeFrames.clear();
    if (this.crossfadeFrame !== null) cancelAnimationFrame(this.crossfadeFrame);
    this.crossfadeFrame = null;
  }

  private fade(audio: HTMLAudioElement, target: number, duration: number, done?: () => void) {
    this.cancelFade(audio);
    const from = audio.volume;
    const began = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - began) / duration);
      const eased = progress * progress * (3 - 2 * progress);
      audio.volume = from + (target - from) * eased;
      if (progress < 1) this.fadeFrames.set(audio, requestAnimationFrame(tick));
      else { this.fadeFrames.delete(audio); done?.(); }
    };
    this.fadeFrames.set(audio, requestAnimationFrame(tick));
  }

  private scheduleCrossfade() {
    this.clearLoopTimer();
    if (!this.running) return;
    const active = this.getAmbientAudio();
    const duration = Number.isFinite(active.duration) && active.duration > SEOUL_CITY_CROSSFADE_SECONDS
      ? active.duration
      : SEOUL_CITY_AMBIENCE_DURATION_SECONDS;
    const delay = Math.max(0, (duration - active.currentTime - SEOUL_CITY_CROSSFADE_SECONDS) * 1000);
    this.loopTimer = window.setTimeout(() => {
      this.loopTimer = null;
      this.crossfadeToNext();
    }, delay);
  }

  private crossfadeToNext() {
    if (!this.running) return;
    const [first, second] = this.ensure();
    const outgoing = this.activeIndex === 0 ? first : second;
    const incoming = this.activeIndex === 0 ? second : first;
    if (!outgoing.paused && !incoming.paused) return;

    prepareStandbyAudio(incoming, SEOUL_CITY_AMBIENCE_AUDIO);

    this.cancelFade(outgoing);
    this.cancelFade(incoming);
    if (this.crossfadeFrame !== null) cancelAnimationFrame(this.crossfadeFrame);
    this.crossfadeFrame = null;
    incoming.pause();
    incoming.currentTime = 0;
    incoming.volume = 0;
    incoming.loop = false;
    incoming.muted = false;
    void incoming.play().then(() => {
      if (!this.running) { incoming.pause(); return; }
      const began = performance.now();
      const durationMs = SEOUL_CITY_CROSSFADE_SECONDS * 1000;
      const tick = (now: number) => {
        const progress = Math.min(1, (now - began) / durationMs);
        outgoing.volume = SEOUL_CITY_AMBIENCE_BASE_VOLUME * Math.cos(progress * Math.PI * 0.5);
        incoming.volume = SEOUL_CITY_AMBIENCE_BASE_VOLUME * Math.sin(progress * Math.PI * 0.5);
        if (progress < 1) this.crossfadeFrame = requestAnimationFrame(tick);
        else {
          this.crossfadeFrame = null;
          outgoing.pause();
          outgoing.currentTime = 0;
          outgoing.volume = 0;
          this.activeIndex = this.activeIndex === 0 ? 1 : 0;
          this.scheduleCrossfade();
        }
      };
      this.crossfadeFrame = requestAnimationFrame(tick);
    }).catch(() => {
      if (this.running) this.scheduleCrossfade();
    });
  }

  /** The first city playback begins in the real Enter click in SceneStage. */
  startSoundscape() {
    if (this.running) return;
    const active = this.getAmbientAudio();
    this.running = true;
    active.loop = false;
    active.muted = false;
    if (this.context?.state === "suspended") void this.context.resume();
    this.fade(active, SEOUL_CITY_AMBIENCE_BASE_VOLUME, 2000);
    this.scheduleCrossfade();
    this.windChimeHasPlayed = false;
    this.scheduleWindChime();
  }

  pauseSoundscape() {
    this.running = false;
    this.clearLoopTimer();
    this.clearWindChimeTimer();
    this.cancelFades();
    this.players?.forEach((audio) => this.fade(audio, 0, 700, () => audio.pause()));
    if (this.windChimePlayer) this.fade(this.windChimePlayer, 0, 700, () => this.resetWindChime());
  }

  resumeSoundscape() {
    if (this.running) return;
    const active = this.getAmbientAudio();
    this.running = true;
    active.loop = false;
    active.muted = false;
    if (this.context?.state === "suspended") void this.context.resume();
    void active.play().then(() => {
      this.fade(active, SEOUL_CITY_AMBIENCE_BASE_VOLUME, 850);
      this.scheduleCrossfade();
      this.scheduleWindChime();
    }).catch(() => { this.running = false; });
  }

  stopSoundscape(fadeMs = 2000) {
    this.running = false;
    this.clearLoopTimer();
    this.clearWindChimeTimer();
    this.cancelFades();
    this.players?.forEach((audio) => this.fade(audio, 0, fadeMs, () => {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0;
    }));
    if (this.windChimePlayer) this.fade(this.windChimePlayer, 0, fadeMs, () => this.resetWindChime());
    this.activeIndex = 0;
    this.windChimeHasPlayed = false;
  }

  destroy() {
    this.running = false;
    this.clearLoopTimer();
    this.clearWindChimeTimer();
    this.cancelFades();
    this.players?.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0;
      audio.remove();
    });
    this.sources?.forEach((source) => source.disconnect());
    this.birdFilters?.forEach((filter) => filter.disconnect());
    this.resetWindChime();
    this.windChimePlayer?.remove();
    this.windChimeSource?.disconnect();
    this.windChimePanner?.disconnect();
    if (this.context) void this.context.close();
    this.players = null;
    this.activeIndex = 0;
    this.sources = null;
    this.birdFilters = null;
    this.windChimePlayer = null;
    this.windChimeSource = null;
    this.windChimePanner = null;
    this.windChimeHasPlayed = false;
    this.context = null;
  }
}

class NorwegianFjordSoundscape {
  private player: HTMLAudioElement | null = null;
  private fadeFrame: number | null = null;
  private context: AudioContext | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private hornPlayer: HTMLAudioElement | null = null;
  private hornSource: MediaElementAudioSourceNode | null = null;
  private hornFilter: BiquadFilterNode | null = null;
  private hornPrepareTimer: ReturnType<typeof setTimeout> | null = null;
  private hornPlaybackTimer: ReturnType<typeof setTimeout> | null = null;
  private hornFadeFrame: number | null = null;
  private hornPlaying = false;
  private running = false;

  private ensure() {
    if (!this.player) {
      const audio = acquirePrimaryAudio("norwegian-fjord-house", NORWEGIAN_CABIN_SOUNDSCAPE_AUDIO);
      audio.preload = "auto";
      audio.loop = true;
      audio.muted = false;
      audio.volume = 0;
      audio.setAttribute("aria-hidden", "true");
      audio.style.display = "none";
      if (!audio.isConnected) document.body.append(audio);
      if (audio.readyState === HTMLMediaElement.HAVE_NOTHING) audio.load();
      this.player = audio;
    }
    this.ensureFilter();
    return this.player;
  }

  private ensureFilter() {
    if (this.source || !this.player || typeof window === "undefined" || !window.AudioContext) return;
    this.context = new window.AudioContext();
    this.source = this.context.createMediaElementSource(this.player);
    this.filter = this.context.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = NORWEGIAN_CABIN_FILTER_FREQUENCY;
    this.filter.Q.value = NORWEGIAN_CABIN_FILTER_Q;
    this.source.connect(this.filter).connect(this.context.destination);
  }

  private ensureHorn() {
    if (!this.hornPlayer) {
      const audio = createDeferredStandbyAudio();
      audio.onended = () => {
        this.hornPlaying = false;
        audio.volume = 0;
        audio.currentTime = 0;
        if (this.running) {
          this.scheduleHorn(randomBetween(
            NORWEGIAN_FERRY_HORN_REPEAT_INTERVAL.minimum,
            NORWEGIAN_FERRY_HORN_REPEAT_INTERVAL.maximum,
          ));
        }
      };
      this.hornPlayer = audio;
    }

    if (!this.hornSource && this.context) {
      this.hornSource = this.context.createMediaElementSource(this.hornPlayer);
      this.hornFilter = this.context.createBiquadFilter();
      this.hornFilter.type = "lowpass";
      this.hornFilter.frequency.value = NORWEGIAN_FERRY_HORN_FILTER_FREQUENCY;
      this.hornFilter.Q.value = NORWEGIAN_FERRY_HORN_FILTER_Q;
      this.hornSource.connect(this.hornFilter).connect(this.context.destination);
    }

    return this.hornPlayer;
  }

  private clearHornTimers() {
    if (this.hornPrepareTimer !== null) clearTimeout(this.hornPrepareTimer);
    if (this.hornPlaybackTimer !== null) clearTimeout(this.hornPlaybackTimer);
    this.hornPrepareTimer = null;
    this.hornPlaybackTimer = null;
  }

  private cancelHornFade() {
    if (this.hornFadeFrame !== null) cancelAnimationFrame(this.hornFadeFrame);
    this.hornFadeFrame = null;
  }

  private fadeHorn(target: number, duration: number, done?: () => void) {
    if (!this.hornPlayer) { done?.(); return; }
    this.cancelHornFade();
    const audio = this.hornPlayer;
    const from = audio.volume;
    const began = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - began) / duration);
      const eased = progress * progress * (3 - 2 * progress);
      audio.volume = from + (target - from) * eased;
      if (progress < 1) this.hornFadeFrame = requestAnimationFrame(tick);
      else { this.hornFadeFrame = null; done?.(); }
    };
    this.hornFadeFrame = requestAnimationFrame(tick);
  }

  private releaseHorn() {
    this.cancelHornFade();
    this.hornPlaying = false;
    this.hornSource?.disconnect();
    this.hornFilter?.disconnect();
    this.hornSource = null;
    this.hornFilter = null;
    if (this.hornPlayer) {
      this.hornPlayer.onended = null;
      releaseAudioElement(this.hornPlayer);
      this.hornPlayer = null;
    }
  }

  private stopHorn(release: boolean, fadeMs = 900) {
    this.clearHornTimers();
    if (!this.hornPlayer) return;
    const finish = () => {
      if (!this.hornPlayer) return;
      this.hornPlayer.pause();
      this.hornPlayer.currentTime = 0;
      this.hornPlayer.volume = 0;
      this.hornPlaying = false;
      if (release) this.releaseHorn();
    };
    if (this.hornPlaying && !this.hornPlayer.paused && this.hornPlayer.volume > 0) {
      this.fadeHorn(0, fadeMs, finish);
    } else {
      finish();
    }
  }

  private playHorn() {
    this.hornPlaybackTimer = null;
    if (!this.running || this.hornPlaying) return;
    const horn = this.ensureHorn();
    if (!horn.getAttribute("src")) prepareStandbyAudio(horn, NORWEGIAN_FERRY_HORN_AUDIO);
    horn.loop = false;
    horn.muted = false;
    horn.currentTime = 0;
    horn.volume = NORWEGIAN_FERRY_HORN_VOLUME;
    this.hornPlaying = true;
    if (this.context?.state === "suspended") void this.context.resume();
    void horn.play().catch(() => {
      this.hornPlaying = false;
      horn.volume = 0;
      if (this.running) {
        this.scheduleHorn(randomBetween(
          NORWEGIAN_FERRY_HORN_REPEAT_INTERVAL.minimum,
          NORWEGIAN_FERRY_HORN_REPEAT_INTERVAL.maximum,
        ));
      }
    });
  }

  private scheduleHorn(audibleDelayMs: number) {
    this.clearHornTimers();
    if (!this.running) return;
    const horn = this.ensureHorn();
    const playbackDelayMs = Math.max(0, audibleDelayMs - NORWEGIAN_FERRY_HORN_AUDIBLE_OFFSET_MS);
    const prepareDelayMs = Math.max(0, playbackDelayMs - NORWEGIAN_FERRY_HORN_PREPARE_LEAD_MS);

    this.hornPrepareTimer = setTimeout(() => {
      this.hornPrepareTimer = null;
      if (this.running && !horn.getAttribute("src")) prepareStandbyAudio(horn, NORWEGIAN_FERRY_HORN_AUDIO);
    }, prepareDelayMs);
    this.hornPlaybackTimer = setTimeout(() => this.playHorn(), playbackDelayMs);
  }

  getAmbientAudio() {
    // Re-entry intent may have prepared a fresh primary element while this
    // soundscape still owns its paused base player. Discard only that unused
    // duplicate and continue with the existing player.
    if (this.player) releasePreparedPrimaryAmbientAudio("norwegian-fjord-house");
    return this.ensure();
  }

  private cancelFade() {
    if (this.fadeFrame !== null) cancelAnimationFrame(this.fadeFrame);
    this.fadeFrame = null;
  }

  private fade(target: number, duration: number, done?: () => void) {
    const audio = this.ensure();
    this.cancelFade();
    const from = audio.volume;
    const began = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - began) / duration);
      const eased = progress * progress * (3 - 2 * progress);
      audio.volume = from + (target - from) * eased;
      if (progress < 1) this.fadeFrame = requestAnimationFrame(tick);
      else { this.fadeFrame = null; done?.(); }
    };
    this.fadeFrame = requestAnimationFrame(tick);
  }

  /** The initial playback request is made directly by the Enter click in SceneStage. */
  startSoundscape() {
    if (this.running) return;
    const audio = this.ensure();
    this.ensureHorn();
    this.running = true;
    audio.loop = true;
    audio.muted = false;
    if (this.context?.state === "suspended") void this.context.resume();
    this.fade(NORWEGIAN_CABIN_SOUNDSCAPE_BASE_VOLUME, 2000);
    this.scheduleHorn(randomBetween(
      NORWEGIAN_FERRY_HORN_FIRST_INTERVAL.minimum,
      NORWEGIAN_FERRY_HORN_FIRST_INTERVAL.maximum,
    ));
  }

  pauseSoundscape() {
    this.running = false;
    this.stopHorn(false, 700);
    if (!this.player) return;
    this.fade(0, 700, () => this.player?.pause());
  }

  resumeSoundscape() {
    if (this.running) return;
    const audio = this.ensure();
    this.running = true;
    audio.loop = true;
    audio.muted = false;
    if (this.context?.state === "suspended") void this.context.resume();
    void audio.play().then(() => this.fade(NORWEGIAN_CABIN_SOUNDSCAPE_BASE_VOLUME, 850)).catch(() => {});
    this.scheduleHorn(randomBetween(
      NORWEGIAN_FERRY_HORN_FIRST_INTERVAL.minimum,
      NORWEGIAN_FERRY_HORN_FIRST_INTERVAL.maximum,
    ));
  }

  stopSoundscape(fadeMs = 2000) {
    this.running = false;
    this.stopHorn(true, Math.min(fadeMs, 900));
    if (!this.player) return;
    this.fade(0, fadeMs, () => {
      if (!this.player) return;
      this.player.pause();
      this.player.currentTime = 0;
      this.player.volume = 0;
    });
  }

  destroy() {
    this.running = false;
    this.cancelFade();
    this.clearHornTimers();
    this.releaseHorn();
    if (this.player) {
      this.player.pause();
      this.player.currentTime = 0;
      this.player.volume = 0;
      this.player.remove();
    }
    this.source?.disconnect();
    this.filter?.disconnect();
    if (this.context) void this.context.close();
    this.player = null;
    this.context = null;
    this.source = null;
    this.filter = null;
  }
}

type CrossfadeAmbientProcessing = {
  highPassFrequency?: number;
  highPassQ?: number;
  lowShelfFrequency?: number;
  lowShelfGainDb?: number;
  presenceDipFrequency?: number;
  presenceDipQ?: number;
  presenceDipGainDb?: number;
  stereoPan?: number;
};

type CrossfadeAmbientEvent = {
  source: string;
  volume: number;
  firstInterval: { minimum: number; maximum: number };
  repeatInterval: { minimum: number; maximum: number };
  prepareLeadMs: number;
  audibleOffsetMs?: number;
  exitFadeMs?: number;
};

class CrossfadeAmbientSoundscape {
  private players: [HTMLAudioElement, HTMLAudioElement] | null = null;
  private activeIndex = 0;
  private fadeFrames = new Map<HTMLAudioElement, number>();
  private crossfadeFrame: number | null = null;
  private loopTimer: number | null = null;
  private context: AudioContext | null = null;
  private processingNodes: AudioNode[] = [];
  private processingSources: MediaElementAudioSourceNode[] = [];
  private eventPlayer: HTMLAudioElement | null = null;
  private eventPrepareTimer: ReturnType<typeof setTimeout> | null = null;
  private eventPlaybackTimer: ReturnType<typeof setTimeout> | null = null;
  private eventFadeFrame: number | null = null;
  private eventPlaying = false;
  private running = false;

  constructor(
    private readonly sceneId: string,
    private readonly source: string,
    private readonly baseVolume: number,
    private readonly durationSeconds: number,
    private readonly crossfadeSeconds: number,
    private readonly fadeInMs = 2000,
    private readonly processing?: CrossfadeAmbientProcessing,
    private readonly occasionalEvent?: CrossfadeAmbientEvent,
  ) {}

  private createPlayer(primary = false) {
    const audio = primary ? acquirePrimaryAudio(this.sceneId, this.source) : createDeferredStandbyAudio();
    audio.preload = primary ? "auto" : "none";
    audio.loop = false;
    audio.muted = false;
    audio.volume = 0;
    audio.setAttribute("aria-hidden", "true");
    audio.style.display = "none";
    if (!audio.isConnected) document.body.append(audio);
    if (primary && audio.readyState === HTMLMediaElement.HAVE_NOTHING) audio.load();
    return audio;
  }

  private ensure() {
    if (!this.players) this.players = [this.createPlayer(true), this.createPlayer()];
    return this.players;
  }

  private ensureProcessing() {
    if (!this.processing || this.processingSources.length > 0 || typeof window === "undefined" || !window.AudioContext) return;
    const processing = this.processing;
    const context = new window.AudioContext();
    const players = this.ensure();

    players.forEach((audio) => {
      const source = context.createMediaElementSource(audio);
      let output: AudioNode = source;
      this.processingSources.push(source);

      if (processing.highPassFrequency !== undefined) {
        const highPass = context.createBiquadFilter();
        highPass.type = "highpass";
        highPass.frequency.value = processing.highPassFrequency;
        highPass.Q.value = processing.highPassQ ?? 0.7;
        output.connect(highPass);
        output = highPass;
        this.processingNodes.push(highPass);
      }

      if (processing.lowShelfFrequency !== undefined && processing.lowShelfGainDb !== undefined) {
        const lowShelf = context.createBiquadFilter();
        lowShelf.type = "lowshelf";
        lowShelf.frequency.value = processing.lowShelfFrequency;
        lowShelf.gain.value = processing.lowShelfGainDb;
        output.connect(lowShelf);
        output = lowShelf;
        this.processingNodes.push(lowShelf);
      }

      if (processing.presenceDipFrequency !== undefined && processing.presenceDipGainDb !== undefined) {
        const presenceDip = context.createBiquadFilter();
        presenceDip.type = "peaking";
        presenceDip.frequency.value = processing.presenceDipFrequency;
        presenceDip.Q.value = processing.presenceDipQ ?? 0.7;
        presenceDip.gain.value = processing.presenceDipGainDb;
        output.connect(presenceDip);
        output = presenceDip;
        this.processingNodes.push(presenceDip);
      }

      if (processing.stereoPan !== undefined && typeof context.createStereoPanner === "function") {
        const panner = context.createStereoPanner();
        panner.pan.value = processing.stereoPan;
        output.connect(panner);
        output = panner;
        this.processingNodes.push(panner);
      }

      output.connect(context.destination);
    });

    this.context = context;
  }

  getAmbientAudio() {
    const players = this.ensure();
    this.ensureProcessing();
    return players[this.activeIndex];
  }

  private clearLoopTimer() {
    if (this.loopTimer !== null) window.clearTimeout(this.loopTimer);
    this.loopTimer = null;
  }

  private ensureEvent() {
    if (!this.occasionalEvent) return null;
    if (!this.eventPlayer) {
      const audio = createDeferredStandbyAudio();
      audio.onended = () => {
        this.eventPlaying = false;
        audio.volume = 0;
        audio.currentTime = 0;
        if (this.running && this.occasionalEvent) {
          this.scheduleEvent(randomBetween(
            this.occasionalEvent.repeatInterval.minimum,
            this.occasionalEvent.repeatInterval.maximum,
          ));
        }
      };
      this.eventPlayer = audio;
    }
    return this.eventPlayer;
  }

  private clearEventTimers() {
    if (this.eventPrepareTimer !== null) clearTimeout(this.eventPrepareTimer);
    if (this.eventPlaybackTimer !== null) clearTimeout(this.eventPlaybackTimer);
    this.eventPrepareTimer = null;
    this.eventPlaybackTimer = null;
  }

  private cancelEventFade() {
    if (this.eventFadeFrame !== null) cancelAnimationFrame(this.eventFadeFrame);
    this.eventFadeFrame = null;
  }

  private fadeEvent(target: number, duration: number, done?: () => void) {
    if (!this.eventPlayer) { done?.(); return; }
    this.cancelEventFade();
    const audio = this.eventPlayer;
    const from = audio.volume;
    const began = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - began) / duration);
      const eased = progress * progress * (3 - 2 * progress);
      audio.volume = from + (target - from) * eased;
      if (progress < 1) this.eventFadeFrame = requestAnimationFrame(tick);
      else { this.eventFadeFrame = null; done?.(); }
    };
    this.eventFadeFrame = requestAnimationFrame(tick);
  }

  private releaseEvent() {
    this.cancelEventFade();
    this.eventPlaying = false;
    if (this.eventPlayer) {
      this.eventPlayer.onended = null;
      releaseAudioElement(this.eventPlayer);
      this.eventPlayer = null;
    }
  }

  private stopEvent(release: boolean, fadeMs = 700) {
    this.clearEventTimers();
    if (!this.eventPlayer) return;
    const finish = () => {
      if (!this.eventPlayer) return;
      this.eventPlayer.pause();
      this.eventPlayer.currentTime = 0;
      this.eventPlayer.volume = 0;
      this.eventPlaying = false;
      if (release) this.releaseEvent();
    };
    if (this.eventPlaying && !this.eventPlayer.paused && this.eventPlayer.volume > 0) {
      this.fadeEvent(0, fadeMs, finish);
    } else {
      finish();
    }
  }

  private playEvent() {
    this.eventPlaybackTimer = null;
    if (!this.running || this.eventPlaying || !this.occasionalEvent) return;
    const audio = this.ensureEvent();
    if (!audio) return;
    if (!audio.getAttribute("src")) prepareStandbyAudio(audio, this.occasionalEvent.source);
    audio.loop = false;
    audio.muted = false;
    audio.currentTime = 0;
    audio.volume = this.occasionalEvent.volume;
    this.eventPlaying = true;
    void audio.play().catch(() => {
      this.eventPlaying = false;
      audio.volume = 0;
      if (this.running && this.occasionalEvent) {
        this.scheduleEvent(randomBetween(
          this.occasionalEvent.repeatInterval.minimum,
          this.occasionalEvent.repeatInterval.maximum,
        ));
      }
    });
  }

  private scheduleEvent(audibleDelayMs: number) {
    this.clearEventTimers();
    if (!this.running || !this.occasionalEvent) return;
    const event = this.ensureEvent();
    if (!event) return;
    const playbackDelayMs = Math.max(0, audibleDelayMs - (this.occasionalEvent.audibleOffsetMs ?? 0));
    const prepareDelayMs = Math.max(0, playbackDelayMs - this.occasionalEvent.prepareLeadMs);

    this.eventPrepareTimer = setTimeout(() => {
      this.eventPrepareTimer = null;
      if (this.running && !event.getAttribute("src") && this.occasionalEvent) {
        prepareStandbyAudio(event, this.occasionalEvent.source);
      }
    }, prepareDelayMs);
    this.eventPlaybackTimer = setTimeout(() => this.playEvent(), playbackDelayMs);
  }

  private cancelFade(audio: HTMLAudioElement) {
    const frame = this.fadeFrames.get(audio);
    if (frame !== undefined) cancelAnimationFrame(frame);
    this.fadeFrames.delete(audio);
  }

  private cancelFades() {
    this.fadeFrames.forEach((frame) => cancelAnimationFrame(frame));
    this.fadeFrames.clear();
    if (this.crossfadeFrame !== null) cancelAnimationFrame(this.crossfadeFrame);
    this.crossfadeFrame = null;
  }

  private fade(audio: HTMLAudioElement, target: number, duration: number, done?: () => void) {
    this.cancelFade(audio);
    const from = audio.volume;
    const began = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - began) / duration);
      const eased = progress * progress * (3 - 2 * progress);
      audio.volume = from + (target - from) * eased;
      if (progress < 1) this.fadeFrames.set(audio, requestAnimationFrame(tick));
      else { this.fadeFrames.delete(audio); done?.(); }
    };
    this.fadeFrames.set(audio, requestAnimationFrame(tick));
  }

  private scheduleCrossfade() {
    this.clearLoopTimer();
    if (!this.running) return;
    const active = this.getAmbientAudio();
    const duration = Number.isFinite(active.duration) && active.duration > this.crossfadeSeconds
      ? active.duration
      : this.durationSeconds;
    const delay = Math.max(0, (duration - active.currentTime - this.crossfadeSeconds) * 1000);
    this.loopTimer = window.setTimeout(() => {
      this.loopTimer = null;
      this.crossfadeToNext();
    }, delay);
  }

  private crossfadeToNext() {
    if (!this.running) return;
    const [first, second] = this.ensure();
    const outgoing = this.activeIndex === 0 ? first : second;
    const incoming = this.activeIndex === 0 ? second : first;
    if (!outgoing.paused && !incoming.paused) return;

    prepareStandbyAudio(incoming, this.source);

    this.cancelFade(outgoing);
    this.cancelFade(incoming);
    if (this.crossfadeFrame !== null) cancelAnimationFrame(this.crossfadeFrame);
    this.crossfadeFrame = null;
    incoming.pause();
    incoming.currentTime = 0;
    incoming.volume = 0;
    incoming.loop = false;
    incoming.muted = false;
    void incoming.play().then(() => {
      if (!this.running) { incoming.pause(); return; }
      const began = performance.now();
      const durationMs = this.crossfadeSeconds * 1000;
      const tick = (now: number) => {
        const progress = Math.min(1, (now - began) / durationMs);
        // Equal-power curves keep the ambient water bed steady through the overlap.
        outgoing.volume = Math.max(0, Math.min(1, this.baseVolume * Math.cos(progress * Math.PI * 0.5)));
        incoming.volume = Math.max(0, Math.min(1, this.baseVolume * Math.sin(progress * Math.PI * 0.5)));
        if (progress < 1) this.crossfadeFrame = requestAnimationFrame(tick);
        else {
          this.crossfadeFrame = null;
          outgoing.pause();
          outgoing.currentTime = 0;
          outgoing.volume = 0;
          this.activeIndex = this.activeIndex === 0 ? 1 : 0;
          this.scheduleCrossfade();
        }
      };
      this.crossfadeFrame = requestAnimationFrame(tick);
    }).catch(() => {
      if (this.running) this.scheduleCrossfade();
    });
  }

  /** The first water player begins in the real Enter click in SceneStage. */
  startSoundscape() {
    if (this.running) return;
    const active = this.getAmbientAudio();
    this.running = true;
    active.loop = false;
    active.muted = false;
    if (this.context?.state === "suspended") void this.context.resume();
    this.fade(active, this.baseVolume, this.fadeInMs);
    this.scheduleCrossfade();
    if (this.occasionalEvent) {
      this.scheduleEvent(randomBetween(
        this.occasionalEvent.firstInterval.minimum,
        this.occasionalEvent.firstInterval.maximum,
      ));
    }
  }

  pauseSoundscape() {
    this.running = false;
    this.clearLoopTimer();
    this.cancelFades();
    this.stopEvent(false, 700);
    this.players?.forEach((audio) => this.fade(audio, 0, 700, () => audio.pause()));
  }

  resumeSoundscape() {
    if (this.running) return;
    const active = this.getAmbientAudio();
    this.running = true;
    active.loop = false;
    active.muted = false;
    if (this.context?.state === "suspended") void this.context.resume();
    void active.play().then(() => {
      this.fade(active, this.baseVolume, 850);
      this.scheduleCrossfade();
      if (this.occasionalEvent) {
        this.scheduleEvent(randomBetween(
          this.occasionalEvent.firstInterval.minimum,
          this.occasionalEvent.firstInterval.maximum,
        ));
      }
    }).catch(() => { this.running = false; });
  }

  stopSoundscape(fadeMs = 2000) {
    this.running = false;
    this.clearLoopTimer();
    this.cancelFades();
    this.stopEvent(true, Math.min(fadeMs, this.occasionalEvent?.exitFadeMs ?? 700));
    this.players?.forEach((audio) => this.fade(audio, 0, fadeMs, () => {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0;
    }));
    this.activeIndex = 0;
  }

  destroy() {
    this.running = false;
    this.clearLoopTimer();
    this.cancelFades();
    this.clearEventTimers();
    this.releaseEvent();
    this.players?.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0;
      audio.remove();
    });
    this.processingSources.forEach((source) => source.disconnect());
    this.processingNodes.forEach((node) => node.disconnect());
    if (this.context) void this.context.close();
    this.players = null;
    this.processingSources = [];
    this.processingNodes = [];
    this.context = null;
    this.activeIndex = 0;
  }
}

class SwissLakesSoundscape {
  private player: HTMLAudioElement | null = null;
  private waterPlayer: HTMLAudioElement | null = null;
  private fadeFrames = new Map<HTMLAudioElement, number>();
  private running = false;

  private ensure() {
    if (!this.player) {
      const audio = acquirePrimaryAudio("swiss-lakeside-morning", SWISS_LAKES_AMBIENCE);
      audio.preload = "auto";
      audio.loop = true;
      audio.muted = false;
      audio.volume = 0;
      audio.setAttribute("aria-hidden", "true");
      audio.style.display = "none";
      if (!audio.isConnected) document.body.append(audio);
      if (audio.readyState === HTMLMediaElement.HAVE_NOTHING) audio.load();
      this.player = audio;
    }
    return this.player;
  }

  getAmbientAudio() {
    return this.ensure();
  }

  private ensureWater() {
    if (!this.waterPlayer) {
      const audio = new Audio(SWISS_LAKES_WATER);
      audio.preload = "auto";
      audio.loop = true;
      audio.muted = false;
      audio.volume = 0;
      audio.setAttribute("aria-hidden", "true");
      audio.style.display = "none";
      document.body.append(audio);
      audio.load();
      this.waterPlayer = audio;
    }
    return this.waterPlayer;
  }

  private cancelFade(audio: HTMLAudioElement) {
    const frame = this.fadeFrames.get(audio);
    if (frame !== undefined) cancelAnimationFrame(frame);
    this.fadeFrames.delete(audio);
  }

  private cancelFades() {
    this.fadeFrames.forEach((frame) => cancelAnimationFrame(frame));
    this.fadeFrames.clear();
  }

  private fade(audio: HTMLAudioElement, target: number, duration: number, done?: () => void) {
    this.cancelFade(audio);
    const from = audio.volume;
    const began = performance.now();
    const tick = (now: number) => {
      this.fadeFrames.delete(audio);
      const progress = Math.min(1, (now - began) / duration);
      const eased = progress * progress * (3 - 2 * progress);
      audio.volume = from + (target - from) * eased;
      if (progress < 1) this.fadeFrames.set(audio, requestAnimationFrame(tick));
      else {
        done?.();
      }
    };
    this.fadeFrames.set(audio, requestAnimationFrame(tick));
  }

  /** Playback itself is initiated from the real Enter click in SceneStage. */
  startSoundscape() {
    if (this.running) return;
    const mountain = this.ensure();
    const water = this.ensureWater();
    this.running = true;
    mountain.loop = true;
    mountain.muted = false;
    water.loop = true;
    water.muted = false;
    this.fade(mountain, 0.32, 2000);
    water.volume = 0;
    void water.play().then(() => {
      if (this.running) this.fade(water, 0.075, 2000);
    }).catch(() => {
      // The primary ambience remains available even if a browser blocks this quiet layer.
    });
  }

  pauseSoundscape() {
    this.running = false;
    [this.player, this.waterPlayer].forEach((audio) => {
      if (audio) this.fade(audio, 0, 700, () => audio.pause());
    });
  }

  resumeSoundscape() {
    if (this.running) return;
    const mountain = this.ensure();
    const water = this.ensureWater();
    this.running = true;
    mountain.loop = true;
    water.loop = true;
    void mountain.play().then(() => this.fade(mountain, 0.32, 850)).catch(() => {});
    void water.play().then(() => this.fade(water, 0.075, 850)).catch(() => {});
  }

  stopSoundscape(fadeMs = 2000) {
    this.running = false;
    const stop = (audio: HTMLAudioElement) => this.fade(audio, 0, fadeMs, () => {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0;
    });
    if (this.player) stop(this.player);
    if (this.waterPlayer) stop(this.waterPlayer);
  }

  destroy() {
    this.running = false;
    this.cancelFades();
    [this.player, this.waterPlayer].forEach((audio) => {
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0;
      audio.remove();
    });
    this.player = null;
    this.waterPlayer = null;
  }
}

type OccasionalAudioEvent = {
  source: string;
  volume: number;
  firstDelayMs: number;
  repeatInterval?: { minimum: number; maximum: number };
  resonanceMs?: number;
  exitFadeMs?: number;
};

class SingleAmbientSoundscape {
  private player: HTMLAudioElement | null = null;
  private eventPlayer: HTMLAudioElement | null = null;
  private eventContext: AudioContext | null = null;
  private eventSource: MediaElementAudioSourceNode | null = null;
  private eventMasterGain: GainNode | null = null;
  private fadeFrame: number | null = null;
  private eventTimer: number | null = null;
  private eventReleaseTimer: number | null = null;
  private eventArmed = false;
  private eventPlayed = false;
  private running = false;

  constructor(
    private readonly source: string,
    private readonly volume: number,
    private readonly fadeInMs = 2000,
    private readonly occasionalEvent?: OccasionalAudioEvent,
  ) {}

  private ensure() {
    if (!this.player) {
      const audio = acquirePrimaryAudio("bali-sunrise-house", this.source);
      audio.preload = "auto";
      audio.loop = true;
      audio.muted = false;
      audio.volume = 0;
      audio.setAttribute("aria-hidden", "true");
      audio.style.display = "none";
      if (!audio.isConnected) document.body.append(audio);
      if (audio.readyState === HTMLMediaElement.HAVE_NOTHING) audio.load();
      this.player = audio;
    }
    return this.player;
  }

  getAmbientAudio() { return this.ensure(); }

  private ensureEvent() {
    if (!this.occasionalEvent) return null;
    if (!this.eventPlayer) {
      const audio = new Audio(this.occasionalEvent.source);
      audio.preload = "auto";
      audio.loop = false;
      audio.muted = false;
      audio.volume = 1;
      audio.setAttribute("aria-hidden", "true");
      audio.style.display = "none";
      audio.onerror = () => console.error("Bali temple bell audio failed to load:", audio.error);
      audio.onended = () => this.scheduleNextEvent();
      document.body.append(audio);
      audio.load();
      this.eventPlayer = audio;

      const context = new AudioContext();
      const source = context.createMediaElementSource(audio);
      const dryGain = context.createGain();
      const convolver = context.createConvolver();
      const reverbFilter = context.createBiquadFilter();
      const wetGain = context.createGain();
      const masterGain = context.createGain();

      dryGain.gain.value = 1;
      wetGain.gain.value = 0.075;
      masterGain.gain.value = 0.0001;
      reverbFilter.type = "lowpass";
      reverbFilter.frequency.value = 3400;
      reverbFilter.Q.value = 0.45;

      // A short, diffuse open-air impulse extends the existing recorded tail
      // without introducing a perceptible repeat or a cinematic echo.
      const impulseSeconds = 5.4;
      const impulse = context.createBuffer(2, Math.ceil(context.sampleRate * impulseSeconds), context.sampleRate);
      for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
        const samples = impulse.getChannelData(channel);
        let softenedNoise = 0;
        for (let index = 0; index < samples.length; index += 1) {
          const progress = index / samples.length;
          softenedNoise = softenedNoise * 0.72 + (Math.random() * 2 - 1) * 0.28;
          const envelope = Math.pow(1 - progress, 2.8) * Math.exp(-progress * 1.35);
          samples[index] = softenedNoise * envelope;
        }
      }
      convolver.buffer = impulse;

      source.connect(dryGain);
      dryGain.connect(masterGain);
      source.connect(convolver);
      convolver.connect(reverbFilter);
      reverbFilter.connect(wetGain);
      wetGain.connect(masterGain);
      masterGain.connect(context.destination);

      this.eventContext = context;
      this.eventSource = source;
      this.eventMasterGain = masterGain;
    }
    return this.eventPlayer;
  }

  private clearEventTimer() {
    if (this.eventTimer !== null) window.clearTimeout(this.eventTimer);
    this.eventTimer = null;
  }

  private clearEventReleaseTimer() {
    if (this.eventReleaseTimer !== null) window.clearTimeout(this.eventReleaseTimer);
    this.eventReleaseTimer = null;
  }

  private scheduleNextEvent() {
    const interval = this.occasionalEvent?.repeatInterval;
    if (!interval || !this.running || !this.eventArmed || !this.eventPlayed) return;
    this.clearEventTimer();
    const delay = randomBetween(interval.minimum, interval.maximum);
    this.eventTimer = window.setTimeout(() => {
      this.eventTimer = null;
      const audio = this.eventPlayer;
      if (!audio || !this.running || !this.eventArmed || !audio.paused) return;
      audio.currentTime = 0;
      this.applyEventDecay();
      void audio.play().catch((error: unknown) => {
        console.error("Bali temple bell repeat playback failed:", error);
      });
    }, delay);
  }

  private applyEventDecay() {
    if (!this.occasionalEvent || !this.eventContext || !this.eventMasterGain) return;
    const durationSeconds = (this.occasionalEvent.resonanceMs ?? 13_500) / 1000;
    const curve = new Float32Array(160);
    for (let index = 0; index < curve.length; index += 1) {
      const progress = index / (curve.length - 1);
      const naturalTail = Math.pow(1 - progress, 1.4) * 0.75 + Math.exp(-progress * 3) * 0.25;
      curve[index] = Math.max(0.0001, this.occasionalEvent.volume * naturalTail);
    }
    const gain = this.eventMasterGain.gain;
    const now = this.eventContext.currentTime;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(this.occasionalEvent.volume, now);
    gain.setValueCurveAtTime(curve, now, durationSeconds);
  }

  /**
   * Must be invoked directly from the Enter button's click handler.  Browsers
   * associate this initial silent playback with that user gesture; the same
   * already-playing element is then rewound for the audible strike shortly
   * after arrival, avoiding a blocked delayed autoplay request.
   */
  primeEventFromUserGesture() {
    if (!this.occasionalEvent || this.eventArmed) return;
    const audio = this.ensureEvent();
    if (!audio) return;
    // A later visit to Bali is a new user-initiated scene entry.
    this.eventPlayed = false;
    this.eventArmed = true;
    audio.pause();
    audio.currentTime = 0;
    audio.muted = false;
    audio.loop = false;
    audio.volume = 1;
    if (this.eventMasterGain && this.eventContext) {
      const now = this.eventContext.currentTime;
      this.eventMasterGain.gain.cancelScheduledValues(now);
      this.eventMasterGain.gain.setValueAtTime(0.0001, now);
      void this.eventContext.resume().catch((error: unknown) => {
        console.error("Bali temple bell audio context failed to resume:", error);
      });
    }

    const playback = audio.play();
    playback.catch((error: unknown) => {
      this.eventArmed = false;
      this.clearEventTimer();
      console.error("Bali temple bell playback failed:", error);
    });

    this.clearEventTimer();
    this.eventTimer = window.setTimeout(() => {
      this.eventTimer = null;
      if (!this.eventArmed || this.eventPlayed) return;
      audio.currentTime = 0;
      this.applyEventDecay();
      this.eventPlayed = true;
    }, this.occasionalEvent.firstDelayMs);
  }

  private releaseEventResources() {
    this.clearEventReleaseTimer();
    if (this.eventPlayer) {
      this.eventPlayer.pause();
      this.eventPlayer.currentTime = 0;
      this.eventPlayer.onerror = null;
      this.eventPlayer.onended = null;
      this.eventPlayer.remove();
      this.eventPlayer = null;
    }
    this.eventSource?.disconnect();
    this.eventSource = null;
    this.eventMasterGain?.disconnect();
    this.eventMasterGain = null;
    if (this.eventContext) void this.eventContext.close().catch(() => {});
    this.eventContext = null;
    this.eventArmed = false;
  }

  private stopEvent(release = false, fadeMs = 0) {
    this.clearEventTimer();
    if (!this.eventPlayer) return;
    this.clearEventReleaseTimer();
    if (fadeMs > 0 && this.eventContext && this.eventMasterGain) {
      const gain = this.eventMasterGain.gain;
      const now = this.eventContext.currentTime;
      gain.cancelAndHoldAtTime(now);
      gain.exponentialRampToValueAtTime(0.0001, now + fadeMs / 1000);
      this.eventReleaseTimer = window.setTimeout(() => this.releaseEventResources(), fadeMs + 80);
      return;
    }
    this.eventPlayer.pause();
    this.eventPlayer.currentTime = 0;
    this.eventArmed = false;
    if (release) this.releaseEventResources();
  }

  private fade(audio: HTMLAudioElement, target: number, duration: number, done?: () => void) {
    if (this.fadeFrame !== null) cancelAnimationFrame(this.fadeFrame);
    const from = audio.volume;
    const began = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - began) / duration);
      const eased = progress * progress * (3 - 2 * progress);
      audio.volume = from + (target - from) * eased;
      if (progress < 1) this.fadeFrame = requestAnimationFrame(tick);
      else { this.fadeFrame = null; done?.(); }
    };
    this.fadeFrame = requestAnimationFrame(tick);
  }

  startSoundscape() {
    if (this.running) return;
    const audio = this.ensure();
    this.running = true;
    audio.loop = true;
    this.fade(audio, this.volume, this.fadeInMs);
  }

  pauseSoundscape() {
    if (!this.player) return;
    this.running = false;
    this.stopEvent();
    this.fade(this.player, 0, 700, () => this.player?.pause());
  }

  resumeSoundscape() {
    if (this.running) return;
    const audio = this.ensure();
    this.running = true;
    void audio.play().then(() => this.fade(audio, this.volume, 850)).catch(() => {});
  }

  stopSoundscape(fadeMs = 2000) {
    if (!this.player) return;
    this.running = false;
    // Scene exit releases the one-shot bell and its timer; the bird bed keeps
    // using its existing player and fade behavior unchanged.
    this.stopEvent(true, this.occasionalEvent?.exitFadeMs ?? 1800);
    this.fade(this.player, 0, fadeMs, () => {
      this.player?.pause();
      if (this.player) this.player.currentTime = 0;
    });
  }

  destroy() {
    this.running = false;
    this.stopEvent(true);
    if (this.fadeFrame !== null) cancelAnimationFrame(this.fadeFrame);
    this.fadeFrame = null;
    if (this.player) {
      this.player.pause();
      this.player.currentTime = 0;
      this.player.remove();
      this.player = null;
    }
    this.releaseEventResources();
  }
}

export const AmbientAudio = forwardRef<AmbientAudioHandle, AmbientAudioProps>(function AmbientAudio({ sceneId }, ref) {
  const hokkaidoSoundscapeRef = useRef<HokkaidoSoundscape | null>(null);
  const kyotoSoundscapeRef = useRef<KyotoRainSoundscape | null>(null);
  const icelandAuroraSoundscapeRef = useRef<IcelandAuroraSoundscape | null>(null);
  const provenceGardenSoundscapeRef = useRef<ProvenceGardenSoundscape | null>(null);
  const tuscanyTownSoundscapeRef = useRef<TuscanyTownSoundscape | null>(null);
  const seoulCitySoundscapeRef = useRef<SeoulCitySoundscape | null>(null);
  const finlandFireplaceSoundscapeRef = useRef<FinlandFireplaceSoundscape | null>(null);
  const norwegianFjordSoundscapeRef = useRef<NorwegianFjordSoundscape | null>(null);
  const swissLakesSoundscapeRef = useRef<SwissLakesSoundscape | null>(null);
  const baliMorningSoundscapeRef = useRef<SingleAmbientSoundscape | null>(null);
  const newZealandHotSpringSoundscapeRef = useRef<CrossfadeAmbientSoundscape | null>(null);
  const californiaCoastalWavesSoundscapeRef = useRef<CrossfadeAmbientSoundscape | null>(null);
  if (!hokkaidoSoundscapeRef.current) hokkaidoSoundscapeRef.current = new HokkaidoSoundscape();
  if (!kyotoSoundscapeRef.current) kyotoSoundscapeRef.current = new KyotoRainSoundscape();
  if (!icelandAuroraSoundscapeRef.current) icelandAuroraSoundscapeRef.current = new IcelandAuroraSoundscape();
  if (!provenceGardenSoundscapeRef.current) provenceGardenSoundscapeRef.current = new ProvenceGardenSoundscape();
  if (!tuscanyTownSoundscapeRef.current) tuscanyTownSoundscapeRef.current = new TuscanyTownSoundscape();
  if (!seoulCitySoundscapeRef.current) seoulCitySoundscapeRef.current = new SeoulCitySoundscape();
  if (!finlandFireplaceSoundscapeRef.current) finlandFireplaceSoundscapeRef.current = new FinlandFireplaceSoundscape();
  if (!norwegianFjordSoundscapeRef.current) norwegianFjordSoundscapeRef.current = new NorwegianFjordSoundscape();
  if (!swissLakesSoundscapeRef.current) swissLakesSoundscapeRef.current = new SwissLakesSoundscape();
  if (!baliMorningSoundscapeRef.current) baliMorningSoundscapeRef.current = new SingleAmbientSoundscape(BALI_MORNING_AUDIO, BALI_MORNING_BASE_VOLUME, 2000, {
    source: BALI_TEMPLE_BELL_AUDIO,
    volume: BALI_TEMPLE_BELL_VOLUME,
    firstDelayMs: BALI_TEMPLE_BELL_FIRST_DELAY_MS,
    repeatInterval: BALI_TEMPLE_BELL_REPEAT_INTERVAL,
    resonanceMs: 13_500,
    exitFadeMs: 1800,
  });
  if (!newZealandHotSpringSoundscapeRef.current) newZealandHotSpringSoundscapeRef.current = new CrossfadeAmbientSoundscape(
    "new-zealand-mountain-cabin",
    NEW_ZEALAND_HOT_SPRING_AUDIO,
    NEW_ZEALAND_HOT_SPRING_BASE_VOLUME,
    NEW_ZEALAND_HOT_SPRING_DURATION_SECONDS,
    NEW_ZEALAND_HOT_SPRING_CROSSFADE_SECONDS,
    2000,
    {
      highPassFrequency: NEW_ZEALAND_HOT_SPRING_HIGH_PASS_FREQUENCY,
      highPassQ: NEW_ZEALAND_HOT_SPRING_HIGH_PASS_Q,
      lowShelfFrequency: NEW_ZEALAND_HOT_SPRING_LOW_SHELF_FREQUENCY,
      lowShelfGainDb: NEW_ZEALAND_HOT_SPRING_LOW_SHELF_GAIN_DB,
      stereoPan: NEW_ZEALAND_HOT_SPRING_STEREO_PAN,
    },
    {
      source: NEW_ZEALAND_TUSSOCK_AUDIO,
      volume: NEW_ZEALAND_TUSSOCK_VOLUME,
      firstInterval: NEW_ZEALAND_TUSSOCK_FIRST_INTERVAL,
      repeatInterval: NEW_ZEALAND_TUSSOCK_REPEAT_INTERVAL,
      prepareLeadMs: NEW_ZEALAND_TUSSOCK_PREPARE_LEAD_MS,
      audibleOffsetMs: NEW_ZEALAND_TUSSOCK_AUDIBLE_OFFSET_MS,
      exitFadeMs: 700,
    },
  );
  if (!californiaCoastalWavesSoundscapeRef.current) californiaCoastalWavesSoundscapeRef.current = new CrossfadeAmbientSoundscape(
    "california-coastal-morning",
    CALIFORNIA_COASTAL_WAVES_AUDIO,
    CALIFORNIA_COASTAL_WAVES_BASE_VOLUME,
    CALIFORNIA_COASTAL_WAVES_DURATION_SECONDS,
    CALIFORNIA_COASTAL_WAVES_CROSSFADE_SECONDS,
    2000,
    {
      lowShelfFrequency: CALIFORNIA_COASTAL_WAVES_LOW_SHELF_FREQUENCY,
      lowShelfGainDb: CALIFORNIA_COASTAL_WAVES_LOW_SHELF_GAIN_DB,
      presenceDipFrequency: CALIFORNIA_COASTAL_WAVES_PRESENCE_DIP_FREQUENCY,
      presenceDipQ: CALIFORNIA_COASTAL_WAVES_PRESENCE_DIP_Q,
      presenceDipGainDb: CALIFORNIA_COASTAL_WAVES_PRESENCE_DIP_GAIN_DB,
    },
    {
      source: CALIFORNIA_RIDGE_BIRD_AUDIO,
      volume: CALIFORNIA_RIDGE_BIRD_VOLUME,
      firstInterval: CALIFORNIA_RIDGE_BIRD_FIRST_INTERVAL,
      repeatInterval: CALIFORNIA_RIDGE_BIRD_REPEAT_INTERVAL,
      prepareLeadMs: CALIFORNIA_RIDGE_BIRD_PREPARE_LEAD_MS,
      audibleOffsetMs: CALIFORNIA_RIDGE_BIRD_AUDIBLE_OFFSET_MS,
      exitFadeMs: 700,
    },
  );
  const hokkaidoSoundscape = hokkaidoSoundscapeRef.current;
  const kyotoSoundscape = kyotoSoundscapeRef.current;
  const icelandAuroraSoundscape = icelandAuroraSoundscapeRef.current;
  const provenceGardenSoundscape = provenceGardenSoundscapeRef.current;
  const tuscanyTownSoundscape = tuscanyTownSoundscapeRef.current;
  const seoulCitySoundscape = seoulCitySoundscapeRef.current;
  const finlandFireplaceSoundscape = finlandFireplaceSoundscapeRef.current;
  const norwegianFjordSoundscape = norwegianFjordSoundscapeRef.current;
  const swissLakesSoundscape = swissLakesSoundscapeRef.current;
  const baliMorningSoundscape = baliMorningSoundscapeRef.current;
  const newZealandHotSpringSoundscape = newZealandHotSpringSoundscapeRef.current;
  const californiaCoastalWavesSoundscape = californiaCoastalWavesSoundscapeRef.current;

  useEffect(() => () => { hokkaidoSoundscape.destroy(); kyotoSoundscape.destroy(); icelandAuroraSoundscape.destroy(); provenceGardenSoundscape.destroy(); tuscanyTownSoundscape.destroy(); seoulCitySoundscape.destroy(); finlandFireplaceSoundscape.destroy(); norwegianFjordSoundscape.destroy(); swissLakesSoundscape.destroy(); baliMorningSoundscape.destroy(); newZealandHotSpringSoundscape.destroy(); californiaCoastalWavesSoundscape.destroy(); }, [baliMorningSoundscape, californiaCoastalWavesSoundscape, finlandFireplaceSoundscape, hokkaidoSoundscape, icelandAuroraSoundscape, kyotoSoundscape, newZealandHotSpringSoundscape, norwegianFjordSoundscape, provenceGardenSoundscape, seoulCitySoundscape, swissLakesSoundscape, tuscanyTownSoundscape]);

  useImperativeHandle(ref, () => ({
    getAmbientAudio: () => {
      if (sceneId === "hokkaido-forest-cabin") return hokkaidoSoundscape.getAmbientAudio();
      if (sceneId === "kyoto-rainy-cafe") return kyotoSoundscape.getAmbientAudio();
      if (sceneId === "iceland-aurora-lodge") return icelandAuroraSoundscape.getAmbientAudio();
      if (sceneId === "provence-kitchen") return provenceGardenSoundscape.getAmbientAudio();
      if (sceneId === "tuscany-summer-villa") return tuscanyTownSoundscape.getAmbientAudio();
      if (sceneId === "seoul-rooftop-sunset") return seoulCitySoundscape.getAmbientAudio();
      if (sceneId === "finland-glass-cabin") return finlandFireplaceSoundscape.getAmbientAudio();
      if (sceneId === "norwegian-fjord-house") return norwegianFjordSoundscape.getAmbientAudio();
      if (sceneId === "swiss-lakeside-morning") return swissLakesSoundscape.getAmbientAudio();
      if (sceneId === "bali-sunrise-house") return baliMorningSoundscape.getAmbientAudio();
      if (sceneId === "new-zealand-mountain-cabin") return newZealandHotSpringSoundscape.getAmbientAudio();
      if (sceneId === "california-coastal-morning") return californiaCoastalWavesSoundscape.getAmbientAudio();
      return null;
    },
    primeBaliTempleBell: () => {
      if (sceneId === "bali-sunrise-house") baliMorningSoundscape.primeEventFromUserGesture();
    },
    startSoundscape: () => {
      if (sceneId === "hokkaido-forest-cabin") hokkaidoSoundscape.startSoundscape();
      if (sceneId === "kyoto-rainy-cafe") kyotoSoundscape.startSoundscape();
      if (sceneId === "iceland-aurora-lodge") icelandAuroraSoundscape.startSoundscape();
      if (sceneId === "provence-kitchen") provenceGardenSoundscape.startSoundscape();
      if (sceneId === "tuscany-summer-villa") tuscanyTownSoundscape.startSoundscape();
      if (sceneId === "seoul-rooftop-sunset") seoulCitySoundscape.startSoundscape();
      if (sceneId === "finland-glass-cabin") finlandFireplaceSoundscape.startSoundscape();
      if (sceneId === "norwegian-fjord-house") norwegianFjordSoundscape.startSoundscape();
      if (sceneId === "swiss-lakeside-morning") swissLakesSoundscape.startSoundscape();
      if (sceneId === "bali-sunrise-house") baliMorningSoundscape.startSoundscape();
      if (sceneId === "new-zealand-mountain-cabin") newZealandHotSpringSoundscape.startSoundscape();
      if (sceneId === "california-coastal-morning") californiaCoastalWavesSoundscape.startSoundscape();
    },
    pauseSoundscape: () => {
      if (sceneId === "hokkaido-forest-cabin") hokkaidoSoundscape.pauseSoundscape();
      if (sceneId === "kyoto-rainy-cafe") kyotoSoundscape.pauseSoundscape();
      if (sceneId === "iceland-aurora-lodge") icelandAuroraSoundscape.pauseSoundscape();
      if (sceneId === "provence-kitchen") provenceGardenSoundscape.pauseSoundscape();
      if (sceneId === "tuscany-summer-villa") tuscanyTownSoundscape.pauseSoundscape();
      if (sceneId === "seoul-rooftop-sunset") seoulCitySoundscape.pauseSoundscape();
      if (sceneId === "finland-glass-cabin") finlandFireplaceSoundscape.pauseSoundscape();
      if (sceneId === "norwegian-fjord-house") norwegianFjordSoundscape.pauseSoundscape();
      if (sceneId === "swiss-lakeside-morning") swissLakesSoundscape.pauseSoundscape();
      if (sceneId === "bali-sunrise-house") baliMorningSoundscape.pauseSoundscape();
      if (sceneId === "new-zealand-mountain-cabin") newZealandHotSpringSoundscape.pauseSoundscape();
      if (sceneId === "california-coastal-morning") californiaCoastalWavesSoundscape.pauseSoundscape();
    },
    resumeSoundscape: () => {
      if (sceneId === "hokkaido-forest-cabin") hokkaidoSoundscape.resumeSoundscape();
      if (sceneId === "kyoto-rainy-cafe") kyotoSoundscape.resumeSoundscape();
      if (sceneId === "iceland-aurora-lodge") icelandAuroraSoundscape.resumeSoundscape();
      if (sceneId === "provence-kitchen") provenceGardenSoundscape.resumeSoundscape();
      if (sceneId === "tuscany-summer-villa") tuscanyTownSoundscape.resumeSoundscape();
      if (sceneId === "seoul-rooftop-sunset") seoulCitySoundscape.resumeSoundscape();
      if (sceneId === "finland-glass-cabin") finlandFireplaceSoundscape.resumeSoundscape();
      if (sceneId === "norwegian-fjord-house") norwegianFjordSoundscape.resumeSoundscape();
      if (sceneId === "swiss-lakeside-morning") swissLakesSoundscape.resumeSoundscape();
      if (sceneId === "bali-sunrise-house") baliMorningSoundscape.resumeSoundscape();
      if (sceneId === "new-zealand-mountain-cabin") newZealandHotSpringSoundscape.resumeSoundscape();
      if (sceneId === "california-coastal-morning") californiaCoastalWavesSoundscape.resumeSoundscape();
    },
    stopSoundscape: (fadeMs?: number) => {
      if (sceneId === "hokkaido-forest-cabin") hokkaidoSoundscape.stopSoundscape(fadeMs);
      if (sceneId === "kyoto-rainy-cafe") kyotoSoundscape.stopSoundscape(fadeMs);
      if (sceneId === "iceland-aurora-lodge") icelandAuroraSoundscape.stopSoundscape(fadeMs);
      if (sceneId === "provence-kitchen") provenceGardenSoundscape.stopSoundscape(fadeMs);
      if (sceneId === "tuscany-summer-villa") tuscanyTownSoundscape.stopSoundscape(fadeMs);
      if (sceneId === "seoul-rooftop-sunset") seoulCitySoundscape.stopSoundscape(fadeMs);
      if (sceneId === "finland-glass-cabin") finlandFireplaceSoundscape.stopSoundscape(fadeMs);
      if (sceneId === "norwegian-fjord-house") norwegianFjordSoundscape.stopSoundscape(fadeMs);
      if (sceneId === "swiss-lakeside-morning") swissLakesSoundscape.stopSoundscape(fadeMs);
      if (sceneId === "bali-sunrise-house") baliMorningSoundscape.stopSoundscape(fadeMs);
      if (sceneId === "new-zealand-mountain-cabin") newZealandHotSpringSoundscape.stopSoundscape(fadeMs);
      if (sceneId === "california-coastal-morning") californiaCoastalWavesSoundscape.stopSoundscape(fadeMs);
    },
  }), [baliMorningSoundscape, californiaCoastalWavesSoundscape, finlandFireplaceSoundscape, hokkaidoSoundscape, icelandAuroraSoundscape, kyotoSoundscape, newZealandHotSpringSoundscape, norwegianFjordSoundscape, provenceGardenSoundscape, sceneId, swissLakesSoundscape, tuscanyTownSoundscape]);

  return null;
});
