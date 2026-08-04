"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { moods, moodById, sceneById, scenesForMood, type Mood, type Scene } from "@/data/scenes";
import { BALI_SUNRISE_DESTINATION_ID, markScenePlaceDiscovered } from "@/data/destinations";
import { migrateHavenStorage } from "@/data/havenStorage";
import { formatSessionTime, useHavenSession, type ActiveSession } from "@/hooks/useHavenSession";
import { AmbientAudio, type AmbientAudioHandle } from "./AmbientAudio";
import { DeveloperTools } from "./DeveloperTools";
import { YourWorldPage } from "./YourWorldPage";

const appPath = () => window.location.pathname;
type KyotoStyle = CSSProperties & Record<`--${string}`, string>;
const HOKKAIDO_SCENE_ID = "hokkaido-forest-cabin";
const ICELAND_SCENE_ID = "iceland-aurora-lodge";
const FINLAND_SCENE_ID = "finland-glass-cabin";
const NORWEGIAN_FJORD_SCENE_ID = "norwegian-fjord-house";
type ImagePreparation = "ready" | "failed";
const hokkaidoImagePreparations = new Map<string, Promise<ImagePreparation>>();

const recommendationHeading = (count: number) => {
  const words = ["", "A", "Two", "Three", "Four"];
  return `${words[count] ?? String(count)} place${count === 1 ? " is" : "s are"} waiting for you.`;
};

/**
 * Prepares the exact URL used by both the Hokkaido poster and scene background.
 * Keeping this promise at module scope prevents duplicate network/decode work as
 * people move between Explore, the introduction, and the living scene.
 */
function prepareHokkaidoHero(source: string) {
  const existing = hokkaidoImagePreparations.get(source);
  if (existing) return existing;

  const preparation = new Promise<ImagePreparation>((resolve) => {
    const image = new Image();
    image.decoding = "async";
    const finishLoaded = async () => {
      try {
        if ("decode" in image) await image.decode();
        resolve("ready");
      } catch {
        // A successful load can still fail decode() in some browsers; the cached
        // image remains safe to reveal in that case.
        resolve("ready");
      }
    };
    image.addEventListener("load", () => { void finishLoaded(); }, { once: true });
    image.addEventListener("error", () => {
      if (process.env.NODE_ENV === "development") console.warn("Haven: Hokkaido hero image could not be loaded.", source);
      resolve("failed");
    }, { once: true });
    image.src = source;
    if (image.complete && image.naturalWidth > 0) void finishLoaded();
  });
  hokkaidoImagePreparations.set(source, preparation);
  return preparation;
}

const seededValue = (seed: number) => {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
};

const seededRange = (seed: number, minimum: number, maximum: number) => minimum + seededValue(seed) * (maximum - minimum);

type SteamWisp = { id: number; left: number; bottom: number; width: number; height: number; duration: number; opacity: number; drift: number; curl: number; phase: number };
type RainDrop = { id: number; left: number; top: number; width: number; length: number; duration: number; delay: number; opacity: number; drift: number; merge: boolean };

function makeSteamWisp(id: number, phase = 0): SteamWisp {
  const duration = seededRange(id, 6.8, 10.8);
  return { id, left: seededRange(id + 1, 25.2, 30), bottom: seededRange(id + 2, 15, 16.1), width: seededRange(id + 3, 10, 17), height: seededRange(id + 4, 96, 132), duration, opacity: seededRange(id + 5, .16, .24), drift: seededRange(id + 6, -13, 13), curl: seededRange(id + 7, -7, 7), phase: Math.min(phase, duration * .76) };
}

function makeRainDrop(id: number): RainDrop {
  return { id, left: seededRange(id, 4, 95), top: seededRange(id + 1, -10, 32), width: seededRange(id + 2, 1.2, 2.4), length: seededRange(id + 3, 20, 96), duration: seededRange(id + 4, 10, 22), delay: seededRange(id + 5, .35, 3.1), opacity: seededRange(id + 6, .12, .28), drift: seededRange(id + 7, -3.5, 3.5), merge: seededValue(id + 8) > .67 };
}

