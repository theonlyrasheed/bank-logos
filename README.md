# @theonlyrasheed/bank-logos

[![npm version](https://img.shields.io/npm/v/@theonlyrasheed/bank-logos.svg?style=flat-square)](https://www.npmjs.com/package/@theonlyrasheed/bank-logos)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg?style=flat-square)](https://www.typescriptlang.org/)

A modern, production-grade library providing a typed dataset of **253 Nigerian banks** (commercial, microfinance, fintech, and mortgage institutions) complete with high-quality SVG/PNG logos, dynamic brand-colored SVG fallbacks, NUBAN checksum validation, and search utilities.

---

## Features

*   🏦 **Dataset**: Normalized list of 253 Nigerian financial institutions with NIBSS codes, slugs, names, and USSD codes.
*   🎨 **SVG Logos**: Clean vector logo assets hosted on a CDN (falls back to PNGs if SVGs are unavailable).
*   🔤 **Dynamic Fallbacks**: Automatic SVG initials badge generator (e.g. `GTB`, `KB`) with brand-matching background colors.
*   🔢 **NUBAN Validation**: Stateless CBN-compliant modulo 10 checksum validator for 10-digit account numbers.
*   🔒 **TypeScript First**: Full IDE autocompletion with generated literal type unions and generic type casting support.

---

## Installation

```bash
# Using pnpm (recommended)
pnpm add @theonlyrasheed/bank-logos

# Using npm
npm install @theonlyrasheed/bank-logos

# Using yarn
yarn add @theonlyrasheed/bank-logos
```

---

## Quick Start

Initialize the bank logos engine once and reuse it across your application. With no configuration, it works fully offline:

```ts
import { createBankLogos, validateNuban } from "@theonlyrasheed/bank-logos";

// Initialize the instance
const bankLogos = createBankLogos();

// 1. Retrieve a bank by NIBSS code (handles padded codes like "058" or "58")
const bank = bankLogos.getBankByCode("058");
console.log(bank?.name); // "GTBank Plc"

// 2. Fetch a bank logo URL (returns SVG/PNG CDN link or falls back to an Initials SVG Data URI)
const logoUrl = bankLogos.getBankLogo("058");

// 3. Search banks across names, slugs, NIBSS codes, and USSD codes
const searchResults = bankLogos.searchBanks("kuda");
```

---

## Core Usage Guide

### 1. Retrieving and Querying Banks
Retrieve banks using NIBSS codes, slugs, names, or categories:

```ts
// Get all 253 banks
const allBanks = bankLogos.getBanks();

// Get filtered categories (e.g. commercial, microfinance, fintech, mortgage) sorted by name
const commercialBanks = bankLogos.getBanks({ category: "commercial", sortedBy: "name" });

// Lookup by URL slug
const kuda = bankLogos.getBankBySlug("kuda-mfb");

// Lookup by name (fuzzy matching, handles minor differences like dashes or "microfinance" vs "micro-finance")
const access = bankLogos.getBankByName("access bank");
```

### 2. Multi-field Search
Perform fuzzy searches across name, slug, code, and USSD properties:

```ts
const results = bankLogos.searchBanks("first"); 
// Returns First Bank, FCMB, First Generation Mortgage, etc.

const ussdResult = bankLogos.searchBanks("*737#");
// Returns GTBank Plc
```

### 3. Rendering Logos and Fallbacks
The `getBankLogo` method returns the CDN path to the SVG/PNG asset. If the bank doesn't have a custom logo, it returns a dynamic brand-colored **Initials SVG badge** encoded as a Data URI.

```ts
// Standard logo retrieval
const url = bankLogos.getBankLogo("058"); 
// Returns "https://raw.githubusercontent.com/.../src/logos/gtb.svg"

// If the bank does not have a custom logo, it generates an Initials SVG badge:
const mfbLogo = bankLogos.getBankLogo("090133");
// Returns "data:image/svg+xml;utf8,<svg...>ALB</svg>"
```

#### Image Component Props (React, Vue, UniApp)
Use `createBankImageProps` to construct properties for `<img>` elements. It includes an `onError` handler that automatically swaps broken image links with the initials SVG fallback on loading failure:

```tsx
const bank = bankLogos.getBankBySlug("gtb")!;
const imgProps = bankLogos.createBankImageProps(bank);

// Spreads src, alt, and onError handler
return <img {...imgProps} width={48} height={48} />;
```

#### Generic Bank Fallback Icon
If you prefer a generic bank building vector icon instead of initials, specify `fallbackType: "default-icon"`:

```ts
// Returns CDN link to default vector bank building icon
const genericIcon = bankLogos.getBankLogo("unknown-code", { 
  fallbackType: "default-icon" 
});

// Or generate a customizable raw SVG generic icon directly
const customIcon = bankLogos.generateDefaultIconSvg({
  color: "#FF6600", // stroke color
  size: 48,
});
```

---

## Advanced Configurations

You can configure global options when instantiating the library to avoid repeating options on every lookup:

```ts
const bankLogos = createBankLogos({
  // 1. Host the SVG/PNG assets on your own CDN
  cdnBaseUrl: "https://mycdn.com/logos",

  // 2. Instantiate default fallback type globally ('initials' or 'default-icon')
  fallbackType: "default-icon",

  // 3. Pin styling for the default generic fallback icon
  defaultIcon: { color: "#00AE99", strokeWidth: 1.5 },

  // 4. Default styling for the initials badge (per-call options still win)
  initialsOptions: { size: 48, textColor: "#FFFFFF" },

  // 5. Overwrite or add custom bank logos inline (SVG strings, URLs, or Data URIs)
  customLogos: {
    "101": "https://mycdn.com/providus.svg",
    "titan-trust-bank": "<svg>...</svg>"
  },

  // 6. Override initials badge SVG markup structure entirely
  renderInitialsSvg: ({ text, size, backgroundColor, textColor }) =>
    `<svg width="${size}" height="${size}"><circle r="${size/2}" fill="${backgroundColor}"/><text fill="${textColor}">${text}</text></svg>`
});
```

---

## TypeScript Generics (`<T extends Bank>`)
If you use a remote manifest overlay or local extensions to append custom properties to the bank records, you can pass a generic type parameter `T` to `createBankLogos`. This ensures that all query results are strictly typed with your custom schema:

```ts
interface MyCustomBank extends Bank {
  routingNumber?: string;
  isSupportedByApp: boolean;
}

const bankLogos = createBankLogos<MyCustomBank>({
  customLogos: {
    "gtb": "https://custom.url/gtb.svg"
  }
});

// getBanks() automatically typed as MyCustomBank[]
const list = bankLogos.getBanks();

// getBankByCode() returns MyCustomBank | undefined
const bank = bankLogos.getBankByCode("058");
console.log(bank?.isSupportedByApp); 
```

---

## CBN NUBAN Checksum Validation
Verify 10-digit Nigerian NUBAN account numbers against official CBN check digit calculations. This utility is stateless and can be imported directly:

```ts
import { validateNuban } from "@theonlyrasheed/bank-logos";

const result = validateNuban("0000000018", "058");

if (result.isValid) {
  console.log("Account checksum is valid!");
} else {
  console.error("Invalid checksum:", result.reason); // "Check digit does not match..."
}
```

---

## Data Schema (`Bank` Interface)

Every bank record matches the following typescript schema:

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique string identifier |
| `name` | `string` | Clean, official name of the bank |
| `slug` | `BankSlug` | Unique URL-friendly slug identifier |
| `code` | `BankCode` | Official NUBAN bank code |
| `ussd` | `string` | Optional USSD mobile banking quick code (e.g. `"*737#"`) |
| `logo` | `string` | Resolved logo CDN link or fallback initials Data URI |
| `logoFormat` | `LogoFormat` | Image format of the custom asset (`"svg" \| "png" \| "fallback"`) |
| `hasCustomLogo` | `boolean` | True if a custom SVG or PNG file exists for this bank |
| `country` | `CountryCode` | ISO 2-letter country code (`"NG"`) |
| `nibss_bank_code`| `string` | Optional NIBSS bank routing code |
| `category` | `BankCategory`| Category (`"commercial" \| "microfinance" \| "fintech" \| "mortgage" \| "non-interest"`) |

---

## License

[MIT](./LICENSE) © theonlyrasheed & Contributors
