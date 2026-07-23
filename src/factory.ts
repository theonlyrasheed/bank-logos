import type {
  Bank,
  BankCode,
  BankImageProps,
  BankSlug,
  Banks,
  DefaultIconSvgOptions,
  FallbackSvgOptions,
  LogoOptions,
} from "./types";
import {
  getBankByCode,
  getBankByName,
  getBankBySlug,
  getBanks,
  searchBanks,
  type GetBanksOptions,
  type SearchBanksOptions,
} from "./utils";
import {
  defaultInitialsSvgMarkup,
  extractInitials,
  generateDefaultIconSvg as renderDefaultIconSvg,
  getBrandColor,
} from "./fallback";
import { LOGO_FILES } from "./data/generated-logos";
import { createManifestStore, type ConfigureBankLogosOptions } from "./manifest";

const DEFAULT_CDN_BASE_URL = "https://raw.githubusercontent.com/theonlyrasheed/bank-logos/main/src/logos";

/** Props handed to a custom initials-badge renderer (see CreateBankLogosOptions.renderInitialsSvg) */
export interface InitialsRenderProps {
  text: string;
  size: number;
  backgroundColor: string;
  textColor: string;
}

export interface CreateBankLogosOptions extends ConfigureBankLogosOptions {
  /** Base URL used to resolve bundled logo asset filenames (default: this package's GitHub raw CDN) */
  cdnBaseUrl?: string;
  /** Default styling applied whenever the vector fallback icon is generated */
  defaultIcon?: DefaultIconSvgOptions;
  /** Default styling applied whenever an initials badge is generated (per-call options still win) */
  initialsOptions?: Omit<FallbackSvgOptions, "format">;
  /** Default fallback behavior when a custom logo is unavailable ('initials' or 'default-icon') */
  fallbackType?: "initials" | "default-icon";
  /** If false, uses the generic vector building icon as fallback instead of initials */
  useInitialsFallback?: boolean;
  /** Synchronous local overrides — your own SVG string, PNG/SVG URL, or data-uri — keyed by bank code or slug (case-insensitive) */
  customLogos?: Record<string, string>;
  /** Fully replace how the initials badge SVG markup is rendered */
  renderInitialsSvg?: (props: InitialsRenderProps) => string;
  // `manifestUrl` / `manifest` / `fetchFn` / `cache` / `onError` (inherited from
  // ConfigureBankLogosOptions) configure a remote manifest overlay immediately
  // at creation time — see `ready`.
}

export interface BankLogosInstance<T extends Bank = Bank> {
  /** Immutable snapshot of all bundled banks (same as getBanks() with no filters) */
  readonly banks: readonly T[];
  /** Resolves once the initial manifest (if configured) has finished loading — never rejects */
  readonly ready: Promise<void>;

  getBanks(options?: GetBanksOptions): readonly T[];
  getBankBySlug(slug: BankSlug | string): T | undefined;
  getBankByCode(code: BankCode | string): T | undefined;
  getBankByName(name: string): T | undefined;
  searchBanks(query: string, options?: SearchBanksOptions): readonly T[];

  /** Resolves logo URL or dynamic SVG Initials Data URI for a bank or bank slug/code */
  getBankLogo(identifier: T | BankSlug | BankCode | string, options?: LogoOptions): string;
  /** True when a dedicated logo exists — bundled, custom, or manifest-provided — rather than falling back to initials */
  hasCustomLogoAsset(identifier: T | BankSlug | BankCode | string): boolean;

  generateInitialsSvg(nameOrInitials: string, options?: FallbackSvgOptions): string;
  generateDefaultIconSvg(options?: DefaultIconSvgOptions): string;
  createBankImageProps(bankOrSlug: T | string, options?: LogoOptions): BankImageProps;

  /** Load/replace the remote manifest overlay for this instance */
  configureManifest(options: ConfigureBankLogosOptions): Promise<void>;
}

function normalizeLogoMap(input: Record<string, string> | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(input ?? {})) {
    if (key && value) result[key.trim().toLowerCase()] = value;
  }
  return result;
}

/**
 * Creates a configured bank-logos instance. Config (default icon styling,
 * custom logo overrides, a remote manifest overlay) is set once here instead
 * of being repeated on every lookup call.
 *
 * @example
 * const bankLogos = createBankLogos({
 *   defaultIcon: { color: "#00AE99" },
 *   customLogos: { "101": "https://mycdn.com/providus.svg" },
 * });
 * bankLogos.getBankLogo("058");
 */
