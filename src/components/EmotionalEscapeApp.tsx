"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { moods, moodById, sceneById, scenesForMood, type Mood, type Scene } from "@/data/scenes";
import { AmbientAudio, type AmbientAudioHandle } from "./AmbientAudio";

const appPath = () => window.location.pathname;
type KyotoStyle = CSSProperties & Record<`--${string}`, string>;

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
  const chooseWithKeyboard = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onChoose();
    }
  };

  return (
    <article className="scene-poster" role="link" tabIndex={0} onClick={onChoose} onKeyDown={chooseWithKeyboard} aria-label={`Enter ${scene.name}`}>
      <img src={scene.coverImage} alt={`${scene.name}, ${scene.location}`} />
      <div className="scene-poster-copy">
        <p>{scene.location}</p>
        <h2>{scene.name}</h2>
        <span>{scene.description}</span>
        <span className="scene-poster-link" aria-hidden="true">
          {scene.status === "available" ? "Enter scene" : "View scene"} <i>→</i>
        </span>
      </div>
    </article>
  );
}

function SceneStage({ scene, mode, onBack, onEnter, onLeave }: { scene: Scene; mode: "intro" | "active"; onBack: () => void; onEnter: () => void; onLeave: () => void }) {
  const isKyotoRainyCafe = scene.id === "kyoto-rainy-cafe";
  const [entering, setEntering] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [sharedFrameStyle, setSharedFrameStyle] = useState<CSSProperties | undefined>();
  const stageRef = useRef<HTMLElement>(null);
  const sharedFrameRef = useRef<HTMLDivElement>(null);
  const ambientAudioRef = useRef<AmbientAudioHandle>(null);

  useEffect(() => { if (mode === "intro") setLeaving(false); }, [mode]);

  const enter = async () => {
    if (entering) return;

    // The first playback request remains inside this actual user click, before
    // any navigation, visual transition, timer, or state change occurs.
    const audio = ambientAudioRef.current?.getAmbientAudio();
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

  return (
    <main ref={stageRef} className={`scene-stage ${isKyotoRainyCafe ? "scene-stage--kyoto-rainy-cafe" : ""} ${mode === "active" ? "is-active" : "is-intro"} ${entering ? "is-entering" : ""} ${leaving ? "is-leaving" : ""}`} onMouseMove={() => setControlsVisible(true)} onMouseLeave={() => setControlsVisible(false)} onFocus={() => setControlsVisible(true)}>
      <AmbientAudio ref={ambientAudioRef} sceneId={scene.id} />
      <div className="scene-viewport" aria-hidden="true"><div ref={sharedFrameRef} className="shared-scene-frame" style={sharedFrameStyle}><div className="camera-enter-leave"><div className="camera-scale"><div className="camera-drift-x"><div className="camera-drift-y"><div className="living-scene-image" style={{ backgroundImage: `url(${scene.backgroundImage})` }} /></div></div></div></div></div></div>
      <div className="ambient-light ambient-light-warm" aria-hidden="true" /><div className="ambient-light ambient-light-cool" aria-hidden="true" /><div className="scene-grain" aria-hidden="true" />
      {isKyotoRainyCafe && mode === "active" && <KyotoLivingLayer />}
      <section className="scene-introduction-copy"><p>{scene.location}</p><h1>{scene.description}</h1><div className="scene-atmosphere"><span>{scene.time}</span><span>{scene.weather}</span></div>{scene.status === "available" ? <button className="enter-scene" disabled={entering} onClick={enter}>Enter {scene.city} <i>→</i></button> : <div className="coming-soon"><b>Coming soon</b><span>This place is still being made quiet enough to enter.</span></div>}</section>
      <button className="quiet-back" onClick={onBack}>← Back</button><p className="introduction-note">Nothing is required when you arrive.</p>
      <section className="scene-presence"><p>{scene.location}</p><span>{scene.description}</span><small>{scene.time} · {scene.weather}</small></section>
      <div className={`scene-controls ${controlsVisible ? "visible" : ""}`}><button aria-label={soundOn ? "Turn ambient sound off" : "Turn ambient sound on"} aria-pressed={soundOn} onClick={toggleSound}>{soundOn ? "Sound on" : "Sound off"}</button><button aria-label="Toggle fullscreen" onClick={toggleFullscreen}>Fullscreen</button><button aria-label={`Leave ${scene.name}`} onClick={leave}>Leave</button></div>
      <p className="scene-exists">You can simply exist here.</p><div className="scene-transition-veil" aria-hidden="true"><span>Entering</span></div>
    </main>
  );
}

export function EmotionalEscapeApp() {
  const [path, setPath] = useState("/");

  useEffect(() => {
    const syncPath = () => setPath(appPath());
    syncPath();
    window.addEventListener("popstate", syncPath);
    return () => window.removeEventListener("popstate", syncPath);
  }, []);

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

  if (introScene || experienceScene) {
    const scene = experienceScene ?? introScene!;
    return <SceneStage scene={scene} mode={experienceScene ? "active" : "intro"} onBack={() => go(`/feelings/${scene.mood}`)} onEnter={() => go(`/scene/${scene.id}/experience`)} onLeave={() => go(`/scene/${scene.id}`)} />;
  }

  if (mood) {
    return (
      <main className="mood-collection">
        <button className="quiet-back" onClick={() => go("/")}>← Back</button>
        <header>
          <p>{mood.prompt}.</p>
          <h1>Three places are waiting for you.</h1>
        </header>
        <section className="scene-poster-grid">
          {scenesForMood(mood.id).map((scene) => (
            <ScenePoster key={scene.id} scene={scene} onChoose={() => go(`/scene/${scene.id}`)} />
          ))}
        </section>
      </main>
    );
  }

  return (
    <main className="escape-home">
      <section className="home-intro">
        <p className="wordmark">Haven · 栖境</p>
        <h1>How do you want<br />to feel today?</h1>
        <span>Choose a feeling. We’ll take you somewhere.</span>
      </section>
      <section className="mood-posters" aria-label="Choose a feeling">
        {moods.map((mood) => <MoodPoster key={mood.id} mood={mood} onChoose={() => go(`/feelings/${mood.id}`)} />)}
      </section>
      <p className="home-whisper">There is nothing to finish here.</p>
    </main>
  );
}
