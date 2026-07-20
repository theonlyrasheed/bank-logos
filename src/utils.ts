import type { Bank, BankCategory, BankCode, BankSlug, Banks, CountryCode, LogoOptions } from "./types";
import { banks } from "./data/banks";
import { generateInitialsSvg } from "./fallback";
import { LOGO_FILES } from "./data/generated-logos";

export interface GetBanksOptions {
  /** Filter by bank category (e.g. 'commercial', 'microfinance', 'fintech') */
  category?: BankCategory;
  /** Filter by country code (default 'NG') */
  country?: CountryCode;
  /** Sort order field */
  sortedBy?: "name" | "code" | "slug";
}

/**
 * Returns an immutable list of all supported banks
 */
export function getBanks(options?: GetBanksOptions): Banks {
  let result = [...banks];

  if (options?.country) {
    const targetCountry = options.country.trim().toUpperCase();
    result = result.filter((b) => b.country.toUpperCase() === targetCountry);
  }

  if (options?.category) {
    result = result.filter((b) => b.category === options.category);
  }

  if (options?.sortedBy) {
    const key = options.sortedBy;
    result.sort((a, b) => a[key].localeCompare(b[key]));
  }

  return Object.freeze(result);
}

/**
 * Find a bank by its URL-friendly slug (case-insensitive)
 *
 * @example
 * const gt = getBankBySlug("guaranty-trust-bank");
 */
export function getBankBySlug(slug: BankSlug | string): Bank | undefined {
  if (!slug || typeof slug !== "string") return undefined;
  const s = slug.trim().toLowerCase();
  return banks.find((b) => b.slug.toLowerCase() === s);
}

/**
 * Find a bank by its NUBAN bank code (handles leading zeros, e.g. "058" or "58")
 *
 * @example
 * const gt = getBankByCode("058");
 */
export function getBankByCode(code: BankCode | string): Bank | undefined {
  if (!code || typeof code !== "string") return undefined;
  const targetCode = code.trim();
  if (!targetCode) return undefined;

  // Direct code match
  const directMatch = banks.find((b) => b.code === targetCode);
  if (directMatch) return directMatch;

  // Numeric padded match (e.g. "58" matching "058")
  const numericTarget = parseInt(targetCode, 10);
  if (!isNaN(numericTarget)) {
    return banks.find((b) => parseInt(b.code, 10) === numericTarget);
  }

  return undefined;
}

/**
 * Find a bank by its official name or common name (case-insensitive)
 *
 * @example
 * const gt = getBankByName("Guaranty Trust Bank");
 */
export function getBankByName(name: string): Bank | undefined {
  if (!name || typeof name !== "string") return undefined;
  const cleanName = name.trim().toLowerCase();
  if (!cleanName) return undefined;

  // Exact match
  const exact = banks.find((b) => b.name.toLowerCase() === cleanName);
  if (exact) return exact;

  // Partial or normalized name match
  return banks.find((b) => {
    const bankLower = b.name.toLowerCase();
    if (bankLower.includes(cleanName) || cleanName.includes(bankLower)) {
      return true;
    }
    const cleanBankStem = bankLower.replace(/\b(bank|microfinance|mfb|limited|ltd|plc)\b/g, "").trim();
    const cleanQueryStem = cleanName.replace(/\b(bank|microfinance|mfb|limited|ltd|plc)\b/g, "").trim();
    return cleanBankStem.length > 0 && cleanBankStem === cleanQueryStem;
  });
}

export interface SearchBanksOptions {
  /** Maximum number of results to return */
  limit?: number;
  /** Filter results by category */
  category?: BankCategory;
}

/**
 * Performs search across bank names, slugs, bank codes, and USSD codes
 *
 * @example
 * const results = searchBanks("kuda");
 */
export function searchBanks(
  query: string,
  options?: SearchBanksOptions
): Banks {
  const q = query ? query.trim().toLowerCase() : "";

  let filtered = [...banks];

  if (options?.category) {
    filtered = filtered.filter((b) => b.category === options.category);
  }

  if (!q) {
    if (options?.limit && options.limit > 0) {
      return Object.freeze(filtered.slice(0, options.limit));
    }
    return Object.freeze(filtered);
  }

  const results = filtered.filter((b) => {
    const nameMatch = b.name.toLowerCase().includes(q);
    const slugMatch = b.slug.toLowerCase().includes(q);
    const codeMatch = b.code.includes(q);
    const ussdMatch = b.ussd ? b.ussd.includes(q) : false;
    return nameMatch || slugMatch || codeMatch || ussdMatch;
  });

  if (options?.limit && options.limit > 0) {
    return Object.freeze(results.slice(0, options.limit));
  }

  return Object.freeze(results);
}

/**
 * Resolves logo URL or dynamic SVG Initials Data URI for a bank or bank slug/code
 *
 * @example
 * const logoUrl = getBankLogo("guaranty-trust-bank");
 */
export function getBankLogo(
  identifier: Bank | BankSlug | BankCode | string,
  options?: LogoOptions
): string {
  let bank: Bank | undefined;

  if (typeof identifier === "object" && identifier !== null && "slug" in identifier) {
    bank = identifier;
  } else if (typeof identifier === "string") {
    bank = getBankBySlug(identifier) || getBankByCode(identifier) || getBankByName(identifier);
  }

  const bankName = bank ? bank.name : String(identifier);
  const slug = bank ? bank.slug : String(identifier).trim().toLowerCase();
  const customFile = LOGO_FILES[slug];

  if (customFile) {
    const baseUrl = options?.cdnBaseUrl ??
      "https://raw.githubusercontent.com/theonlyrasheed/bank-logos/main/src/logos";
    return `${baseUrl}/${customFile}`;
  }

  if (options?.fallbackUrl) {
    return options.fallbackUrl;
  }

  // Generate dynamic Initials SVG badge by default
  return generateInitialsSvg(bankName, {
    format: "data-uri",
  });
}

export type { Bank, Banks, BankSlug, BankCode, BankCategory, LogoFormat, CountryCode, LogoOptions } from "./types";
