"use client";

import { useEffect, useState } from "react";
import {
  type AllProviderKeys,
  PROVIDER_INFO,
  type ProviderName,
  getProviderHeaders,
  loadProviderKeys,
  routeProvider,
} from "./providers";

interface ProviderKeysState {
  keys: AllProviderKeys;
  headers: Record<string, string>;
  hasKey: boolean;
  /** Name of the active provider for the "chat" task, or null */
  activeProvider: { provider: ProviderName; label: string } | null;
}

/**
 * Shared hook that reads provider API keys from localStorage
 * (the same store used by the /settings page).
 * Re-reads on mount and on storage events (cross-tab sync).
 */
export function useProviderKeys(): ProviderKeysState {
  const [keys, setKeys] = useState<AllProviderKeys>(() => loadProviderKeys());

  useEffect(() => {
    // Re-read in case SSR default was used
    setKeys(loadProviderKeys());

    // Listen for cross-tab changes
    const onStorage = (e: StorageEvent) => {
      if (e.key === "suryaprajna_provider_keys" || e.key === null) {
        setKeys(loadProviderKeys());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const headers = getProviderHeaders(keys);

  const hasKey = !!(
    keys.anthropicKey ||
    keys.openaiKey ||
    keys.perplexityKey ||
    keys.openrouterKey ||
    keys.deepseekKey ||
    keys.groqKey
  );

  const routed = routeProvider("chat", keys);
  const activeProvider = routed
    ? { provider: routed.provider, label: PROVIDER_INFO[routed.provider].label }
    : null;

  return { keys, headers, hasKey, activeProvider };
}
