"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import type { GHLLocation } from "@/lib/ghl/types";

interface SubAccountContextValue {
  locationId: string;
  setLocationId: (id: string) => void;
  locations: GHLLocation[];
  isLoading: boolean;
  currentLocation: GHLLocation | undefined;
  /** True when locationId was provided via URL query param (GHL iframe) */
  isEmbedded: boolean;
}

const SubAccountContext = createContext<SubAccountContextValue | null>(null);

export function SubAccountProvider({
  children,
  defaultLocationId,
}: {
  children: ReactNode;
  defaultLocationId: string;
}) {
  const searchParams = useSearchParams();
  const urlLocationId = searchParams.get("locationId");
  const isEmbedded = !!urlLocationId;

  // Priority: URL param > localStorage > env default
  const initialLocationId =
    urlLocationId ||
    (typeof window !== "undefined"
      ? localStorage.getItem("ghl-cc-location-id")
      : null) ||
    defaultLocationId;

  const [locationId, setLocationIdState] = useState(initialLocationId);
  const [locations, setLocations] = useState<GHLLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // If URL param changes (e.g. user switches sub-account in GHL), update
  useEffect(() => {
    if (urlLocationId && urlLocationId !== locationId) {
      setLocationIdState(urlLocationId);
    }
  }, [urlLocationId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // When embedded via GHL iframe, we already have the locationId
    // and don't need to fetch all locations for the switcher.
    // Just fetch the current location name for display.
    if (isEmbedded) {
      fetch(`/api/ghl/locations?locationId=${locationId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.location) {
            setLocations([data.location]);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
      return;
    }

    // Standalone mode: fetch all locations for the switcher
    fetch("/api/ghl/locations")
      .then((res) => res.json())
      .then((data) => {
        const locs = data.locations ?? [];
        setLocations(locs);

        if (locs.length > 0 && !locs.some((l: GHLLocation) => l.id === locationId)) {
          setLocationIdState(locs[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [locationId, isEmbedded]);

  function setLocationId(id: string) {
    setLocationIdState(id);
    try {
      localStorage.setItem("ghl-cc-location-id", id);
    } catch {
      // localStorage may not be available
    }
  }

  const currentLocation = locations.find((l) => l.id === locationId);

  return (
    <SubAccountContext value={{ locationId, setLocationId, locations, isLoading, currentLocation, isEmbedded }}>
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
