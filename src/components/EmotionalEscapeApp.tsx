"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { moods, moodById, sceneById, scenesForMood, type Mood, type Scene } from "@/data/scenes";
import { AmbientAudio, type AmbientAudioHandle } from "./AmbientAudio";

const appPath = () => window.location.pathname;

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
  return (
    <article className="scene-poster">
      <img src={scene.coverImage} alt={`${scene.name}, ${scene.location}`} />
      <div className="scene-poster-copy">
        <p>{scene.location}</p>
        <h2>{scene.name}</h2>
        <span>{scene.description}</span>
        <button onClick={onChoose}>
          {scene.status === "available" ? "Enter scene" : "View scene"} <i>→</i>
        </button>
      </div>
    </article>
  );
}

function SceneStage({ scene, mode, onBack, onEnter, onLeave }: { scene: Scene; mode: "intro" | "active"; onBack: () => void; onEnter: () => void; onLeave: () => void }) {
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
    <main ref={stageRef} className={`scene-stage ${mode === "active" ? "is-active" : "is-intro"} ${entering ? "is-entering" : ""} ${leaving ? "is-leaving" : ""}`} onMouseMove={() => setControlsVisible(true)} onMouseLeave={() => setControlsVisible(false)} onFocus={() => setControlsVisible(true)}>
      <AmbientAudio ref={ambientAudioRef} sceneId={scene.id} />
      <div className="scene-viewport" aria-hidden="true"><div ref={sharedFrameRef} className="shared-scene-frame" style={sharedFrameStyle}><div className="camera-enter-leave"><div className="camera-scale"><div className="camera-drift-x"><div className="camera-drift-y"><div className="living-scene-image" style={{ backgroundImage: `url(${scene.backgroundImage})` }} /></div></div></div></div></div></div>
      <div className="ambient-light ambient-light-warm" aria-hidden="true" /><div className="ambient-light ambient-light-cool" aria-hidden="true" /><div className="scene-grain" aria-hidden="true" />
      <section className="scene-introduction-copy"><p>{scene.location}</p><h1>{scene.description}</h1><div className="scene-atmosphere"><span>{scene.time}</span><span>{scene.weather}</span></div>{scene.status === "available" ? <button className="enter-scene" disabled={entering} onClick={enter}>Enter Hokkaido <i>→</i></button> : <div className="coming-soon"><b>Coming soon</b><span>This place is still being made quiet enough to enter.</span></div>}</section>
      <button className="quiet-back" onClick={onBack}>← Back</button><p className="introduction-note">Nothing is required when you arrive.</p>
      <section className="scene-presence"><p>{scene.location}</p><span>{scene.description}</span><small>{scene.time} · {scene.weather}</small></section>
      <div className={`scene-controls ${controlsVisible ? "visible" : ""}`}><button aria-label={soundOn ? "Turn ambient sound off" : "Turn ambient sound on"} aria-pressed={soundOn} onClick={toggleSound}>{soundOn ? "Sound on" : "Sound off"}</button><button aria-label="Toggle fullscreen" onClick={toggleFullscreen}>Fullscreen</button><button aria-label="Leave Hokkaido Cabin" onClick={leave}>Leave</button></div>
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
