"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { GHLLocation } from "@/lib/ghl/types";

interface SubAccountContextValue {
  locationId: string;
  setLocationId: (id: string) => void;
  locations: GHLLocation[];
  isLoading: boolean;
  currentLocation: GHLLocation | undefined;
}

const SubAccountContext = createContext<SubAccountContextValue | null>(null);

export function SubAccountProvider({
  children,
  defaultLocationId,
}: {
  children: ReactNode;
  defaultLocationId: string;
}) {
  const [locationId, setLocationIdState] = useState(defaultLocationId);
  const [locations, setLocations] = useState<GHLLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ghl/locations")
      .then((res) => res.json())
      .then((data) => {
        const locs = data.locations ?? [];
        setLocations(locs);

        // If current locationId isn't in the list but we have locations,
        // fall back to the first one
        if (locs.length > 0 && !locs.some((l: GHLLocation) => l.id === locationId)) {
          setLocationIdState(locs[0].id);
        }
      })
      .catch(() => {
        // If locations search fails, we still have the default location
        // Just stop loading
      })
      .finally(() => setIsLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function setLocationId(id: string) {
    setLocationIdState(id);
    // Persist preference
    try {
      localStorage.setItem("ghl-cc-location-id", id);
    } catch {
      // localStorage may not be available
    }
  }

  const currentLocation = locations.find((l) => l.id === locationId);

  return (
    <SubAccountContext value={{ locationId, setLocationId, locations, isLoading, currentLocation }}>
      {children}
    </SubAccountContext>
  );
}

export function useSubAccount() {
  const ctx = useContext(SubAccountContext);
  if (!ctx) {
    throw new Error("useSubAccount must be used within SubAccountProvider");
  }
  return ctx;
}
