import { describe, it, expect } from "vitest";
import { createBankLogos } from "../src/index";

describe("bank logos manifest overlay", () => {
  it("is not ready and has no overrides before configuration", () => {
    const bankLogos = createBankLogos();
    expect(bankLogos.hasCustomLogoAsset("101")).toBe(false);
  });

  it("applies a directly-provided manifest object without network access", async () => {
    const bankLogos = createBankLogos({
      manifest: {
        logos: {
          "101": "https://example.com/providus.svg",
          "titan-trust-bank": "https://example.com/titan-trust.svg",
        },
      },
    });
    await bankLogos.ready;

    expect(bankLogos.getBankLogo("101")).toBe("https://example.com/providus.svg");
    expect(bankLogos.getBankLogo("TITAN-TRUST-BANK")).toBe("https://example.com/titan-trust.svg");
  });

  it("accepts a JSON string manifest", async () => {
    const bankLogos = createBankLogos({
      manifest: JSON.stringify({ logos: { "058": "https://example.com/gtbank.svg" } }),
    });
    await bankLogos.ready;

    expect(bankLogos.getBankLogo("058")).toBe("https://example.com/gtbank.svg");
  });

  it("overrides getBankLogo() resolution once configured", async () => {
    // Providus Bank (101) has no bundled logo asset, so it would normally
    // resolve to the initials fallback.
    const bankLogos = createBankLogos();
    const beforeLogo = bankLogos.getBankLogo("101");
    expect(beforeLogo.startsWith("data:image/svg+xml")).toBe(true);

    await bankLogos.configureManifest({
      manifest: { logos: { "101": "https://example.com/providus.svg" } },
    });

    expect(bankLogos.getBankLogo("101")).toBe("https://example.com/providus.svg");
  });

  it("makes hasCustomLogoAsset() true once a manifest override exists", async () => {
    const bankLogos = createBankLogos();
    expect(bankLogos.hasCustomLogoAsset("101")).toBe(false);

    await bankLogos.configureManifest({
      manifest: { logos: { "101": "https://example.com/providus.svg" } },
    });

    expect(bankLogos.hasCustomLogoAsset("101")).toBe(true);
  });

  it("never throws when the manifest fetch fails, and reports the error via onError", async () => {
    let capturedError: unknown;
    const bankLogos = createBankLogos();

    await expect(
      bankLogos.configureManifest({
        manifestUrl: "https://example.com/manifest.json",
        fetchFn: async () => {
          throw new Error("network down");
        },
        onError: (err) => {
          capturedError = err;
        },
      })
    ).resolves.toBeUndefined();

    expect(capturedError).toBeInstanceOf(Error);
    expect(bankLogos.hasCustomLogoAsset("101")).toBe(false);
  });

  it("reports a clear error via onError when no fetch implementation is available", async () => {
    let capturedError: unknown;
    const bankLogos = createBankLogos();

    await bankLogos.configureManifest({
      manifestUrl: "https://example.com/manifest.json",
      onError: (err) => {
        capturedError = err;
      },
    });

    expect(String(capturedError)).toMatch(/fetchFn|manifest/i);
  });

  it("fetches and applies a manifest via a custom fetchFn", async () => {
    const bankLogos = createBankLogos();

    await bankLogos.configureManifest({
      manifestUrl: "https://example.com/manifest.json",
      fetchFn: async () => ({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ logos: { "637": "https://example.com/nova.svg" } }),
      }),
    });

    expect(bankLogos.getBankLogo("637")).toBe("https://example.com/nova.svg");
  });

  it("hydrates synchronously from cache before any network attempt", async () => {
    const bankLogos = createBankLogos();
    const cachedJson = JSON.stringify({ logos: { "105": "https://example.com/cached-premium-trust.svg" } });
    let cacheWrites = 0;

    await bankLogos.configureManifest({
      manifestUrl: "https://example.com/manifest.json",
      cache: {
        get: () => cachedJson,
        set: () => {
          cacheWrites += 1;
        },
      },
      fetchFn: async () => ({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ logos: { "105": "https://example.com/fresh-premium-trust.svg" } }),
      }),
    });

    // Cache hydrates first, then the network response overwrites it — final
    // state should reflect the freshly fetched value, and the cache should
    // have been written with that fresh value for next launch.
    expect(bankLogos.getBankLogo("105")).toBe("https://example.com/fresh-premium-trust.svg");
    expect(cacheWrites).toBe(1);
  });

  it("keeps manifest overrides isolated between independently-created instances", async () => {
    const a = createBankLogos({ manifest: { logos: { "101": "https://a.example.com/providus.svg" } } });
    const b = createBankLogos();
    await a.ready;

    expect(a.getBankLogo("101")).toBe("https://a.example.com/providus.svg");
    expect(b.hasCustomLogoAsset("101")).toBe(false);
  });
});
