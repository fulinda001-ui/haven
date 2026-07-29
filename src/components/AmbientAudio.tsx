"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

type AmbientAudioProps = { sceneId: string };
type LayerName = "birds" | "breeze";
type Players = { base: HTMLAudioElement; birds: HTMLAudioElement; breeze: HTMLAudioElement };

export type AmbientAudioHandle = {
  getAmbientAudio: () => HTMLAudioElement | null;
  startSoundscape: () => void;
  stopSoundscape: () => void;
};

const AUDIO = {
  base: "/scenes/hokkaido-cabin/audio/ambient.mp3",
  birds: "/scenes/hokkaido-cabin/audio/mixkit-forest-birds-ambience-1210.wav",
  breeze: "/scenes/hokkaido-cabin/audio/dbsound-light-breeze-through-cabin-slats-327161.mp3",
} as const;

const randomBetween = (minimum: number, maximum: number) => minimum + Math.random() * (maximum - minimum);

class HokkaidoSoundscape {
  private players: Players | null = null;
  private timers = new Set<ReturnType<typeof setTimeout>>();
  private fadeFrames = new Map<HTMLAudioElement, number>();
  private running = false;

  private createPlayer(source: string, loop = false) {
    const audio = new Audio();
    audio.src = source;
    audio.preload = "auto";
    audio.loop = loop;
    audio.muted = false;
    audio.volume = 0;
    audio.setAttribute("aria-hidden", "true");
    audio.style.display = "none";
    document.body.append(audio);
    audio.load();
    return audio;
  }

  ensure() {
    if (!this.players) {
      this.players = {
        base: this.createPlayer(AUDIO.base, true),
        birds: this.createPlayer(AUDIO.birds),
        breeze: this.createPlayer(AUDIO.breeze),
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
    this.schedule(() => {
      if (!this.running || !this.players) return;
      const audio = layer === "birds" ? this.players.birds : this.players.breeze;
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

  stopSoundscape() {
    if (!this.players) return;
    this.running = false;
    this.clearTimers();
    const layers = [this.players.base, this.players.birds, this.players.breeze];
    layers.forEach((audio) => {
      this.fade(audio, 0, 2800, () => this.reset(audio));
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

export const AmbientAudio = forwardRef<AmbientAudioHandle, AmbientAudioProps>(function AmbientAudio({ sceneId }, ref) {
  const soundscapeRef = useRef<HokkaidoSoundscape | null>(null);
  if (!soundscapeRef.current) soundscapeRef.current = new HokkaidoSoundscape();
  const soundscape = soundscapeRef.current;

  useEffect(() => () => soundscape.destroy(), [soundscape]);

  useImperativeHandle(ref, () => ({
    getAmbientAudio: () => (sceneId === "hokkaido-forest-cabin" ? soundscape.getAmbientAudio() : null),
    startSoundscape: () => { if (sceneId === "hokkaido-forest-cabin") soundscape.startSoundscape(); },
    stopSoundscape: () => soundscape.stopSoundscape(),
  }), [sceneId, soundscape]);

  return null;
});
