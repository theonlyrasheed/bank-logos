
export { banks } from "./data/banks";

export { createBankLogos } from "./factory";

export { extractInitials, getBrandColor } from "./fallback";

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

export type { GetBanksOptions, SearchBanksOptions } from "./utils";

export type {
  BankLogoManifest,
  ManifestFetchFn,
  ManifestCache,
  ConfigureBankLogosOptions,
} from "./manifest";

export type {
  CreateBankLogosOptions,
  BankLogosInstance,
  InitialsRenderProps,
} from "./factory";

export { createBankLogos as default } from "./factory";
