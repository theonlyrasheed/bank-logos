import type { Bank, BankImageProps, DefaultIconSvgOptions, FallbackSvgOptions, LogoOptions } from "./types";

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


export function extractInitials(name: string): string {
  const MAX_NUM = 3

  if (!name || typeof name !== "string") return "NB";

  const cleanName = name
    .trim()
    .replace(/\b(limited|ltd|plc|microfinance|mfb|company|corp|inc)\b/gi, "")
    .trim();

  const words = cleanName.split(/[\s\-_]+/).filter(Boolean);

  if (words.length === 0) return "NB";
  if (words.length === 1) {
    const w = words[0].replace(/[^a-zA-Z0-9]/g, "");
    return w.slice(0, MAX_NUM).toUpperCase() || "NB";
  }

  // Filter out minor words like 'of', 'for', 'by', 'and', '&'
  const mainWords = words.filter(
    (w) => !/^(of|for|by|and|&)$/i.test(w)
  );

  const targetWords = mainWords.length > 0 ? mainWords : words;
  const initials = targetWords.map((w) => w[0]).join("");

  return initials.slice(0, MAX_NUM).toUpperCase();
}


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
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="${textColor}" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="${fontSize}">${text}</text>
  </svg>`.replace(/\s+/g, " ");

  if (options?.format === "svg-string") {
    return svgContent;
  }

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
}

/**
 * Generate the vector default bank icon (mirrors default-image.svg) as an SVG string or Data URI,
 * with an editable stroke color, size, and stroke width
 */
export function generateDefaultIconSvg(options?: DefaultIconSvgOptions): string {
  const size = options?.size ?? 64;
  const color = options?.color ?? "#00AE99";
  const strokeWidth = options?.strokeWidth ?? 1;
  const stroke = `stroke="${color}" stroke-width="${strokeWidth}" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"`;

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 16 16" fill="none">
    <path d="M8.24664 1.43331L14.2466 3.83329C14.48 3.92663 14.6666 4.20662 14.6666 4.45329V6.66663C14.6666 7.03329 14.3666 7.33329 14 7.33329H1.99998C1.63331 7.33329 1.33331 7.03329 1.33331 6.66663V4.45329C1.33331 4.20662 1.51998 3.92663 1.75332 3.83329L7.75332 1.43331C7.88665 1.37998 8.11331 1.37998 8.24664 1.43331Z" ${stroke}/>
    <path d="M14.6666 14.6667H1.33331V12.6667C1.33331 12.3 1.63331 12 1.99998 12H14C14.3666 12 14.6666 12.3 14.6666 12.6667V14.6667Z" ${stroke}/>
    <path d="M2.66669 12V7.33337" ${stroke}/>
    <path d="M5.33331 12V7.33337" ${stroke}/>
    <path d="M8 12V7.33337" ${stroke}/>
    <path d="M10.6667 12V7.33337" ${stroke}/>
    <path d="M13.3333 12V7.33337" ${stroke}/>
    <path d="M0.666687 14.6666H15.3334" ${stroke}/>
    <path d="M8 5.66663C8.55228 5.66663 9 5.21891 9 4.66663C9 4.11434 8.55228 3.66663 8 3.66663C7.44772 3.66663 7 4.11434 7 4.66663C7 5.21891 7.44772 5.66663 8 5.66663Z" ${stroke}/>
  </svg>`.replace(/\s+/g, " ");

  if (options?.format === "svg-string") {
    return svgContent;
  }

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
