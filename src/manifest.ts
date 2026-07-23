/**
 * Optional runtime overlay for bank logos: lets consumers point at a small,
 * independently-editable JSON manifest (own CDN, gist, jsDelivr, etc.) so a
 * missing/rebranded logo can be fixed by editing that file instead of
 * cutting a new package release. The bundled dataset + initials fallback
 * always work with zero configuration; this is a freshness bonus layer that
 * never blocks or throws on failure.
 *
 * State lives per createBankLogos() instance (see factory.ts) rather than
 * as a module-level global, so independently-configured instances (or
 * parallel tests) don't leak overrides into each other.
 */

/**
 * Shape of the remote manifest JSON. `logos` maps a bank code or slug
 * (case-insensitive) to a logo URL that overrides the bundled asset.
 */
export interface BankLogoManifest {
  updatedAt?: string;
  logos: Record<string, string>;
}

/**
 * Minimal fetch-like contract so environments without a global `fetch`
 * (e.g. WeChat Mini Program / uni-app, which use `uni.request`) can supply
 * their own implementation.
 */
export type ManifestFetchFn = (url: string) => Promise<{
  ok: boolean;
  status: number;
  text: () => Promise<string> | string;
}>;

/**
 * Pluggable persistent cache so the last-known manifest survives app
 * restarts and is available synchronously before the network responds.
 */
export interface ManifestCache {
  get: () => string | null | Promise<string | null>;
  set: (value: string) => void | Promise<void>;
}

export interface ConfigureBankLogosOptions {
  /** URL to fetch the manifest JSON from (e.g. a jsDelivr/gh-raw/CDN link) */
  manifestUrl?: string;
  /** Custom fetch implementation, required where global `fetch` isn't available */
  fetchFn?: ManifestFetchFn;
  /** Already-fetched manifest (JSON string or parsed object) — skips the internal fetch entirely */
  manifest?: BankLogoManifest | string;
  /** Persistent cache read/write hooks (e.g. wrapping `uni.getStorageSync`/`uni.setStorageSync`) */
  cache?: ManifestCache;
  /** Called when fetching/parsing fails; bundled data + initials fallback are used regardless */
  onError?: (error: unknown) => void;
}

export interface ManifestStore {
  configure(options: ConfigureBankLogosOptions): Promise<void>;
  getOverride(...keys: Array<string | undefined>): string | undefined;
  isReady(): boolean;
  clear(): void;
}

/**
 * Creates an isolated manifest override store. Each createBankLogos()
 * instance owns one of these, so overrides never leak between instances.
 */
export function createManifestStore(): ManifestStore {
  let overrides: Record<string, string> = {};
  let ready = false;

  function applyManifest(input: BankLogoManifest | string): void {
    const parsed: BankLogoManifest = typeof input === "string" ? JSON.parse(input) : input;
    const logos = parsed?.logos ?? {};
    const next: Record<string, string> = {};

    for (const [key, url] of Object.entries(logos)) {
      if (typeof url === "string" && url.trim() && typeof key === "string" && key.trim()) {
        next[key.trim().toLowerCase()] = url.trim();
      }
    }

    overrides = next;
    ready = true;
  }

  return {
    async configure(options: ConfigureBankLogosOptions): Promise<void> {
      if (options.cache) {
        try {
          const cached = await options.cache.get();
          if (cached) applyManifest(cached);
        } catch (err) {
          options.onError?.(err);
        }
      }

      if (options.manifest) {
        try {
          applyManifest(options.manifest);
          if (options.cache) {
            const json = typeof options.manifest === "string" ? options.manifest : JSON.stringify(options.manifest);
            await options.cache.set(json);
          }
        } catch (err) {
          options.onError?.(err);
        }
        return;
      }

      if (!options.manifestUrl) return;

      try {
        const fetchImpl = options.fetchFn ?? (globalThis as { fetch?: typeof fetch }).fetch;
        if (!fetchImpl) {
          throw new Error(
            "No fetch implementation available. Pass `fetchFn` or a pre-fetched `manifest` " +
            "(e.g. via uni.request in a Mini Program/uni-app context)."
          );
        }

        const res = await fetchImpl(options.manifestUrl);
        if (!res.ok) throw new Error(`Failed to fetch bank logo manifest: HTTP ${res.status}`);

        const text = await res.text();
        applyManifest(text);

        if (options.cache) await options.cache.set(text);
      } catch (err) {
        options.onError?.(err);
      }
    },

    getOverride(...keys: Array<string | undefined>): string | undefined {
      for (const key of keys) {
        if (!key) continue;
        const hit = overrides[key.trim().toLowerCase()];
        if (hit) return hit;
      }
      return undefined;
    },

    isReady(): boolean {
      return ready;
    },

    clear(): void {
      overrides = {};
      ready = false;
    },
  };
}