function SteamWispLayer({ wisp, onBirth, onFinish }: { wisp: SteamWisp; onBirth: (id: number) => void; onFinish: (id: number) => void }) {
  useEffect(() => {
    const remaining = Math.max(700, (wisp.duration - wisp.phase) * 1000);
    const birth = window.setTimeout(() => onBirth(wisp.id), remaining * .72);
    const finish = window.setTimeout(() => onFinish(wisp.id), remaining + 80);
    return () => { window.clearTimeout(birth); window.clearTimeout(finish); };
  }, [onBirth, onFinish, wisp.duration, wisp.id, wisp.phase]);

  const style: KyotoStyle = { "--steam-left": `${wisp.left}%`, "--steam-bottom": `${wisp.bottom}%`, "--steam-width": `${wisp.width}px`, "--steam-height": `${wisp.height}px`, "--steam-duration": `${wisp.duration}s`, "--steam-opacity": `${wisp.opacity}`, "--steam-drift": `${wisp.drift}px`, "--steam-curl": `${wisp.curl}deg`, animationDelay: `-${wisp.phase}s` };
  return <span className="kyoto-coffee-steam" style={style} />;
}

function KyotoLivingLayer() {
  const nextSteamId = useRef(20);
  const nextRainId = useRef(90);
  const [steamWisps, setSteamWisps] = useState(() => [makeSteamWisp(1, 1.8), makeSteamWisp(2, 3.9), makeSteamWisp(3, 5.1), makeSteamWisp(4, 2.7)]);
  const [movingDrops, setMovingDrops] = useState(() => [makeRainDrop(61), makeRainDrop(72)]);

  const birthSteam = useCallback((id: number) => setSteamWisps((current) => current.some((wisp) => wisp.id === id) && current.length < 5 ? [...current, makeSteamWisp(nextSteamId.current++)] : current), []);
  const finishSteam = useCallback((id: number) => setSteamWisps((current) => {
    const remaining = current.filter((wisp) => wisp.id !== id);
    return remaining.length < 4 ? [...remaining, makeSteamWisp(nextSteamId.current++)] : remaining;
  }), []);
  const renewRain = (id: number) => setMovingDrops((current) => current.map((drop) => drop.id === id ? makeRainDrop(nextRainId.current++) : drop));
  const staticDroplets = Array.from({ length: 48 }, (_, index) => {
    const seed = index + 1;
    const style: KyotoStyle = { "--static-left": `${seededRange(seed, 2, 98)}%`, "--static-top": `${seededRange(seed + 1, 2, 96)}%`, "--static-size": `${seededRange(seed + 2, .8, 2.1)}px`, "--static-opacity": `${seededRange(seed + 3, .09, .26)}` };
    return <span key={seed} className="kyoto-static-droplet" style={style} />;
  });

  return <div className="kyoto-living-layer" aria-hidden="true">
    <span className="kyoto-lamp-glow" />
    <div className="kyoto-steam-system">{steamWisps.map((wisp) => <SteamWispLayer key={wisp.id} wisp={wisp} onBirth={birthSteam} onFinish={finishSteam} />)}</div>
    <div className="kyoto-window-rain-pane">
      <div className="kyoto-static-rain">{staticDroplets}</div>
      {movingDrops.map((drop) => {
        const style: KyotoStyle = { "--rain-left": `${drop.left}%`, "--rain-top": `${drop.top}%`, "--rain-width": `${drop.width}px`, "--rain-length": `${drop.length}px`, "--rain-duration": `${drop.duration}s`, "--rain-delay": `${drop.delay}s`, "--rain-opacity": `${drop.opacity}`, "--rain-drift": `${drop.drift}px` };
        return <span key={drop.id} className={`kyoto-window-rain ${drop.merge ? "kyoto-window-rain--merge" : ""}`} style={style} onAnimationEnd={() => renewRain(drop.id)} />;
      })}
    </div>
  </div>;
}

function SwissMistLayer() {
  return <div className="swiss-mist-layer" aria-hidden="true">
    <span className="swiss-mist swiss-mist--shore-left" />
    <span className="swiss-mist swiss-mist--shore-centre" />
    <span className="swiss-mist swiss-mist--shore-right" />
    <span className="swiss-mist swiss-mist--lake-left" />
    <span className="swiss-mist swiss-mist--lake-right" />
  </div>;
}

