# @theonlyrasheed/bank-logos

[![npm version](https://img.shields.io/npm/v/@theonlyrasheed/bank-logos.svg?style=flat-square)](https://www.npmjs.com/package/@theonlyrasheed/bank-logos)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![CI Status](https://img.shields.io/github/actions/workflow/status/theonlyrasheed/bank-logos/ci.yml?branch=main&style=flat-square)](https://github.com/theonlyrasheed/bank-logos/actions)

> Typed list of Nigerian and international banks with **SVG & PNG vector logos**, **dynamic Initials SVG fallbacks**, **CBN NUBAN account validation**, and **multi-field search utilities** for Node.js, Web, React, Vue, and UniApp.

---

## Features

- 🏦 **Comprehensive Bank Dataset**: Includes commercial banks, microfinance banks (MFBs), fintechs, mortgage banks, and non-interest banks with codes, slugs, names, and USSD quick codes.
- 🎨 **Multi-Format Logos (SVG & PNG)**: Supports high-resolution SVG vector logos alongside PNG assets.
- 🔤 **Dynamic Initials SVG Fallbacks**: Automatic zero-dependency SVG vector initials avatar generator (`GTB`, `FBN`, `KB`, etc.) for missing logos or broken image links.
- 🖼️ **UI Component Ready**: `createBankImageProps()` provides `{ src, alt, onError }` for React, Vue, UniApp, Svelte, and HTML `<img>` elements with instant error recovery.
- ⚙️ **Configurable, Single Entry Point**: `createBankLogos(options)` returns a bound instance — set your default icon styling, custom CDN, and your own logo assets once, instead of repeating options on every call.
- 🗂️ **Bring Your Own Logos**: Override any bank's logo synchronously with `customLogos` (your own SVG string, PNG/SVG URL, or data-uri) — no waiting on a package release.
- 🌐 **Optional Remote Manifest Overlay**: Point at a small JSON manifest (your own CDN, gist, jsDelivr) to patch/refresh logos without a new release or app rebuild. Never blocks — falls back to the bundled dataset + initials on any failure.
- 🔢 **CBN NUBAN Validation**: Official 10-digit Central Bank of Nigeria account number checksum algorithm verification.
- 🌍 **Multi-Country Extensible**: Built with country namespaces (`'NG'`, `'GH'`, `'KE'`, `'ZA'`) ready for global expansion.
- 🔒 **Strict TypeScript Types**: Fully typed with `interface` contracts, auto-generated literal string unions for bank slugs and codes, and full JSDoc IDE autocomplete.

---

## Installation

Using **pnpm** (recommended):
```bash
pnpm add @theonlyrasheed/bank-logos
```

Using **npm**:
```bash
npm install @theonlyrasheed/bank-logos
```

Using **yarn**:
```bash
yarn add @theonlyrasheed/bank-logos
```

---

## Quick Start

Everything is accessed through a single factory call. With no options it works fully offline, zero config:

```ts
import { createBankLogos } from "@theonlyrasheed/bank-logos";

const bankLogos = createBankLogos();

const gtBank = bankLogos.getBankByCode("058");
console.log(gtBank?.name); // "Guaranty Trust Bank"

const logoUrl = bankLogos.getBankLogo("058");
```

Create it once (e.g. in a module or app bootstrap file) and reuse the same instance everywhere.

---

## Usage Guide

### 1. Retrieve & Filter Banks

```ts
import { createBankLogos } from "@theonlyrasheed/bank-logos";

const bankLogos = createBankLogos();

// Get all banks
const allBanks = bankLogos.getBanks();

// Filter commercial banks sorted by name
const commercialBanks = bankLogos.getBanks({ category: "commercial", sortedBy: "name" });

// Find bank by 3-digit or 6-digit NUBAN code (handles padded "058" or "58")
const gtBank = bankLogos.getBankByCode("058");
console.log(gtBank?.name); // "Guaranty Trust Bank"

// Find bank by slug
const kuda = bankLogos.getBankBySlug("kuda-microfinance-bank");
console.log(kuda?.code); // "50211"
```

---

### 2. Search Banks

```ts
// Search across name, slug, bank code, and USSD code
const results = bankLogos.searchBanks("first");
// Matches "First Bank of Nigeria", "First City Monument Bank", etc.

// Search USSD code
const gtUssd = bankLogos.searchBanks("*737#");
```

---

### 3. Logo URLs & Fallbacks

`getBankLogo` accepts a bank object, slug, or **bank code** (e.g. `"058"`, `"50211"`). If a custom logo isn't available for the bank code, it automatically generates a vector **Initials SVG Data URI**:

```ts
// 1. Pass bank code directly (e.g. "058" for GTBank, "50211" for Kuda)
// Automatically returns logo URL, or Initials SVG Data URI if logo is unavailable
const logoUrlByCode = bankLogos.getBankLogo("058");

// 2. Check if a bank has a dedicated custom logo — bundled, customLogos, or manifest-provided
const bank = bankLogos.getBankByCode("058");

if (bankLogos.hasCustomLogoAsset(bank ?? "058")) {
  console.log("Custom logo URL:", bankLogos.getBankLogo(bank ?? "058"));
} else {
  // Generate dynamic SVG Initials fallback badge
  const fallbackBadge = bankLogos.generateInitialsSvg(bank ? bank.name : "Unknown Bank", {
    format: "data-uri", // 'data-uri' or 'svg-string'
    size: 64,
  });
  console.log("Fallback SVG Data URI:", fallbackBadge);
}

// 3. Using default-image.svg (Vector Bank Icon) as Fallback
// Pass fallbackType: "default-icon" or useInitialsFallback: false to use default-image.svg
const defaultIconUrl = bankLogos.getBankLogo("unknown-bank-code", {
  fallbackType: "default-icon", // Returns CDN URL for default-image.svg
});

// 3b. Customize the default icon's color/size instead of using the static CDN file
// Passing defaultIconOptions generates an inline, editable SVG Data URI
const customDefaultIconUrl = bankLogos.getBankLogo("unknown-bank-code", {
  fallbackType: "default-icon",
  defaultIconOptions: {
    color: "#FF6600",   // stroke color (default '#00AE99')
    size: 48,            // default 64
    strokeWidth: 1.5,    // default 1
  },
});

// Or generate it directly
const iconSvgString = bankLogos.generateDefaultIconSvg({
  color: "#1E293B",
  size: 32,
  format: "svg-string", // 'data-uri' or 'svg-string'
});
```

---

### 4. Customizing Logos & Icons

Configure defaults once at creation instead of repeating options on every call. Everything below is optional:

```ts
const bankLogos = createBankLogos({
  // Custom host for the bundled SVG/PNG assets
  cdnBaseUrl: "https://mycdn.com/logos",

  // Default styling for the generic fallback icon (getBankLogo({ fallbackType: "default-icon" }))
  defaultIcon: { color: "#00AE99", strokeWidth: 1.5 },

  // Default styling for the initials badge (per-call options still win)
  initialsOptions: { size: 48, textColor: "#FFFFFF" },

  // Bring your own logos — SVG string, PNG/SVG URL, or data-uri — keyed by bank code or slug
  customLogos: {
    "101": "https://mycdn.com/providus-bank.svg",
    "titan-trust-bank": "<svg>...</svg>",
  },

  // Fully replace how the initials badge SVG markup is rendered
  renderInitialsSvg: ({ text, size, backgroundColor, textColor }) =>
    `<svg width="${size}" height="${size}"><circle r="${size / 2}" fill="${backgroundColor}"/><text fill="${textColor}">${text}</text></svg>`,
});
```

---

### 5. Remote Manifest Overlay (Optional)

If you want logo fixes to ship without a new package release or app rebuild, point at a small JSON manifest. It's a freshness *bonus* layer — the bundled dataset and initials fallback always work if this fails or is never configured.

The manifest is just `{ "logos": { "<bank code or slug>": "<logo url>" } }`, e.g.:

```json
{ "logos": { "101": "https://mycdn.com/providus-bank.svg" } }
```

Configure it at creation time:

```ts
const bankLogos = createBankLogos({
  manifestUrl: "https://cdn.jsdelivr.net/gh/theonlyrasheed/bank-logos@main/manifest.json",
});

await bankLogos.ready; // resolves once the initial load has been attempted — never rejects
```

Or reconfigure/refresh it later:

```ts
await bankLogos.configureManifest({ manifestUrl: "..." });
```

Environments without a global `fetch` (e.g. **WeChat Mini Program / uni-app**) can supply their own request implementation, or hand off an already-fetched manifest directly:

```ts
// Option A: custom fetch implementation
const bankLogos = createBankLogos({
  manifestUrl: "https://mycdn.com/manifest.json",
  fetchFn: (url) =>
    new Promise((resolve, reject) => {
      uni.request({
        url,
        success: (res) => resolve({ ok: res.statusCode === 200, status: res.statusCode, text: () => JSON.stringify(res.data) }),
        fail: reject,
      });
    }),
});

// Option B: fetch it yourself, hand off the parsed result
uni.request({
  url: "https://mycdn.com/manifest.json",
  success: (res) => bankLogos.configureManifest({ manifest: res.data }),
});
```

Persist the last-known manifest across app restarts with `cache`:

```ts
const bankLogos = createBankLogos({
  manifestUrl: "https://mycdn.com/manifest.json",
  cache: {
    get: () => uni.getStorageSync("bank-logo-manifest") || null,
    set: (value) => uni.setStorageSync("bank-logo-manifest", value),
  },
});
```

`onError` receives any fetch/parse failure so you can log it — it's never thrown, and never blocks logo resolution:

```ts
createBankLogos({
  manifestUrl: "https://mycdn.com/manifest.json",
  onError: (err) => console.warn("bank logo manifest failed to load", err),
});
```

---

### 6. React Component Usage

```tsx
import React from "react";
import { createBankLogos } from "@theonlyrasheed/bank-logos";

const bankLogos = createBankLogos();

export function BankAvatar({ slug }: { slug: string }) {
  const bank = bankLogos.getBankBySlug(slug);
  if (!bank) return null;

  // imageProps provides src, alt, and onError fallback handler
  const imageProps = bankLogos.createBankImageProps(bank);

  return <img {...imageProps} width={48} height={48} className="bank-avatar" />;
}
```

---

### 7. UniApp & Vue Component Usage

```html
<template>
  <view class="container">
    <input v-model="query" placeholder="Search bank (e.g. Kuda, GTB)" class="search-input" />

    <view v-for="bank in filteredBanks" :key="bank.id" class="bank-card">
      <image :src="bank.logo" class="bank-logo" mode="aspectFit" />
      <view class="bank-info">
        <text class="bank-name">{{ bank.name }}</text>
        <text class="bank-sub">Code: {{ bank.code }} | USSD: {{ bank.ussd || 'N/A' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { createBankLogos } from '@theonlyrasheed/bank-logos';

const bankLogos = createBankLogos();

const query = ref('');
const filteredBanks = computed(() => bankLogos.searchBanks(query.value));
</script>
```

---

### 8. CBN NUBAN Account Number Validation

Validate 10-digit Nigerian NUBAN account numbers against official CBN check digit algorithms. This is a pure, stateless helper exported directly (no instance needed):

```ts
import { validateNuban } from "@theonlyrasheed/bank-logos";

const result = validateNuban("0123456789", "058");

if (result.isValid) {
  console.log("Account number is valid!");
} else {
  console.error("Invalid NUBAN:", result.reason);
}
```

Subpath import for validation:
```ts
import { validateNuban } from "@theonlyrasheed/bank-logos/nuban";
```

---

## API Summary Table

### `createBankLogos(options?)`

The main entry point (also the default export). Returns a `BankLogosInstance` bound to the given config.

| `CreateBankLogosOptions` field | Type | Description |
| :--- | :--- | :--- |
| `cdnBaseUrl` | `string` | Base URL for resolving bundled logo asset filenames |
| `defaultIcon` | `DefaultIconSvgOptions` | Default styling for the generic vector fallback icon |
| `initialsOptions` | `FallbackSvgOptions` (no `format`) | Default styling for the initials badge |
| `customLogos` | `Record<string, string>` | Synchronous logo overrides by bank code/slug — your own SVG/PNG/data-uri |
| `renderInitialsSvg` | `(props) => string` | Fully replace the initials badge SVG markup |
| `manifestUrl` / `manifest` / `fetchFn` / `cache` / `onError` | see [Remote Manifest Overlay](#5-remote-manifest-overlay-optional) | Configure the remote manifest overlay at creation time |

| `BankLogosInstance` member | Parameters | Return Type | Description |
| :--- | :--- | :--- | :--- |
| `banks` | — | `readonly Bank[]` | Immutable snapshot of all bundled banks |
| `ready` | — | `Promise<void>` | Resolves once the initial manifest load has been attempted |
| `getBanks(options?)` | `{ category?, country?, sortedBy? }` | `readonly Bank[]` | Returns immutable list of all supported banks |
| `getBankByCode(code)` | `string` | `Bank \| undefined` | Find bank by 3-digit/6-digit NUBAN code |
| `getBankBySlug(slug)` | `string` | `Bank \| undefined` | Find bank by URL slug |
| `getBankByName(name)` | `string` | `Bank \| undefined` | Find bank by exact or normalized name |
| `searchBanks(query, options?)` | `query: string, { limit?, category? }` | `readonly Bank[]` | Multi-field search across name, code, slug, USSD |
| `getBankLogo(identifier, options?)` | `Bank \| string, LogoOptions?` | `string` | Resolves logo URL (custom/manifest/bundled) or Initials SVG Data URI |
| `hasCustomLogoAsset(identifier)` | `Bank \| string` | `boolean` | True if a dedicated logo exists (bundled, custom, or manifest) rather than falling back |
| `generateInitialsSvg(name, options?)` | `name: string, FallbackSvgOptions?` | `string` | Generates SVG Initials badge Data URI or SVG string |
| `generateDefaultIconSvg(options?)` | `DefaultIconSvgOptions?` | `string` | Generates the default vector bank icon with editable color/size/stroke-width |
| `createBankImageProps(bank, options?)` | `Bank \| string, LogoOptions?` | `BankImageProps` | Returns `{ src, alt, onError }` for UI image fallback |
| `configureManifest(options)` | `ConfigureBankLogosOptions` | `Promise<void>` | Load/replace the remote manifest overlay after creation |

### Standalone exports

Pure, stateless helpers that don't need an instance:

| Export | Parameters | Return Type | Description |
| :--- | :--- | :--- | :--- |
| `banks` | — | `readonly Bank[]` | Raw immutable bank dataset |
| `extractInitials(name)` | `string` | `string` | Derives 2–3 letter initials from a bank name |
| `getBrandColor(nameOrSlug)` | `string` | `string` | Known brand hex color, or a deterministic hash-based color |
| `validateNuban(accountNumber, bankCode)` | `accountNumber: string, bankCode: string` | `NubanValidationResult` | Validates 10-digit NUBAN against official CBN checksum |

---

## Data Structure (`Bank` Interface)

```ts
export interface Bank {
  readonly id: string;            // "1"
  readonly name: string;          // "Guaranty Trust Bank"
  readonly slug: BankSlug;        // "guaranty-trust-bank"
  readonly code: BankCode;        // "058"
  readonly ussd?: string;         // "*737#"
  readonly logo: string;          // "https://.../guaranty-trust-bank.png"
  readonly logoFormat: LogoFormat;// "png" | "svg" | "fallback"
  readonly hasCustomLogo: boolean;// true
  readonly country: CountryCode;  // "NG"
  readonly category?: BankCategory;// "commercial" | "microfinance" | "fintech" | ...
}
```

> `bank.logo`/`bank.hasCustomLogo` reflect the bundled dataset only (computed once, offline). Use `getBankLogo()`/`hasCustomLogoAsset()` on your instance if you've configured `customLogos` or a manifest overlay — those take the override layers into account.

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) to add new bank logos (SVG/PNG) or update bank information.

---

## License

[MIT](./LICENSE) © theonlyrasheed & Contributors
