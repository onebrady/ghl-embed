"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Building2,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  KeyRound,
  RefreshCw,
} from "lucide-react";

interface LocationConfig {
  id: string;
  location_id: string;
  location_name: string;
  private_integration_token: string; // masked
  is_active: boolean;
  created_at: string;
}

export default function SettingsPage() {
  const [locations, setLocations] = useState<LocationConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchLocations = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/locations");
      const data = await res.json();
      setLocations(data.locations ?? []);
    } catch {
      toast.error("Failed to load locations");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage GHL sub-account connections and API keys.
        </p>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium">Connected Locations</h2>
            <p className="text-sm text-muted-foreground">
              Each GHL sub-account needs its own Private Integration Token.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Location
          </button>
        </div>

        {showAddForm && (
          <AddLocationForm
            onSuccess={() => {
              setShowAddForm(false);
              fetchLocations();
            }}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading locations...
          </div>
        ) : locations.length === 0 ? (
          <EmptyState onAdd={() => setShowAddForm(true)} />
        ) : (
          <div className="space-y-3">
            {locations.map((loc) => (
              <LocationCard
                key={loc.id}
                location={loc}
                onDelete={() => fetchLocations()}
                onUpdate={() => fetchLocations()}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-12 rounded-lg border border-dashed p-6">
        <h2 className="text-lg font-medium mb-2">GHL Custom Menu Link</h2>
        <p className="text-sm text-muted-foreground mb-4">
          To embed this app inside GoHighLevel, add a Custom Menu Link in each
          sub-account with this URL:
        </p>
        <code className="block rounded-md bg-muted px-4 py-3 text-sm font-mono break-all">
          {typeof window !== "undefined"
            ? `${window.location.origin}?locationId={{location.id}}`
            : "https://your-domain.com?locationId={{location.id}}"}
        </code>
        <p className="mt-3 text-xs text-muted-foreground">
          GHL replaces <code className="text-xs">{"{{location.id}}"}</code> with
          the actual sub-account ID automatically.
        </p>
      </section>
    </div>
  );
}

// ─── Add Location Form ───

function AddLocationForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [locationId, setLocationId] = useState("");
  const [locationName, setLocationName] = useState("");
  const [token, setToken] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/settings/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location_id: locationId.trim(),
          location_name: locationName.trim(),
          private_integration_token: token.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to add location");
        return;
      }

      toast.success("Location added successfully");
      onSuccess();
    } catch {
      toast.error("Failed to add location");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-lg border bg-card p-5 space-y-4"
    >
      <h3 className="font-medium text-sm">Add GHL Sub-Account</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Location ID
          </label>
          <input
            type="text"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            placeholder="e.g. EDt6rFwrnuaIw8POiYM2"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Found in GHL Settings &gt; Business Info &gt; Location ID
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Location Name
          </label>
          <input
            type="text"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="e.g. ResultReach"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">
          Private Integration Token
        </label>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="pit-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          required
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Generate in GHL Settings &gt; Integrations &gt; Private Integrations
        </p>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {isSaving ? "Validating & Saving..." : "Save Location"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Location Card ───

function LocationCard({
  location,
  onDelete,
  onUpdate,
}: {
  location: LocationConfig;
  onDelete: () => void;
  onUpdate: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [newToken, setNewToken] = useState("");
  const [showRotate, setShowRotate] = useState(false);

  async function handleDelete() {
    if (!confirm(`Remove "${location.location_name}" from Command Center?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/settings/locations/${location.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to delete");
        return;
      }

      toast.success("Location removed");
      onDelete();
    } catch {
      toast.error("Failed to delete location");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleRotateToken(e: React.FormEvent) {
    e.preventDefault();
    if (!newToken.trim()) return;

    setIsRotating(true);
    try {
      const res = await fetch(`/api/settings/locations/${location.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ private_integration_token: newToken.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to update token");
        return;
      }

      toast.success("Token updated");
      setNewToken("");
      setShowRotate(false);
      onUpdate();
    } catch {
      toast.error("Failed to update token");
    } finally {
      setIsRotating(false);
    }
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-md bg-muted p-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">
                {location.location_name}
              </span>
              {location.is_active ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
                  <XCircle className="h-3 w-3" />
                  Inactive
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              {location.location_id}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <KeyRound className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-mono">
                {location.private_integration_token}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowRotate(!showRotate)}
            className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Rotate token"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-md p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
            title="Remove location"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showRotate && (
        <form
          onSubmit={handleRotateToken}
          className="mt-3 flex items-center gap-2 border-t pt-3"
        >
          <input
            type="password"
            value={newToken}
            onChange={(e) => setNewToken(e.target.value)}
            placeholder="New Private Integration Token"
            className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            required
          />
          <button
            type="submit"
            disabled={isRotating}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isRotating ? "Saving..." : "Update"}
          </button>
        </form>
      )}
    </div>
  );
}

// ─── Empty State ───

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center">
      <Building2 className="mx-auto h-10 w-10 text-muted-foreground/50" />
      <h3 className="mt-3 text-sm font-medium">No locations configured</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Connect a GHL sub-account to get started.
      </p>
      <button
        onClick={onAdd}
        className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Your First Location
      </button>
    </div>
  );
}
