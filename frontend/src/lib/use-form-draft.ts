"use client";

import * as React from "react";

export function useFormDraft<T extends object>(
  storageKey: string,
  initialValue: T,
  omit: readonly (keyof T)[] = []
) {
  const [value, setValue] = React.useState<T>(initialValue);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);

      if (stored) {
        const parsed = JSON.parse(stored) as Partial<T>;
        const next = { ...initialValue, ...parsed };

        for (const key of omit) {
          next[key] = initialValue[key];
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setValue(next);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }

    setHydrated(true);
  }, [storageKey, initialValue, omit]);

  React.useEffect(() => {
    if (!hydrated) return;

    try {
      const draft = { ...(value as Record<string, unknown>) };

      for (const key of omit) {
        delete draft[key as string];
      }

      window.localStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {
      return;
    }
  }, [hydrated, storageKey, value, omit]);

  const clearDraft = React.useCallback(() => {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      return;
    }
  }, [storageKey]);

  return [value, setValue, clearDraft] as const;
}
