# Contributing to `@theonlyrasheed/bank-logos`

Thank you for helping improve `@theonlyrasheed/bank-logos`! We welcome contributions including adding new banks, updating bank codes/USSD numbers, and providing SVG or PNG bank logos.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 18
- `pnpm` (version 9)

### 2. Fork and Clone Repository

```bash
git clone https://github.com/theonlyrasheed/bank-logos.git
cd bank-logos
pnpm install
```

---

## 🔒 Pull Request & Security Protection

To protect the integrity of `@theonlyrasheed/bank-logos`:
- **Direct pushes to `main` are disabled** for external contributors.
- **Pull Requests (PRs)** are required for all contributions.
- All PRs must pass automated **GitHub Actions CI checks** (`typecheck`, `test`, `build`) before review.
- Code changes require approval from `@theonlyrasheed` (enforced via `.github/CODEOWNERS`).

---

## 🎨 Adding or Updating Bank Logos (SVG / PNG)

1. Place your high-resolution logo image inside `src/logos/`.
2. Name the file using the bank's slug (e.g. `kuda-microfinance-bank.svg` or `kuda-microfinance-bank.png`).
3. **Format Priority**: SVG vector files (`.svg`) are prioritized over PNG (`.png`), WebP (`.webp`), or JPEG (`.jpg`).
4. Run the logo generator script:
   ```bash
   pnpm run prebuild
   ```
5. Run the test suite:
   ```bash
   pnpm run test
   ```

---

## 🏦 Adding a New Bank or Updating Bank Details

1. Open `src/all_banks.json`.
2. Add or edit the bank object:
   ```json
   {
     "id": "123",
     "name": "NEW MICROFINANCE BANK",
     "slug": "new-microfinance-bank",
     "code": "090999",
     "ussd": "*999#"
   }
   ```
3. Run `pnpm run prebuild` to regenerate TypeScript types and logo metadata.
4. Run `pnpm run test` and `pnpm run typecheck` to verify no breaking changes.

---

## 🧪 Testing & Verification

Before opening a Pull Request, please ensure all checks pass:

```bash
# Typecheck TypeScript files
pnpm run typecheck

# Run unit tests
pnpm run test

# Build distribution bundles
pnpm run build
```

---

## 📜 Code Style & TypeScript Guidelines

- Use `interface` for object definitions (`Bank`, `LogoOptions`, `FallbackSvgOptions`).
- Use `type` for unions and primitive aliases (`BankSlug`, `BankCode`, `LogoFormat`).
- Always include JSDoc comments (`/** ... */`) for public APIs.

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the package's [MIT License](./LICENSE).