function FinlandAuroraLayer() {
  return <div className="finland-aurora-layer" aria-hidden="true">
    <div className="finland-aurora-coordinate">
      <span className="finland-aurora finland-aurora--background-curtain" />
      <span className="finland-aurora finland-aurora--green-flow" />
      <span className="finland-aurora finland-aurora--cyan-ribbon" />
      <span className="finland-aurora finland-aurora--violet-edge" />
      <span className="finland-aurora finland-aurora--diffuse-glow" />
    </div>
  </div>;
}

function BaliMorningLayer() {
  return <div className="bali-morning-layer" aria-hidden="true">
    <span className="bali-sunrise-haze" />
    <span className="bali-leaf bali-leaf--one" />
    <span className="bali-leaf bali-leaf--two" />
    <span className="bali-leaf bali-leaf--three" />
  </div>;
}

function MoodPoster({ mood, onChoose }: { mood: Mood; onChoose: () => void }) {
  return (
    <button className="mood-poster" onClick={onChoose}>
      <img src={mood.coverImage} alt="" />
      <span className="poster-shade" aria-hidden="true" />
      <span className="poster-copy">
        <small>{mood.name}</small>
        <strong>{mood.prompt}</strong>
        <em>{mood.description}</em>
        <b>Explore this feeling <i>→</i></b>
      </span>
    </button>
  );
}

function ScenePoster({ scene, onChoose }: { scene: Scene; onChoose: () => void }) {
  const prepareOnIntent = () => {
    if (scene.id === HOKKAIDO_SCENE_ID) void prepareHokkaidoHero(scene.backgroundImage);
  };
  const chooseWithKeyboard = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onChoose();
    }
  };

  return (
    <article className={`scene-poster ${scene.id === FINLAND_SCENE_ID ? "scene-poster--finland" : ""}`} role="link" tabIndex={0} onClick={onChoose} onKeyDown={chooseWithKeyboard} onMouseEnter={prepareOnIntent} onFocus={prepareOnIntent} onTouchStart={prepareOnIntent} aria-label={`Enter ${scene.name}`}>
      <img src={scene.coverImage} alt={scene.id === FINLAND_SCENE_ID ? "A warm glass-roof cabin in Finnish Lapland overlooking a snowy forest and the northern lights." : `${scene.name}, ${scene.location}`} decoding="async" fetchPriority={scene.id === HOKKAIDO_SCENE_ID ? "high" : "auto"} />
      <div className="scene-poster-copy">
        <p>{scene.location}</p>
        <h2>{scene.name}</h2>
        <span>{scene.description}</span>
        <span className="scene-poster-link" aria-hidden="true">
          {scene.status === "available" ? "Enter Scene" : "View scene"} <i>→</i>
        </span>
      </div>
    </article>
  );
}

type SessionTimerControlProps = {
  session: ActiveSession | null;
  remainingMs: number;
  completed: boolean;
  announcement: string;
  start: (durationMinutes: number | null) => void;
  pause: () => void;
  resume: () => void;
  addTenMinutes: () => void;
  end: () => void;
  continueWithoutTimer: () => void;
  clearCompletion: () => void;
  onLeave: () => void;
};

function SessionTimerControl({ session, remainingMs, completed, announcement, start, pause, resume, addTenMinutes, end, continueWithoutTimer, clearCompletion, onLeave }: SessionTimerControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const chooseDuration = (durationMinutes: number | null) => {
    start(durationMinutes);
    setIsOpen(false);
  };
  const openNewSession = () => {
    clearCompletion();
    setIsOpen(true);
  };

  return <>
    <div className="session-timer">
      <button aria-label={session ? `Session timer, ${formatSessionTime(remainingMs)} remaining` : "Open session timer"} aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)}>
        {session ? formatSessionTime(remainingMs) : "Timer"}
      </button>
      {isOpen && <section className="session-timer-panel" aria-label="Session Timer">
        <p>Session Timer</p>
        <div className="session-timer-options">
          {[15, 30, 45, 60].map((minutes) => <button key={minutes} aria-pressed={session?.durationMinutes === minutes} onClick={() => chooseDuration(minutes)}>{minutes} min</button>)}
          <button aria-pressed={!session} onClick={() => chooseDuration(null)}>∞</button>
        </div>
        {session && <div className="session-timer-actions">
          <button onClick={session.paused ? resume : pause}>{session.paused ? "Resume" : "Pause"}</button>
          <button onClick={addTenMinutes}>+10 min</button>
          <button onClick={() => setIsOpen(false)}>Done</button>
          <button className="session-end" onClick={end}>End session</button>
        </div>}
      </section>}
    </div>
    <span className="session-announcement" aria-live="polite">{announcement}</span>
    {completed && <aside className="session-complete" role="status" aria-live="polite">
      <p>Session complete</p>
      <div><button onClick={openNewSession}>Start another session</button><button onClick={continueWithoutTimer}>Continue without timer</button><button onClick={onLeave}>Leave Place</button></div>
    </aside>}
  </>;
}

