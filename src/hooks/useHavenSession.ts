"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ACTIVE_SESSION_STORAGE_KEY, HAVEN_PROGRESS_CHANGED_EVENT } from "@/data/havenStorage";

export { ACTIVE_SESSION_STORAGE_KEY } from "@/data/havenStorage";

export type ActiveSession = {
  durationMinutes: number;
  startedAt: number;
  endTime: number | null;
  paused: boolean;
  pausedRemainingMs: number | null;
  activePlaceId: string;
};

type SessionAudioActions = {
  onPauseAudio: () => void;
  onResumeAudio: () => void;
  onCompleteAudio: () => void;
  onEndAudio: () => void;
};

const isValidSession = (value: unknown): value is ActiveSession => {
  if (!value || typeof value !== "object") return false;
  const session = value as Partial<ActiveSession>;
  return typeof session.durationMinutes === "number"
    && typeof session.startedAt === "number"
    && typeof session.paused === "boolean"
    && typeof session.activePlaceId === "string"
    && (typeof session.endTime === "number" || session.endTime === null)
    && (typeof session.pausedRemainingMs === "number" || session.pausedRemainingMs === null);
};

const readStoredSession = (): ActiveSession | null => {
  if (typeof window === "undefined") return null;
  try {
    const value = JSON.parse(window.localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY) ?? "null");
    return isValidSession(value) ? value : null;
  } catch {
    return null;
  }
};

const persistSession = (session: ActiveSession | null) => {
  if (typeof window === "undefined") return;
  if (session) window.localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(session));
  else window.localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
};

const currentRemaining = (session: ActiveSession, now = Date.now()) => {
  if (session.paused) return Math.max(0, session.pausedRemainingMs ?? 0);
  return Math.max(0, (session.endTime ?? now) - now);
};

export function formatSessionTime(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const twoDigits = (value: number) => String(value).padStart(2, "0");
  return hours > 0 ? `${twoDigits(hours)}:${twoDigits(minutes)}:${twoDigits(seconds)}` : `${twoDigits(minutes)}:${twoDigits(seconds)}`;
}

export function useHavenSession(placeId: string, isPlaceActive: boolean, audio: SessionAudioActions) {
  const [session, setSession] = useState<ActiveSession | null>(() => readStoredSession());
  const [remainingMs, setRemainingMs] = useState(() => {
    const stored = readStoredSession();
    return stored ? currentRemaining(stored) : 0;
  });
  const [completed, setCompleted] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const sessionRef = useRef(session);
  const audioRef = useRef(audio);

  useEffect(() => { sessionRef.current = session; }, [session]);
  useEffect(() => { audioRef.current = audio; }, [audio]);

  useEffect(() => {
    const reloadStoredSession = () => {
      const stored = readStoredSession();
      sessionRef.current = stored;
      setSession(stored);
      setRemainingMs(stored ? currentRemaining(stored) : 0);
      if (!stored) {
        setCompleted(false);
        setAnnouncement("");
      }
    };
    window.addEventListener(HAVEN_PROGRESS_CHANGED_EVENT, reloadStoredSession);
    return () => window.removeEventListener(HAVEN_PROGRESS_CHANGED_EVENT, reloadStoredSession);
  }, []);

  const write = useCallback((next: ActiveSession | null) => {
    sessionRef.current = next;
    setSession(next);
    setRemainingMs(next ? currentRemaining(next) : 0);
    persistSession(next);
  }, []);

  const complete = useCallback(() => {
    const active = sessionRef.current;
    if (!active) return;
    write(null);
    setCompleted(true);
    setAnnouncement("Session complete");
    audioRef.current.onCompleteAudio();
  }, [write]);

  const synchronize = useCallback(() => {
    const active = sessionRef.current;
    if (!active || active.paused) return;
    const remaining = currentRemaining(active);
    if (remaining <= 0) {
      complete();
      return;
    }
    setRemainingMs(remaining);
  }, [complete]);

  useEffect(() => {
    synchronize();
    const interval = window.setInterval(synchronize, 1000);
    const onVisibility = () => { if (document.visibilityState === "visible") synchronize(); };
    window.addEventListener("focus", synchronize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", synchronize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [synchronize]);

  useEffect(() => {
    const active = sessionRef.current;
    if (!active || !isPlaceActive || active.activePlaceId === placeId) return;
    write({ ...active, activePlaceId: placeId });
  }, [isPlaceActive, placeId, write]);

  const start = useCallback((durationMinutes: number | null) => {
    setCompleted(false);
    if (durationMinutes === null) {
      write(null);
      setAnnouncement("Continuing without a timer");
      audioRef.current.onResumeAudio();
      return;
    }
    const now = Date.now();
    write({
      durationMinutes,
      startedAt: now,
      endTime: now + durationMinutes * 60_000,
      paused: false,
      pausedRemainingMs: null,
      activePlaceId: placeId,
    });
    setAnnouncement("Session started");
  }, [placeId, write]);

  const pause = useCallback(() => {
    const active = sessionRef.current;
    if (!active || active.paused) return;
    const remaining = currentRemaining(active);
    if (remaining <= 0) {
      complete();
      return;
    }
    write({ ...active, paused: true, pausedRemainingMs: remaining, endTime: null });
    setAnnouncement("Session paused");
    audioRef.current.onPauseAudio();
  }, [complete, write]);

  const resume = useCallback(() => {
    const active = sessionRef.current;
    if (!active || !active.paused) return;
    const remaining = Math.max(0, active.pausedRemainingMs ?? 0);
    if (remaining <= 0) {
      complete();
      return;
    }
    write({ ...active, paused: false, pausedRemainingMs: null, endTime: Date.now() + remaining });
    setAnnouncement("Session resumed");
    audioRef.current.onResumeAudio();
  }, [complete, write]);

  const addTenMinutes = useCallback(() => {
    const active = sessionRef.current;
    if (!active) return;
    const extra = 10 * 60_000;
    const next = active.paused
      ? { ...active, pausedRemainingMs: (active.pausedRemainingMs ?? 0) + extra }
      : { ...active, endTime: (active.endTime ?? Date.now()) + extra };
    write(next);
    setAnnouncement("Ten minutes added");
  }, [write]);

  const end = useCallback(() => {
    if (!sessionRef.current) return;
    write(null);
    setCompleted(false);
    setAnnouncement("Session ended");
    audioRef.current.onEndAudio();
  }, [write]);

  const continueWithoutTimer = useCallback(() => {
    write(null);
    setCompleted(false);
    setAnnouncement("Continuing without a timer");
    audioRef.current.onResumeAudio();
  }, [write]);

  return {
    session,
    remainingMs,
    completed,
    announcement,
    start,
    pause,
    resume,
    addTenMinutes,
    end,
    continueWithoutTimer,
    clearCompletion: () => setCompleted(false),
  };
}
