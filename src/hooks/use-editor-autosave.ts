"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseEditorAutosaveOptions {
  enabled: boolean;
  hasChanges: boolean;
  snapshotKey: string;
  savedKey: string | null;
  isSaving: boolean;
  onAutoSave: () => Promise<boolean>;
}

/**
 * Coordinates debounced autosave without mutating `lastSaved` prematurely.
 * Prevents tight retry loops when a snapshot fails while still allowing
 * new edits or manual saves to persist.
 */
export function useEditorAutosave({
  enabled,
  hasChanges,
  snapshotKey,
  savedKey,
  isSaving,
  onAutoSave,
}: UseEditorAutosaveOptions) {
  const [saveError, setSaveError] = useState<string | null>(null);
  const onAutoSaveRef = useRef(onAutoSave);
  onAutoSaveRef.current = onAutoSave;

  const inFlightRef = useRef(false);
  const attemptedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (savedKey !== null && snapshotKey === savedKey) {
      attemptedKeyRef.current = null;
      setSaveError(null);
    }
  }, [snapshotKey, savedKey]);

  useEffect(() => {
    if (!enabled || !hasChanges || savedKey === null) return;
    if (isSaving || inFlightRef.current) return;
    if (attemptedKeyRef.current === snapshotKey) return;

    attemptedKeyRef.current = snapshotKey;
    inFlightRef.current = true;

    void onAutoSaveRef
      .current()
      .then((ok) => {
        if (ok) {
          setSaveError(null);
          attemptedKeyRef.current = null;
        }
      })
      .catch(() => {
        // Error banner state is populated inside the save callback.
      })
      .finally(() => {
        inFlightRef.current = false;
      });
  }, [enabled, hasChanges, snapshotKey, savedKey, isSaving]);

  const resetAutoSaveAttempt = useCallback(() => {
    attemptedKeyRef.current = null;
  }, []);

  return {
    saveError,
    setSaveError,
    resetAutoSaveAttempt,
  };
}