function SceneStage({ scene, mode, onBack, onEnter, onLeave }: { scene: Scene; mode: "intro" | "active"; onBack: () => void; onEnter: () => void; onLeave: () => void }) {
  const isHokkaidoCabin = scene.id === HOKKAIDO_SCENE_ID;
  const isIcelandAuroraLodge = scene.id === ICELAND_SCENE_ID;
  const isFinlandGlassCabin = scene.id === FINLAND_SCENE_ID;
  const isNorwegianFjordHouse = scene.id === NORWEGIAN_FJORD_SCENE_ID;
  const isTuscanySummerVilla = scene.id === "tuscany-summer-villa";
  const isProvenceKitchen = scene.id === "provence-kitchen";
  const isSeoulRooftopSunset = scene.id === "seoul-rooftop-sunset";
  const isKyotoRainyCafe = scene.id === "kyoto-rainy-cafe";
  const isSwissLakes = scene.id === "swiss-lakeside-morning";
  const isBaliSunriseHouse = scene.id === BALI_SUNRISE_DESTINATION_ID;
  const hasAmbientSoundscape = isHokkaidoCabin || isIcelandAuroraLodge || isFinlandGlassCabin || isNorwegianFjordHouse || isTuscanySummerVilla || isProvenceKitchen || isSeoulRooftopSunset || isKyotoRainyCafe || isSwissLakes || isBaliSunriseHouse;
  const [entering, setEntering] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [sharedFrameStyle, setSharedFrameStyle] = useState<CSSProperties | undefined>();
  const stageRef = useRef<HTMLElement>(null);
  const sharedFrameRef = useRef<HTMLDivElement>(null);
  const ambientAudioRef = useRef<AmbientAudioHandle>(null);
  const [preparedHokkaidoImage, setPreparedHokkaidoImage] = useState<string | null>(null);
  const [failedHokkaidoImage, setFailedHokkaidoImage] = useState<string | null>(null);
  const sessionTimer = useHavenSession(scene.id, mode === "active", {
    onPauseAudio: () => { ambientAudioRef.current?.pauseSoundscape(); setSoundOn(false); },
    onResumeAudio: () => { ambientAudioRef.current?.resumeSoundscape(); setSoundOn(true); },
    onCompleteAudio: () => {
      ambientAudioRef.current?.stopSoundscape(10_000);
      setSoundOn(false);
      if (scene.discoveryTiming === "completion") markScenePlaceDiscovered(scene.id);
    },
    onEndAudio: () => { ambientAudioRef.current?.stopSoundscape(); setSoundOn(false); },
  });
  const { session: activeSession, remainingMs, completed, announcement, start, pause, resume, addTenMinutes, end, continueWithoutTimer, clearCompletion } = sessionTimer;

  useEffect(() => { if (mode === "intro") setLeaving(false); }, [mode]);

  useEffect(() => {
    if (!isHokkaidoCabin) return;
    let current = true;
    void prepareHokkaidoHero(scene.backgroundImage).then((result) => {
      if (!current) return;
      if (result === "ready") setPreparedHokkaidoImage(scene.backgroundImage);
      else setFailedHokkaidoImage(scene.backgroundImage);
    });
    return () => { current = false; };
  }, [isHokkaidoCabin, scene.backgroundImage]);

  useEffect(() => {
    if (activeSession?.paused) setSoundOn(false);
  }, [activeSession?.paused]);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const browserNavigator = navigator as Navigator & { audioSession?: { type: string } };
    if (browserNavigator.audioSession) {
      try { browserNavigator.audioSession.type = "playback"; } catch { /* Optional API. */ }
    }
    const mediaSession = navigator.mediaSession;
    if (!mediaSession) return;
    if (mode !== "active" || !hasAmbientSoundscape) {
      mediaSession.metadata = null;
      mediaSession.playbackState = "none";
      return;
    }
    const moment = scene.id === "hokkaido-forest-cabin" ? "Forest Cabin" : scene.id === "kyoto-rainy-cafe" ? "Rainy Café" : scene.id === ICELAND_SCENE_ID ? "Black Beach Cabin" : scene.id === FINLAND_SCENE_ID ? "Glass Cabin" : scene.id === NORWEGIAN_FJORD_SCENE_ID ? "Fjord House" : scene.id === BALI_SUNRISE_DESTINATION_ID ? "Sunrise House" : "Lakeside Morning";
    try {
      mediaSession.metadata = new MediaMetadata({ title: `${scene.city} — ${moment}`, artist: "Haven", album: "Ambient Session", artwork: [{ src: scene.coverImage }] });
    } catch { /* Metadata is progressive enhancement. */ }
    mediaSession.playbackState = activeSession?.paused || !soundOn ? "paused" : "playing";
    const handlePlay = () => {
      if (activeSession?.paused) resume();
      else ambientAudioRef.current?.resumeSoundscape();
      setSoundOn(true);
    };
    const handlePause = () => {
      if (activeSession && !activeSession.paused) pause();
      else ambientAudioRef.current?.pauseSoundscape();
      setSoundOn(false);
    };
    const handleStop = () => {
      if (activeSession) end();
      else ambientAudioRef.current?.stopSoundscape();
      setSoundOn(false);
      mediaSession.metadata = null;
      mediaSession.playbackState = "none";
    };
    try {
      mediaSession.setActionHandler("play", handlePlay);
      mediaSession.setActionHandler("pause", handlePause);
      mediaSession.setActionHandler("stop", handleStop);
    } catch { /* Some browsers expose only part of the Media Session API. */ }
    return () => {
      try {
        mediaSession.setActionHandler("play", null);
        mediaSession.setActionHandler("pause", null);
        mediaSession.setActionHandler("stop", null);
      } catch { /* Optional API. */ }
    };
  }, [activeSession, end, hasAmbientSoundscape, mode, pause, resume, scene.city, scene.coverImage, scene.id, soundOn]);

  const enter = async () => {
    if (entering) return;

    // The first playback request remains inside this actual user click, before
    // any navigation, visual transition, timer, or state change occurs.
    // Bali's bell is primed here specifically so its delayed audible strike is
    // still authorized by this exact Enter interaction in production browsers.
    if (isBaliSunriseHouse) ambientAudioRef.current?.primeBaliTempleBell();
    const audio = activeSession?.paused ? null : ambientAudioRef.current?.getAmbientAudio();
    if (audio) {
      audio.muted = false;
      audio.volume = 0;
      audio.loop = true;
      try {
        await audio.play();
        ambientAudioRef.current?.startSoundscape();
      } catch {
        // Keep the visual scene available if a browser/device explicitly blocks sound.
      }
    }

    // Freeze the exact preview-card geometry before changing routes. SceneStage
    // remains mounted between intro and active mode, so this is the same image
    // element all the way through the expansion.
    const stageBounds = stageRef.current?.getBoundingClientRect();
    const previewBounds = sharedFrameRef.current?.getBoundingClientRect();
    if (stageBounds && previewBounds) {
      setSharedFrameStyle({
        left: `${previewBounds.left - stageBounds.left}px`,
        top: `${previewBounds.top - stageBounds.top}px`,
        width: `${previewBounds.width}px`,
        height: `${previewBounds.height}px`,
        borderRadius: getComputedStyle(sharedFrameRef.current!).borderRadius,
        transform: "none",
      });
    }

    setEntering(true);
    window.requestAnimationFrame(() => {
      onEnter();
      // The active scene is now behind the same frozen image. On the next
      // frame remove the inline card geometry so CSS interpolates it to inset:0.
      window.requestAnimationFrame(() => setSharedFrameStyle(undefined));
    });
    window.setTimeout(() => setEntering(false), 1800);
  };
  const leave = () => {
    if (leaving) return;
    ambientAudioRef.current?.stopSoundscape();
    setLeaving(true);
    window.setTimeout(onLeave, 1600);
  };
  const toggleSound = async () => {
    const nextSoundOn = !soundOn;
    setSoundOn(nextSoundOn);
    if (!nextSoundOn) {
      ambientAudioRef.current?.stopSoundscape();
      return;
    }
    if (activeSession?.paused) return;
    const audio = ambientAudioRef.current?.getAmbientAudio();
    if (!audio) return;
    audio.muted = false;
    audio.volume = 0;
    audio.loop = true;
    try {
      await audio.play();
      ambientAudioRef.current?.startSoundscape();
    } catch {
      // The control remains quiet if the browser has explicitly blocked sound.
    }
  };
  const toggleFullscreen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  };

  const hokkaidoHeroReady = !isHokkaidoCabin || preparedHokkaidoImage === scene.backgroundImage;
  const hokkaidoHeroFailed = isHokkaidoCabin && failedHokkaidoImage === scene.backgroundImage;

  return (
    <main ref={stageRef} className={`scene-stage ${isHokkaidoCabin ? "scene-stage--hokkaido-cabin" : ""} ${isIcelandAuroraLodge ? "scene-stage--iceland-aurora-lodge" : ""} ${isFinlandGlassCabin ? "scene-stage--finland-glass-cabin" : ""} ${isNorwegianFjordHouse ? "scene-stage--norwegian-fjord-house" : ""} ${isTuscanySummerVilla ? "scene-stage--tuscany-summer-villa" : ""} ${isProvenceKitchen ? "scene-stage--provence-kitchen" : ""} ${isSeoulRooftopSunset ? "scene-stage--seoul-rooftop-sunset" : ""} ${isKyotoRainyCafe ? "scene-stage--kyoto-rainy-cafe" : ""} ${isSwissLakes ? "scene-stage--swiss-lakes" : ""} ${isBaliSunriseHouse ? "scene-stage--bali-sunrise-house" : ""} ${mode === "active" ? "is-active" : "is-intro"} ${entering ? "is-entering" : ""} ${leaving ? "is-leaving" : ""}`} onMouseMove={() => setControlsVisible(true)} onMouseLeave={() => setControlsVisible(false)} onFocus={() => setControlsVisible(true)}>
      <AmbientAudio ref={ambientAudioRef} sceneId={scene.id} />
      <div className="scene-viewport" aria-hidden="true"><div ref={sharedFrameRef} className="shared-scene-frame" style={sharedFrameStyle}><div className="camera-enter-leave"><div className="camera-scale"><div className="camera-drift-x"><div className="camera-drift-y"><div className={`living-scene-image ${isHokkaidoCabin ? "hokkaido-hero-image" : ""} ${hokkaidoHeroReady ? "is-ready" : "is-pending"} ${hokkaidoHeroFailed ? "has-error" : ""}`} style={hokkaidoHeroReady ? { backgroundImage: `url(${scene.backgroundImage})` } : undefined} /></div></div></div></div></div></div>
      <div className="ambient-light ambient-light-warm" aria-hidden="true" /><div className="ambient-light ambient-light-cool" aria-hidden="true" /><div className="scene-grain" aria-hidden="true" />
      {isFinlandGlassCabin && mode === "active" && <FinlandAuroraLayer />}
      {isKyotoRainyCafe && mode === "active" && <KyotoLivingLayer />}
      {isSwissLakes && mode === "active" && <SwissMistLayer />}
      {isBaliSunriseHouse && mode === "active" && <BaliMorningLayer />}
      <section className="scene-introduction-copy"><p>{scene.location}</p><h1>{scene.description}</h1><div className="scene-atmosphere"><span>{scene.time}</span><span>{scene.weather}</span></div>{scene.status === "available" ? <button className="enter-scene" disabled={entering} onClick={enter}>Enter {scene.city} <i>→</i></button> : <div className="coming-soon"><b>Coming soon</b><span>This place is still being made quiet enough to enter.</span></div>}</section>
      <button className="quiet-back" onClick={onBack}>← Back</button><p className="introduction-note">Nothing is required when you arrive.</p>
      <section className="scene-presence"><p>{scene.location}</p><span>{scene.description}</span><small>{scene.time} · {scene.weather}</small></section>
      <div className={`scene-controls ${controlsVisible ? "visible" : ""}`}><button aria-label={soundOn ? "Turn ambient sound off" : "Turn ambient sound on"} aria-pressed={soundOn} onClick={toggleSound}>{soundOn ? "Sound on" : "Sound off"}</button><SessionTimerControl session={activeSession} remainingMs={remainingMs} completed={completed} announcement={announcement} start={start} pause={pause} resume={resume} addTenMinutes={addTenMinutes} end={end} continueWithoutTimer={continueWithoutTimer} clearCompletion={clearCompletion} onLeave={leave} /><button aria-label="Toggle fullscreen" onClick={toggleFullscreen}>Fullscreen</button><button aria-label={`Leave ${scene.name}`} onClick={leave}>Leave</button></div>
      <p className="scene-exists">You can simply exist here.</p><div className="scene-transition-veil" aria-hidden="true"><span>Entering</span></div>
    </main>
  );
}

