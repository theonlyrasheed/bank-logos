import type { Bank, BankCategory, Banks, LogoFormat } from "../types";
import allBanks from "../all_banks.json";
import { LOGO_FILES, LOGO_FORMATS } from "./generated-logos";
import { generateInitialsSvg } from "../fallback";

const RAW_BASE =
  "https://raw.githubusercontent.com/theonlyrasheed/bank-logos/main/src/logos";

function inferCategory(name: string): BankCategory {
  const lower = name.toLowerCase();
  if (lower.includes("microfinance") || lower.includes("mfb")) return "microfinance";
  if (lower.includes("mortgage") || lower.includes("savings")) return "mortgage";
  if (
    lower.includes("payment") ||
    lower.includes("palmpay") ||
    lower.includes("paga") ||
    lower.includes("paycom") ||
    lower.includes("opay") ||
    lower.includes("kuda") ||
    lower.includes("moniepoint") ||
    lower.includes("finance")
  ) {
    return "fintech";
  }
  if (lower.includes("taj") || lower.includes("lotus") || lower.includes("jaiz")) {
    return "non-interest";
  }
  return "commercial";
}

function createBankRecord(raw: any): Bank {
  const id = String(raw.id);
  const name = String(raw.name).trim();
  const slug = String(raw.slug).trim();
  const code = String(raw.code).trim();
  const ussd =
    typeof raw.ussd === "string" && raw.ussd.trim().length > 0
      ? raw.ussd.trim()
      : undefined;

  const file = LOGO_FILES[slug];
  const format = LOGO_FORMATS[slug];

  const hasCustomLogo = Boolean(file && format);
  const logoFormat: LogoFormat = hasCustomLogo ? format : "fallback";

  const logo = hasCustomLogo
    ? `${RAW_BASE}/${file}`
    : generateInitialsSvg(name, { format: "data-uri" });

  return {
    id,
    name,
    slug,
    code,
    ussd,
    logo,
    logoFormat,
    hasCustomLogo,
    country: "NG",
    category: inferCategory(name),
  };
}

export const banks: Banks = Object.freeze(
  allBanks.map((item: any) => createBankRecord(item))
);
