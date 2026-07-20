
export { banks } from "./data/banks";

export {
  getBanks,
  getBankBySlug,
  getBankByCode,
  getBankByName,
  searchBanks,
  getBankLogo,
} from "./utils";

export {
  extractInitials,
  getBrandColor,
  generateInitialsSvg,
  generateDefaultIconSvg,
  createBankImageProps,
} from "./fallback";

export { validateNuban } from "./nuban";

export type {
  Bank,
  Banks,
  BankSlug,
  BankCode,
  BankCategory,
  LogoFormat,
  CountryCode,
  LogoOptions,
  FallbackSvgOptions,
  DefaultIconSvgOptions,
  BankImageProps,
  NubanValidationResult,
} from "./types";

export { getBanks as default } from "./utils";
