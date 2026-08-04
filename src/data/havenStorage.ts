export const HAVEN_STORAGE_VERSION_KEY = "haven.storageVersion";
export const HAVEN_STORAGE_VERSION = "2";

export const DISCOVERED_DESTINATIONS_KEY = "haven.discoveredPlaces";
export const ACTIVE_SESSION_STORAGE_KEY = "haven.activeSession";

// These names cover the current progress stores plus the legacy-compatible
// progress shapes required by the migration contract. Preferences such as
// audio or theme are intentionally not included.
export const HAVEN_PROGRESS_STORAGE_KEYS = [
  DISCOVERED_DESTINATIONS_KEY,
  ACTIVE_SESSION_STORAGE_KEY,
  "haven.completedPlaces",
  "haven.visitedPlaces",
  "haven.unlockedSpots",
  "haven.completionDates",
  "haven.sceneProgress",
  "haven.yourWorld",
  "haven.discoveries",
  "haven.unlockedPlaces",
  "haven.completedDestinations",
  "haven.visitedDestinations",
  "haven.worldState",
  "haven.currentPlace",
  "haven.currentMoment",
] as const;

export const HAVEN_PROGRESS_CHANGED_EVENT = "haven:progress-changed";

const notifyProgressChanged = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(HAVEN_PROGRESS_CHANGED_EVENT));
};

/**
 * Clears only Haven user progress. The schema marker is deliberately kept so
 * a manual reset does not cause the startup migration to repeat on refresh.
 */
export function clearHavenProgress() {
  if (typeof window === "undefined") return false;
  try {
    for (const key of HAVEN_PROGRESS_STORAGE_KEYS) {
      window.localStorage.removeItem(key);
    }
    window.localStorage.setItem(HAVEN_STORAGE_VERSION_KEY, HAVEN_STORAGE_VERSION);
    return true;
  } catch {
    return false;
  } finally {
    notifyProgressChanged();
  }
}

/** Runs once per browser whenever Haven intentionally increments its schema. */
export function migrateHavenStorage() {
  if (typeof window === "undefined") return false;
  try {
    if (window.localStorage.getItem(HAVEN_STORAGE_VERSION_KEY) === HAVEN_STORAGE_VERSION) return false;
    return clearHavenProgress();
  } catch {
    return false;
  }
}
