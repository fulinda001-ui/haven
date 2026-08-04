"use client";

import { useEffect, useState } from "react";
import { places, readPlaceDiscoveries, type Place, type PlaceDiscoveries } from "@/data/destinations";

function DestinationMarker({ place, discovered, selected, onSelect }: { place: Place; discovered: boolean; selected: boolean; onSelect: () => void }) {
  const style = { left: `${place.xPercent}%`, top: `${place.yPercent}%` };

  if (!discovered) return <span className="world-marker world-marker--undiscovered" style={style} aria-hidden="true" />;

  return (
    <button
      className={`world-marker world-marker--discovered world-marker--${place.id} ${selected ? "is-selected" : ""}`}
      style={style}
      onClick={onSelect}
      aria-label={`Open ${place.name} place note`}
      aria-pressed={selected}
    >
      <span className="world-marker-dot" />
      <span className="world-marker-name">{place.mapLabel ?? place.name}</span>
    </button>
  );
}

function formatDiscoveryDate(discoveredAt: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date(discoveredAt));
}

function PlaceNotePanel({ place, discoveredAt }: { place: Place; discoveredAt: string }) {

  return (
    <aside className="place-note" aria-live="polite">
      <div key={place.id} className="place-note-content">
        <p className="place-note-eyebrow">Place Note</p>
        <h1>{place.name}</h1>
        <p className="place-note-country">{place.country}</p>
        <p className="place-note-copy">{place.note}</p>
        <div className="place-note-moment">
          <span>Current Moment</span>
          <p>{place.currentMoment}</p>
        </div>
        <div className="place-note-discovered">
          <span>Discovered</span>
          <time>{formatDiscoveryDate(discoveredAt)}</time>
        </div>
      </div>
    </aside>
  );
}

export function YourWorldPage({ onExplore }: { onExplore: () => void }) {
  const [discoveries, setDiscoveries] = useState<PlaceDiscoveries>(() => readPlaceDiscoveries());
  const [selectedId, setSelectedId] = useState(() => places.find((place) => place.isDefaultSelection)?.id ?? places[0]?.id ?? "");

  useEffect(() => {
    const syncDiscoveries = () => setDiscoveries(readPlaceDiscoveries());
    syncDiscoveries();
    window.addEventListener("focus", syncDiscoveries);
    window.addEventListener("storage", syncDiscoveries);
    return () => {
      window.removeEventListener("focus", syncDiscoveries);
      window.removeEventListener("storage", syncDiscoveries);
    };
  }, []);

  const discoveredPlaces = places.filter((place) => discoveries[place.id]);
  const selected = discoveredPlaces.find((place) => place.id === selectedId) ?? discoveredPlaces.find((place) => place.isDefaultSelection) ?? discoveredPlaces[0];

  if (!selected) return null;

  return (
    <main className="your-world-page">
      <nav className="primary-nav primary-nav--world" aria-label="Main navigation">
        <button onClick={onExplore}>Explore</button>
        <span aria-current="page">Your World</span>
      </nav>
      <header className="your-world-heading">
        <p>Haven · 栖境</p>
        <h2>Your World</h2>
        <span>Quiet places you have found.</span>
      </header>
      <section className="world-atlas" aria-label="A quiet atlas of discovered Haven places">
        <div className="world-map-wrap">
          <div className="world-map">
            <img src="/images/your_world_map_cream.png" alt="A cream-colored world map" />
            <div className="world-markers">
              {places.map((place) => (
                <DestinationMarker
                  key={place.id}
                  place={place}
                  discovered={Boolean(discoveries[place.id])}
                  selected={place.id === selected.id}
                  onSelect={() => setSelectedId(place.id)}
                />
              ))}
            </div>
          </div>
        </div>
        <PlaceNotePanel place={selected} discoveredAt={discoveries[selected.id]} />
      </section>
    </main>
  );
}