export function EmotionalEscapeApp() {
  const [path, setPath] = useState("/");
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    migrateHavenStorage();
    setStorageReady(true);
  }, []);

  useEffect(() => {
    const syncPath = () => setPath(appPath());
    syncPath();
    window.addEventListener("popstate", syncPath);
    return () => window.removeEventListener("popstate", syncPath);
  }, []);

  useEffect(() => {
    const hokkaido = sceneById(HOKKAIDO_SCENE_ID);
    if (hokkaido) void prepareHokkaidoHero(hokkaido.backgroundImage);
  }, []);

  useEffect(() => {
    if (path !== "/feelings/stillness") return;
    window.history.replaceState({}, "", "/feelings/escape");
    setPath("/feelings/escape");
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [path]);

  const go = (next: string) => {
    window.history.pushState({}, "", next);
    setPath(next);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const moodId = path.match(/^\/feelings\/([^/]+)$/)?.[1];
  const introSceneId = path.match(/^\/scene\/([^/]+)$/)?.[1];
  const experienceSceneId = path.match(/^\/scene\/([^/]+)\/experience$/)?.[1];
  const mood = moodById(moodId);
  const introScene = sceneById(introSceneId);
  const experienceScene = sceneById(experienceSceneId);
  const isYourWorld = path === "/your-world";

  if (!storageReady) return null;

  if (introScene || experienceScene) {
    const scene = experienceScene ?? introScene!;
    return <><SceneStage scene={scene} mode={experienceScene ? "active" : "intro"} onBack={() => go(`/feelings/${scene.mood}`)} onEnter={() => { if (scene.discoveryTiming !== "completion") markScenePlaceDiscovered(scene.id); go(`/scene/${scene.id}/experience`); }} onLeave={() => { if (scene.discoveryTiming === "completion") markScenePlaceDiscovered(scene.id); go(`/scene/${scene.id}`); }} /><DeveloperTools /></>;
  }

  if (isYourWorld) return <><YourWorldPage onExplore={() => go("/")} /><DeveloperTools /></>;

  if (mood) {
    return (
      <><main className="mood-collection">
        <nav className="primary-nav" aria-label="Main navigation"><button onClick={() => go("/")}>Explore</button><button onClick={() => go("/your-world")}>Your World</button></nav>
        <button className="quiet-back" onClick={() => go("/")}>← Back</button>
        <header>
          <p>{mood.prompt}.</p>
          <h1>{recommendationHeading(scenesForMood(mood.id).length)}</h1>
        </header>
        <section className="scene-poster-grid">
          {scenesForMood(mood.id).map((scene) => (
            <ScenePoster key={scene.id} scene={scene} onChoose={() => go(`/scene/${scene.id}`)} />
          ))}
        </section>
      </main><DeveloperTools /></>
    );
  }

  return (
    <><main className="escape-home">
      <nav className="primary-nav" aria-label="Main navigation"><span aria-current="page">Explore</span><button onClick={() => go("/your-world")}>Your World</button></nav>
      <section className="home-intro">
        <p className="wordmark">Haven · 栖境</p>
        <h1>How do you want<br />to feel today?</h1>
        <span>Choose a feeling. We’ll take you somewhere.</span>
      </section>
      <section className="mood-posters" aria-label="Choose a feeling">
        {moods.map((mood) => <MoodPoster key={mood.id} mood={mood} onChoose={() => go(`/feelings/${mood.id}`)} />)}
      </section>
      <p className="home-whisper">There is nothing to finish here.</p>
    </main><DeveloperTools /></>
  );
}
