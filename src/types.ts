import type { GeneratedBankSlug, GeneratedBankCode } from "./data/generated-logos";

/**
 * Image format of bank logos
 */
export type LogoFormat = 'svg' | 'png' | 'webp' | 'jpeg' | 'fallback';

/**
 * ISO 3166-1 alpha-2 country code (e.g. 'NG', 'GH', 'KE', 'ZA')
 */
export type CountryCode = 'NG' | 'GH' | 'KE' | 'ZA' | string;

/**
 * Categorization of financial institutions
 */
export type BankCategory =
  | 'commercial'
  | 'microfinance'
  | 'mortgage'
  | 'fintech'
  | 'non-interest'
  | 'other';

/**
 * Strongly-typed bank slug identifier (e.g. 'guaranty-trust-bank', 'kuda-bank')
 */
export type BankSlug = GeneratedBankSlug | (string & {});

/**
 * Strongly-typed NUBAN bank code (e.g. '058', '033', '50211')
 */
export type BankCode = GeneratedBankCode | (string & {});

/**
 * Representation of a financial institution / bank
 */
export interface Bank {
  /** Unique bank identifier string */
  readonly id: string;
  /** Official full bank name (e.g. "Guaranty Trust Bank") */
  readonly name: string;
  /** URL-friendly bank slug (e.g. "guaranty-trust-bank") */
  readonly slug: BankSlug;
  /** Official NUBAN bank code (e.g. "058") */
  readonly code: BankCode;
  /** USSD quick code for mobile banking (e.g. "*737#") */
  readonly ussd?: string;
  /** Resolved CDN or fallback logo URL */
  readonly logo: string;
  /** Image format of the bank logo */
  readonly logoFormat: LogoFormat;
  /** True if a dedicated custom logo asset (SVG or PNG) exists for this bank */
  readonly hasCustomLogo: boolean;
  /** ISO 2-letter country code for the bank (default 'NG') */
  readonly country: CountryCode;
  /** NIBSS bank code (if applicable) */
  readonly nibss_bank_code?: string;
  /** Classification of the bank institution */
  readonly category?: BankCategory;
}

/**
 * Immutable array of bank objects
 */
export type Banks = readonly Bank[];

/**
 * Custom options for logo URL resolution
 */
export interface LogoOptions {
  /** Format preference: 'svg' | 'png' | 'data-uri' */
  format?: "svg" | "png" | "data-uri";
  /** Custom CDN base URL override */
  cdnBaseUrl?: string;
  /** Custom fallback image URL or Data URI */
  fallbackUrl?: string;
  /** Fallback icon style preference: 'initials-svg' (dynamic initials badge) | 'default-icon' (vector bank icon URL) */
  fallbackType?: "initials-svg" | "default-icon";
  /** If true, returns dynamic SVG Initials Data URI when logo is missing (default true) */
  useInitialsFallback?: boolean;
  /** Customize color/size/stroke-width when fallbackType is 'default-icon'. Generates an inline SVG Data URI instead of the static CDN file */
  defaultIconOptions?: DefaultIconSvgOptions;
}

/**
 * Options for generating inline SVG Initials badges
 */
export interface FallbackSvgOptions {
  /** Square size in pixels (default 64) */
  size?: number;
  /** Hex or RGB background color (default calculated from bank name) */
  backgroundColor?: string;
  /** Text color (default '#FFFFFF') */
  textColor?: string;
  /** Custom initials override (e.g. "GTB", "FBN") */
  initials?: string;
  /** Output format: 'data-uri' | 'svg-string' (default 'data-uri') */
  format?: 'data-uri' | 'svg-string';
}

/**
 * Options for generating the inline vector default bank icon (mirrors default-image.svg)
 */
export interface DefaultIconSvgOptions {
  /** Square size in pixels (default 64) */
  size?: number;
  /** Hex, RGB, or named stroke color (default '#00AE99') */
  color?: string;
  /** Stroke width of the icon strokes (default 1) */
  strokeWidth?: number;
  /** Output format: 'data-uri' | 'svg-string' (default 'data-uri') */
  format?: 'data-uri' | 'svg-string';
}

/**
 * Props returned for HTML / React / Vue <img> elements with auto-fallback error handling
 */
export interface BankImageProps {
  /** Image source URL or Data URI */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Event listener to automatically handle broken image loads */
  onError?: (event: { currentTarget: { src: string } }) => void;
}

/**
 * Result of NUBAN account number validation
 */
export interface NubanValidationResult {
  /** True if the 10-digit NUBAN account number passes the CBN checksum */
  isValid: boolean;
  /** Error explanation if validation failed */
  reason?: string;
  /** Calculated NUBAN check digit (0-9) */
  calculatedCheckDigit?: number;
  /** Provided 10th digit from the account number */
  expectedCheckDigit?: number;
}
