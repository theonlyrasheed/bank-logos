import type { Bank, BankImageProps, FallbackSvgOptions, LogoOptions } from "./types";

/** Known primary brand color palette for Nigerian banks */
const KNOWN_BRAND_COLORS: Record<string, string> = {
  "access-bank": "#FF6600",
  "access-bank-diamond": "#184589",
  "alat-by-wema": "#7C004B",
  "asosavings": "#0056B3",
  "citibank-nigeria": "#003B70",
  "ecobank-nigeria": "#005B82",
  "fidelity-bank": "#122A63",
  "first-bank-of-nigeria": "#002B49",
  "first-city-monument-bank": "#4B125C",
  "globus-bank": "#D91C24",
  "guaranty-trust-bank": "#E04F00",
  "heritage-bank": "#00833E",
  "keystone-bank": "#003B70",
  "kuda-bank": "#4A154B",
  "lotus-bank": "#5C1C6C",
  "moniepoint-mfb-ng": "#0052FF",
  "opay": "#00C269",
  "paga": "#FF6C00",
  "palmpay": "#6C38FF",
  "paycom": "#00C269",
  "polaris-bank": "#60266F",
  "sparkle-microfinance-bank": "#240046",
  "stanbic-ibtc-bank": "#0033A0",
  "standard-chartered-bank": "#007A33",
  "sterling-bank": "#D71920",
  "taj-bank": "#8C1D40",
  "union-bank-of-nigeria": "#0091DA",
  "united-bank-for-africa": "#D71920",
  "wema-bank": "#7C004B",
  "zenith-bank": "#E2001A",
};

/**
 * Extract up to 3 uppercase initials from a bank name
 */
export function extractInitials(name: string): string {
  if (!name || typeof name !== "string") return "NB";

  const cleanName = name
    .trim()
    .replace(/\b(limited|ltd|plc|microfinance|mfb|company|corp|inc)\b/gi, "")
    .trim();

  const words = cleanName.split(/[\s\-_]+/).filter(Boolean);

  if (words.length === 0) return "NB";
  if (words.length === 1) {
    const w = words[0].replace(/[^a-zA-Z0-9]/g, "");
    return w.slice(0, 3).toUpperCase() || "NB";
  }

  // Filter out minor words like 'of', 'for', 'by', 'and', '&'
  const mainWords = words.filter(
    (w) => !/^(of|for|by|and|&)$/i.test(w)
  );

  const targetWords = mainWords.length > 0 ? mainWords : words;
  const initials = targetWords.map((w) => w[0]).join("");

  return initials.slice(0, 3).toUpperCase();
}

/**
 * Compute a brand background hex color for a bank name or slug
 */
export function getBrandColor(nameOrSlug: string): string {
  if (!nameOrSlug) return "#1E293B";

  const slugCandidate = nameOrSlug.trim().toLowerCase().replace(/\s+/g, "-");
  if (KNOWN_BRAND_COLORS[slugCandidate]) {
    return KNOWN_BRAND_COLORS[slugCandidate];
  }

  // Hash string into a deterministic HSL color
  let hash = 0;
  for (let i = 0; i < nameOrSlug.length; i++) {
    hash = nameOrSlug.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 65%, 35%)`;
}

/**
 * Generate a vector SVG initials badge string or Data URI for a bank
 */
export function generateInitialsSvg(
  nameOrInitials: string,
  options?: FallbackSvgOptions
): string {
  const size = options?.size ?? 64;
  const text = options?.initials
    ? options.initials.toUpperCase()
    : extractInitials(nameOrInitials);

  const bgColor = options?.backgroundColor ?? getBrandColor(nameOrInitials);
  const textColor = options?.textColor ?? "#FFFFFF";
  const fontSize = text.length >= 3 ? Math.round(size * 0.35) : Math.round(size * 0.42);

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="16" fill="${bgColor}"/>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="${textColor}" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="${fontSize}">${text}</text>
  </svg>`.replace(/\s+/g, " ");

  if (options?.format === "svg-string") {
    return svgContent;
  }

  // Return standard SVG Data URI
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
}

/**
 * Create image properties with auto-recovering fallback onError handler for UI components
 */
export function createBankImageProps(
  bankOrSlug: Bank | string,
  options?: LogoOptions
): BankImageProps {
  const bankName = typeof bankOrSlug === "object" ? bankOrSlug.name : bankOrSlug;
  const bankLogo = typeof bankOrSlug === "object" ? bankOrSlug.logo : "";
  const alt = `${bankName} logo`;

  const fallbackOptions: FallbackSvgOptions = {
    format: "data-uri",
  };
  const fallbackUri = options?.fallbackUrl ?? generateInitialsSvg(bankName, fallbackOptions);
  const src = bankLogo || fallbackUri;

  return {
    src,
    alt,
    onError: (event) => {
      if (event?.currentTarget && event.currentTarget.src !== fallbackUri) {
        event.currentTarget.src = fallbackUri;
      }
    },
  };
}