export function createBankLogos<T extends Bank = Bank>(options: CreateBankLogosOptions = {}): BankLogosInstance<T> {
  const manifestStore = createManifestStore();
  const customLogos = normalizeLogoMap(options.customLogos);
  const cdnBaseUrl = options.cdnBaseUrl ?? DEFAULT_CDN_BASE_URL;

  function resolveBank(identifier: Bank | string): Bank | undefined {
    if (typeof identifier === "object" && identifier !== null && "slug" in identifier) {
      return identifier;
    }
    if (typeof identifier === "string") {
      return getBankBySlug(identifier) || getBankByCode(identifier) || getBankByName(identifier);
    }
    return undefined;
  }

  function lookupKeys(identifier: Bank | string, bank: Bank | undefined): Array<string | undefined> {
    return [
      bank?.slug,
      bank?.code,
      typeof identifier === "string" ? identifier : undefined,
    ];
  }

  function findCustomLogo(keys: Array<string | undefined>): string | undefined {
    for (const key of keys) {
      if (!key) continue;
      const hit = customLogos[key.trim().toLowerCase()];
      if (hit) return hit;
    }
    return undefined;
  }

  function generateInitialsSvg(nameOrInitials: string, callOptions?: FallbackSvgOptions): string {
    const merged: FallbackSvgOptions = { ...options.initialsOptions, ...callOptions };
    const size = merged.size ?? 64;
    const text = merged.initials ? merged.initials.toUpperCase() : extractInitials(nameOrInitials);
    const backgroundColor = merged.backgroundColor ?? getBrandColor(nameOrInitials);
    const textColor = merged.textColor ?? "#FFFFFF";

    const render = options.renderInitialsSvg ?? defaultInitialsSvgMarkup;
    const svgContent = render({ text, size, backgroundColor, textColor });

    if (merged.format === "svg-string") {
      return svgContent;
    }
    return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
  }

  function generateDefaultIconSvg(callOptions?: DefaultIconSvgOptions): string {
    return renderDefaultIconSvg({ ...options.defaultIcon, ...callOptions });
  }

  function getBankLogo(identifier: Bank | BankSlug | BankCode | string, callOptions?: LogoOptions): string {
    const bank = resolveBank(identifier);
    const bankName = bank ? bank.name : String(identifier);
    const slug = bank ? bank.slug : String(identifier).trim().toLowerCase();
    const keys = lookupKeys(identifier, bank);

    const customLogo = findCustomLogo(keys);
    if (customLogo) return customLogo;

    // Manifest overrides (see configureManifest) take precedence over the
    // bundled asset, so a rebrand or new logo can ship without a new release.
    const manifestLogo = manifestStore.getOverride(...keys);
    if (manifestLogo) return manifestLogo;

    const customFile = LOGO_FILES[slug];
    const baseUrl = callOptions?.cdnBaseUrl ?? cdnBaseUrl;

    if (customFile) {
      return `${baseUrl}/${customFile}`;
    }

    if (callOptions?.fallbackUrl) {
      return callOptions.fallbackUrl;
    }

    const fallbackType = callOptions?.fallbackType ?? options.fallbackType ?? "initials";
    const useInitials = callOptions?.useInitialsFallback ?? options.useInitialsFallback ?? true;

    if (fallbackType === "default-icon" || useInitials === false) {
      if (callOptions?.defaultIconOptions || options.defaultIcon) {
        return generateDefaultIconSvg({ format: "data-uri", ...callOptions?.defaultIconOptions });
      }
      return `${baseUrl}/default-image.svg`;
    }

    return generateInitialsSvg(bankName, { format: "data-uri" });
  }

  function hasCustomLogoAsset(identifier: Bank | BankSlug | BankCode | string): boolean {
    const bank = resolveBank(identifier);
    const slug = bank ? bank.slug : String(identifier).trim().toLowerCase();
    const keys = lookupKeys(identifier, bank);

    if (findCustomLogo(keys)) return true;
    if (manifestStore.getOverride(...keys)) return true;
    return Boolean(LOGO_FILES[slug]) || Boolean(bank?.hasCustomLogo);
  }

  function createBankImageProps(bankOrSlug: Bank | string, callOptions?: LogoOptions): BankImageProps {
    const bank = resolveBank(bankOrSlug);
    const bankName = bank ? bank.name : typeof bankOrSlug === "string" ? bankOrSlug : "";
    const src = getBankLogo(bankOrSlug, callOptions);
    const fallbackType = callOptions?.fallbackType ?? options.fallbackType ?? "initials";
    const useInitials = callOptions?.useInitialsFallback ?? options.useInitialsFallback ?? true;

    let fallbackUri = callOptions?.fallbackUrl;
    if (!fallbackUri) {
      if (fallbackType === "default-icon" || useInitials === false) {
        if (callOptions?.defaultIconOptions || options.defaultIcon) {
          fallbackUri = generateDefaultIconSvg({ format: "data-uri", ...callOptions?.defaultIconOptions });
        } else {
          fallbackUri = `${callOptions?.cdnBaseUrl ?? cdnBaseUrl}/default-image.svg`;
        }
      } else {
        fallbackUri = generateInitialsSvg(bankName, { format: "data-uri" });
      }
    }

    return {
      src,
      alt: `${bankName} logo`,
      onError: (event) => {
        if (event?.currentTarget && event.currentTarget.src !== fallbackUri) {
          event.currentTarget.src = fallbackUri;
        }
      },
    };
  }

  async function configureManifest(manifestOptions: ConfigureBankLogosOptions): Promise<void> {
    await manifestStore.configure(manifestOptions);
  }

  const ready = (options.manifestUrl || options.manifest) ? configureManifest(options) : Promise.resolve();

  return {
    banks: getBanks() as readonly T[],
    ready,
    getBanks: (opts?: GetBanksOptions) => getBanks(opts) as readonly T[],
    getBankBySlug: (slug: string) => getBankBySlug(slug) as T | undefined,
    getBankByCode: (code: string) => getBankByCode(code) as T | undefined,
    getBankByName: (name: string) => getBankByName(name) as T | undefined,
    searchBanks: (query: string, opts?: SearchBanksOptions) => searchBanks(query, opts) as readonly T[],
    getBankLogo: (identifier: T | BankSlug | BankCode | string, opts?: LogoOptions) => getBankLogo(identifier as Bank | string, opts),
    hasCustomLogoAsset: (identifier: T | BankSlug | BankCode | string) => hasCustomLogoAsset(identifier as Bank | string),
    generateInitialsSvg,
    generateDefaultIconSvg,
    createBankImageProps: (bankOrSlug: T | string, opts?: LogoOptions) => createBankImageProps(bankOrSlug as Bank | string, opts),
    configureManifest,
  };
}
