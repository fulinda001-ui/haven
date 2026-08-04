"use client";

import { useState } from "react";
import { clearHavenProgress } from "@/data/havenStorage";

export function DeveloperTools() {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  if (process.env.NODE_ENV !== "development") return null;

  const resetDiscoveries = () => {
    clearHavenProgress();
    setIsConfirmingReset(false);
    setIsOpen(false);
  };

  return (
    <aside className="dev-tools" aria-label="Developer tools">
      {isOpen && (
        <div className="dev-tools-panel" role="dialog" aria-label="Developer tools">
          {isConfirmingReset ? (
            <div className="dev-tools-confirm">
              <p>Reset all discovered Places?</p>
              <div>
                <button onClick={() => setIsConfirmingReset(false)}>Cancel</button>
                <button className="dev-tools-reset" onClick={resetDiscoveries}>Reset</button>
              </div>
            </div>
          ) : (
            <div className="dev-tools-actions">
              <button onClick={() => setIsConfirmingReset(true)}>Reset Discoveries</button>
            </div>
          )}
        </div>
      )}
      <button className="dev-tools-toggle" aria-expanded={isOpen} onClick={() => { setIsOpen((open) => !open); setIsConfirmingReset(false); }}>
        Dev
      </button>
    </aside>
  );
}
