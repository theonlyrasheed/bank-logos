import { describe, it, expect } from "vitest";
import {
  createBankLogos,
  extractInitials,
  getBrandColor,
  validateNuban,
  type Bank,
} from "../src/index";
import allBanks from "../src/all_banks.json";

describe("@theonlyrasheed/bank-logos package test suite", () => {
  const bankLogos = createBankLogos();

  describe("getBanks()", () => {
    it("returns all banks from JSON", () => {
      const list = bankLogos.getBanks();
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBe(allBanks.length);
    });

    it("ensures each bank object has required fields and proper types", () => {
      const list = bankLogos.getBanks();
      for (const b of list) {
        expect(typeof b.id).toBe("string");
        expect(typeof b.name).toBe("string");
        expect(typeof b.slug).toBe("string");
        expect(typeof b.code).toBe("string");
        expect(typeof b.logo).toBe("string");
        expect(b.logo.length).toBeGreaterThan(0);
        expect(typeof b.hasCustomLogo).toBe("boolean");
        expect(b.country).toBe("NG");
        expect(b.category).toBeDefined();
      }
    });

    it("can filter by category and sort", () => {
      const commercial = bankLogos.getBanks({ category: "commercial", sortedBy: "name" });
      expect(commercial.length).toBeGreaterThan(0);
      expect(commercial.every((b) => b.category === "commercial")).toBe(true);

      // Check sorted order
      for (let i = 0; i < commercial.length - 1; i++) {
        expect(commercial[i].name.localeCompare(commercial[i + 1].name)).toBeLessThanOrEqual(0);
      }
    });
  });

  describe("Lookups & Search", () => {
    it("finds bank by code (exact and padded)", () => {
      const gt1 = bankLogos.getBankByCode("058");
      expect(gt1?.slug).toBe("gtb");

      const gt2 = bankLogos.getBankByCode("58");
      expect(gt2?.slug).toBe("gtb");
    });

    it("finds bank by slug (case-insensitive)", () => {
      const gt = bankLogos.getBankBySlug("gtb");
      expect(gt?.code).toBe("058");
    });

    it("finds bank by name", () => {
      const kuda = bankLogos.getBankByName("kuda bank");
      expect(kuda).toBeDefined();
      expect(kuda?.slug).toBe("kuda-mfb");
    });

    it("searches across name, slug, code, and USSD", () => {
      const searchFirst = bankLogos.searchBanks("first");
      expect(searchFirst.length).toBeGreaterThan(0);
      expect(searchFirst.some((b) => /first/i.test(b.name))).toBe(true);

      const searchUssd = bankLogos.searchBanks("*737#");
      expect(searchUssd.length).toBe(1);
      expect(searchUssd[0].slug).toBe("gtb");
    });
  });

  describe("Initials SVG & Fallback Engine", () => {
    it("extracts 2-3 character uppercase initials", () => {
      expect(extractInitials("Guaranty Trust Bank")).toBe("GTB");
      expect(extractInitials("First Bank of Nigeria")).toBe("FBN");
      expect(extractInitials("Kuda Bank")).toBe("KB");
      expect(extractInitials("78 Finance Company Limited")).toBe("7F");
    });

    it("generates brand color hex or hsl string", () => {
      expect(getBrandColor("gtb")).toBe("#E04F00");
      expect(getBrandColor("kuda-mfb")).toBe("#4A154B");
      expect(getBrandColor("unknown-random-bank")).toMatch(/^(#|hsl)/);
    });

    it("generates SVG initials vector string and Data URI", () => {
      const dataUri = bankLogos.generateInitialsSvg("Guaranty Trust Bank", { format: "data-uri" });
      expect(dataUri.startsWith("data:image/svg+xml;utf8,")).toBe(true);
      expect(dataUri.includes("GTB")).toBe(true);

      const rawSvg = bankLogos.generateInitialsSvg("Kuda Bank", { format: "svg-string" });
      expect(rawSvg.startsWith("<svg")).toBe(true);
      expect(rawSvg.includes("KB")).toBe(true);
    });

    it("provides automatic fallback logo for unknown bank slugs", () => {
      const logo = bankLogos.getBankLogo("unknown-bank-slug");
      expect(logo.startsWith("data:image/svg+xml;utf8,")).toBe(true);

      const defaultIconLogo = bankLogos.getBankLogo("unknown-bank-slug", { fallbackType: "default-icon" });
      expect(defaultIconLogo).toBe("https://raw.githubusercontent.com/theonlyrasheed/bank-logos/main/src/logos/default-image.svg");
    });

    it("creates bank image props with onError recovery handler", () => {
      const bank = bankLogos.getBankBySlug("gtb")!;
      const props = bankLogos.createBankImageProps(bank);

      expect(props.src).toBe(bank.logo);
      expect(props.alt).toBe("GTBank Plc logo");
      expect(typeof props.onError).toBe("function");

      // Test onError execution
      const mockEvent = { currentTarget: { src: bank.logo } };
      props.onError!(mockEvent);
      expect(mockEvent.currentTarget.src.startsWith("data:image/svg+xml;utf8,")).toBe(true);
    });
  });

  describe("createBankLogos() configuration", () => {
    it("applies customLogos overrides synchronously, no manifest/network needed", () => {
      const custom = createBankLogos({
        customLogos: { "101": "https://example.com/providus.svg" },
      });

      expect(custom.getBankLogo("101")).toBe("https://example.com/providus.svg");
      expect(custom.hasCustomLogoAsset("101")).toBe(true);
      // Default instance is unaffected — isolated per-instance state.
      expect(bankLogos.hasCustomLogoAsset("101")).toBe(false);
    });

    it("applies a custom default icon and cdnBaseUrl", () => {
      const custom = createBankLogos({
        cdnBaseUrl: "https://mycdn.com/logos",
        defaultIcon: { color: "#123456" },
      });

      const icon = custom.getBankLogo("unknown-bank-slug", { fallbackType: "default-icon" });
      expect(icon.startsWith("data:image/svg+xml;utf8,")).toBe(true);
      expect(decodeURIComponent(icon)).toContain("#123456");

      const gt = custom.getBankLogo("gtb");
      expect(gt.startsWith("https://mycdn.com/logos/")).toBe(true);
    });

    it("respects global fallbackType and useInitialsFallback settings", () => {
      const custom = createBankLogos({
        fallbackType: "default-icon",
        defaultIcon: { color: "#abcdef" },
      });

      const icon = custom.getBankLogo("unknown-bank-slug");
      expect(icon.startsWith("data:image/svg+xml;utf8,")).toBe(true);
      expect(decodeURIComponent(icon)).toContain("#abcdef");
    });

    it("supports a fully custom initials-svg renderer", () => {
      const custom = createBankLogos({
        renderInitialsSvg: ({ text }) => `<svg data-custom="true">${text}</svg>`,
      });

      const svg = custom.generateInitialsSvg("Kuda Bank", { format: "svg-string" });
      expect(svg).toBe('<svg data-custom="true">KB</svg>');
    });
  });

  describe("CBN NUBAN Validation (validateNuban)", () => {
    it("validates valid NUBAN account structure", () => {
      // 10 digits test vector: bank prefix '058' + serial '012345678' -> compute check digit
      const res = validateNuban("0123456789", "058");
      expect(res.calculatedCheckDigit).toBeDefined();
      expect(typeof res.isValid).toBe("boolean");
    });

    it("rejects non-10-digit account numbers", () => {
      const res1 = validateNuban("12345", "058");
      expect(res1.isValid).toBe(false);
      expect(res1.reason).includes("10 numeric digits");

      const res2 = validateNuban("abcdefghij", "058");
      expect(res2.isValid).toBe(false);
    });

    it("validates NUBAN check digit calculation correctly", () => {
      // Calculate known NUBAN for GTBank (058) + 000000001
      // combined: '058000000001'
      // weights: [3, 7, 3, 3, 7, 3, 3, 7, 3, 3, 7, 3]
      // 0*3 + 5*7 + 8*3 + 0*3 + 0*7 + 0*3 + 0*3 + 0*7 + 0*3 + 0*3 + 0*7 + 1*3
      // = 35 + 24 + 3 = 62.
      // remainder = 62 % 10 = 2.
      // calculated check digit = (10 - 2) % 10 = 8.
      // Account number '0000000018' with bank code '058' should be valid!
      const result = validateNuban("0000000018", "058");
      expect(result.calculatedCheckDigit).toBe(8);
      expect(result.isValid).toBe(true);
    });
  });

  describe("TypeScript Generics", () => {
    interface CustomBank extends Bank {
      customProp?: string;
    }

    it("supports CustomBank type parameters", () => {
      const customInstance = createBankLogos<CustomBank>({
        customLogos: { "gtb": "https://example.com/gtb.svg" }
      });

      const list = customInstance.getBanks();
      expect(list.length).toBeGreaterThan(0);
      
      const gtBank = customInstance.getBankByCode("058");
      expect(gtBank?.slug).toBe("gtb");
      
      // We can assign custom properties on the typed return value
      const extended: CustomBank = {
        ...gtBank!,
        customProp: "hello world"
      };
      expect(extended.customProp).toBe("hello world");
    });
  });
});
