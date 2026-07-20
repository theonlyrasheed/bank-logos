# @theonlyrasheed/bank-logos

[![npm version](https://img.shields.io/npm/v/@theonlyrasheed/bank-logos.svg?style=flat-square)](https://www.npmjs.com/package/@theonlyrasheed/bank-logos)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![CI Status](https://img.shields.io/github/actions/workflow/status/theonlyrasheed/bank-logos/ci.yml?branch=main&style=flat-square)](https://github.com/theonlyrasheed/bank-logos/actions)

> Typed list of Nigerian and international banks with **SVG & PNG vector logos**, **dynamic Initials SVG fallbacks**, **CBN NUBAN account validation**, and **multi-field search utilities** for Node.js and browser environments.

---

## Features

- 🏦 **Comprehensive Bank Dataset**: Includes commercial banks, microfinance banks (MFBs), fintechs, mortgage banks, and non-interest banks with codes, slugs, names, and USSD quick codes.
- 🎨 **Multi-Format Logos (SVG & PNG)**: Supports high-resolution SVG vector logos alongside PNG assets.
- 🔤 **Dynamic Initials SVG Fallbacks**: Automatic zero-dependency SVG vector initials avatar generator (`GTB`, `FBN`, `KB`, etc.) for missing logos or broken image links.
- 🖼️ **UI Component Ready**: `createBankImageProps()` helper provides `{ src, alt, onError }` for React, Vue, Svelte, and HTML `<img>` elements with instant error recovery.
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

## Usage

### 1. Retrieve & Filter Banks

```ts
import { getBanks, getBankByCode, getBankBySlug, getBankByName } from "@theonlyrasheed/bank-logos";

// Get all banks
const allBanks = getBanks();

// Filter commercial banks sorted by name
const commercialBanks = getBanks({ category: "commercial", sortedBy: "name" });

// Find bank by 3-digit or 6-digit NUBAN code
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

### 3. Logo URLs & Dynamic Initials SVG Fallbacks

```ts
import { getBankLogo, generateInitialsSvg } from "@theonlyrasheed/bank-logos";

// Get bank logo URL (or SVG Initials Data URI if missing)
const logoUrl = getBankLogo("guaranty-trust-bank");

// Generate raw SVG vector string or Data URI with initials (e.g. "FBN")
const initialsDataUri = generateInitialsSvg("First Bank of Nigeria", {
  format: "data-uri",
  size: 64,
});

const svgString = generateInitialsSvg("Kuda Bank", {
  format: "svg-string",
});
```

---

### 4. React / Vue / HTML Image Props (Auto Fallback)

Use `createBankImageProps` to automatically recover from broken image links:

```tsx
import React from "react";
import { getBankBySlug, createBankImageProps } from "@theonlyrasheed/bank-logos";

export function BankAvatar({ slug }: { slug: string }) {
  const bank = getBankBySlug(slug);
  if (!bank) return null;

  const imageProps = createBankImageProps(bank);

  return <img {...imageProps} width={48} height={48} className="rounded-full" />;
}
```

---

### 5. CBN NUBAN Account Number Validation

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
