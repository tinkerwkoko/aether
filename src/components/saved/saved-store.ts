"use client";

/**
 * Saved-items store.
 *
 * The set of saved product ids is loaded once with the browser client, which RLS
 * already limits to the owner. Toggling goes through a server action, so the
 * write is authorised server-side. A signed-out visitor gets an empty set and
 * never a fake "saved" state.
 *
 * Like the cart store, this is an external store read through
 * useSyncExternalStore, so no setState runs inside an effect body.
 */

import { useSyncExternalStore } from "react";

import { toggleSaved } from "@/lib/auth-actions";
import { getSavedProductIds } from "@/lib/saved-ids";

export type SavedSnapshot = {
  ids: ReadonlySet<string>;
  loaded: boolean;
};

/*
 * React requires getSnapshot and getServerSnapshot to return stable references.
 * Both therefore return a module-level object that is only replaced when the
 * saved data genuinely changes, and neither ever builds a value on the way out.
 */
const EMPTY_SAVED_SNAPSHOT: SavedSnapshot = {
  ids: new Set<string>(),
  loaded: false,
};

let snapshot: SavedSnapshot = EMPTY_SAVED_SNAPSHOT;
const listeners = new Set<() => void>();

function publish(next: SavedSnapshot) {
  snapshot = next;
  for (const listener of listeners) listener();
}

/** Called by the provider once, after mount, when we know the sign-in state. */
export function loadSavedIds(signedIn: boolean) {
  if (snapshot.loaded) return;

  if (!signedIn) {
    publish({ ids: new Set(), loaded: true });
    return;
  }

  void getSavedProductIds()
    .then((ids) => publish({ ids: new Set(ids), loaded: true }))
    .catch(() => publish({ ids: new Set(), loaded: true }));
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Stable: always the same reference until the data changes. */
function getSnapshot(): SavedSnapshot {
  return snapshot;
}

/** Stable: one module-level constant, created once. */
function getServerSnapshot(): SavedSnapshot {
  return EMPTY_SAVED_SNAPSHOT;
}

export function useSavedSnapshot(): SavedSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Adds or removes an item through the server action, then updates the store. */
export async function toggleSavedItem(productId: string): Promise<"saved" | "removed"> {
  const result = await toggleSaved(productId);
  const ids = new Set(snapshot.ids);

  if (result === "saved") {
    ids.add(productId);
  } else {
    ids.delete(productId);
  }

  publish({ ids, loaded: true });
  return result;
}