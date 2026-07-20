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
- 🖼️ **UI Component Ready**: `createBankImageProps()` helper provides `{ src, alt, onError }` for React, Vue, UniApp, Svelte, and HTML `<img>` elements with instant error recovery.
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

## Usage Guide

### 1. Retrieve & Filter Banks

```ts
import { getBanks, getBankByCode, getBankBySlug, getBankByName } from "@theonlyrasheed/bank-logos";

// Get all banks
const allBanks = getBanks();

// Filter commercial banks sorted by name
const commercialBanks = getBanks({ category: "commercial", sortedBy: "name" });

// Find bank by 3-digit or 6-digit NUBAN code (handles padded "058" or "58")
const gtBank = getBankByCode("058");
console.log(gtBank?.name); // "Guaranty Trust Bank"

// Find bank by slug
const kuda = getBankBySlug("kuda-microfinance-bank");
console.log(kuda?.code); // "50211"
```

---

### 2. Search Banks

```ts
import { searchBanks } from "@theonlyrasheed/bank-logos";

// Search across name, slug, bank code, and USSD code
const results = searchBanks("first");
// Matches "First Bank of Nigeria", "First City Monument Bank", etc.

// Search USSD code
const gtUssd = searchBanks("*737#");
```

---

### 3. Logo URLs & Fallbacks (Using Bank Code or Missing Logo Handling)

`getBankLogo` accepts a bank object, slug, or **bank code** (e.g. `"058"`, `"50211"`). If a custom logo isn't available for the bank code, it automatically generates a vector **Initials SVG Data URI**:

```ts
import { getBankLogo, getBankByCode, generateInitialsSvg } from "@theonlyrasheed/bank-logos";

// 1. Pass bank code directly (e.g. "058" for GTBank, "50211" for Kuda)
// Automatically returns logo URL, or Initials SVG Data URI if logo is unavailable
const logoUrlByCode = getBankLogo("058");

// 2. Check if a bank has a dedicated custom logo file (SVG/PNG)
const bank = getBankByCode("058");

if (bank?.hasCustomLogo) {
  // Dedicated custom logo URL (SVG or PNG)
  console.log("Custom logo URL:", bank.logo);
} else {
  // Generate dynamic SVG Initials fallback badge
  const fallbackBadge = generateInitialsSvg(bank ? bank.name : "Unknown Bank", {
    format: "data-uri", // 'data-uri' or 'svg-string'
    size: 64,
  });
  console.log("Fallback SVG Data URI:", fallbackBadge);
}

// 3. Using default-image.svg (Vector Bank Icon) as Fallback
// Pass fallbackType: "default-icon" or useInitialsFallback: false to use default-image.svg
const defaultIconUrl = getBankLogo("unknown-bank-code", {
  fallbackType: "default-icon", // Returns CDN URL for default-image.svg
});

// 3b. Customize the default icon's color/size instead of using the static CDN file
// Passing defaultIconOptions generates an inline, editable SVG Data URI
const customDefaultIconUrl = getBankLogo("unknown-bank-code", {
  fallbackType: "default-icon",
  defaultIconOptions: {
    color: "#FF6600",   // stroke color (default '#00AE99')
    size: 48,            // default 64
    strokeWidth: 1.5,    // default 1
  },
});

// Or generate it directly
import { generateDefaultIconSvg } from "@theonlyrasheed/bank-logos";

const iconSvgString = generateDefaultIconSvg({
  color: "#1E293B",
  size: 32,
  format: "svg-string", // 'data-uri' or 'svg-string'
});
```

---

### 4. React Component Usage

```tsx
import React from "react";
import { getBankBySlug, createBankImageProps } from "@theonlyrasheed/bank-logos";

export function BankAvatar({ slug }: { slug: string }) {
  const bank = getBankBySlug(slug);
  if (!bank) return null;

  // imageProps provides src, alt, and onError fallback handler
  const imageProps = createBankImageProps(bank);

  return <img {...imageProps} width={48} height={48} className="bank-avatar" />;
}
```

---

### 5. UniApp & Vue Component Usage

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
import { searchBanks } from '@theonlyrasheed/bank-logos';

const query = ref('');
const filteredBanks = computed(() => searchBanks(query.value));
</script>
```

---

### 6. CBN NUBAN Account Number Validation

Validate 10-digit Nigerian NUBAN account numbers against official CBN check digit algorithms:

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

| Function | Parameters | Return Type | Description |
| :--- | :--- | :--- | :--- |
| `getBanks(options?)` | `{ category?, country?, sortedBy? }` | `readonly Bank[]` | Returns immutable list of all supported banks |
| `getBankByCode(code)` | `string` | `Bank \| undefined` | Find bank by 3-digit/6-digit NUBAN code |
| `getBankBySlug(slug)` | `string` | `Bank \| undefined` | Find bank by URL slug |
| `getBankByName(name)` | `string` | `Bank \| undefined` | Find bank by exact or normalized name |
| `searchBanks(query, options?)` | `query: string, { limit?, category? }` | `readonly Bank[]` | Multi-field search across name, code, slug, USSD |
| `getBankLogo(identifier, options?)` | `Bank \| string, LogoOptions?` | `string` | Resolves logo CDN URL or Initials SVG Data URI |
| `generateInitialsSvg(name, options?)`| `name: string, FallbackSvgOptions?`| `string` | Generates SVG Initials badge Data URI or SVG string |
| `generateDefaultIconSvg(options?)`| `DefaultIconSvgOptions?`| `string` | Generates the default vector bank icon with editable color/size/stroke-width |
| `createBankImageProps(bank, options?)`| `Bank \| string, LogoOptions?` | `BankImageProps` | Returns `{ src, alt, onError }` for UI image fallback |
| `validateNuban(accountNumber, bankCode)`| `accountNumber: string, bankCode: string` | `NubanValidationResult` | Validates 10-digit NUBAN against official CBN checksum |

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

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) to add new bank logos (SVG/PNG) or update bank information.

---

## License

[MIT](./LICENSE) © theonlyrasheed & Contributors
