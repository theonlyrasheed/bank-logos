import type { NubanValidationResult } from "./types";

/** Weight factors specified by the Central Bank of Nigeria (CBN) NUBAN standard */
const NUBAN_WEIGHTS = [3, 7, 3, 3, 7, 3, 3, 7, 3, 3, 7, 3];

/**
 * Validates a 10-digit Nigerian NUBAN account number against a bank code using CBN checksum algorithm.
 *
 * @param accountNumber 10-digit NUBAN account number (e.g. "0123456789")
 * @param bankCode NUBAN bank code (3-digit commercial or 6-digit MFB code, e.g. "058", "011", "090110")
 * @returns NubanValidationResult object
 */
export function validateNuban(
  accountNumber: string,
  bankCode: string
): NubanValidationResult {
  if (!accountNumber || typeof accountNumber !== "string") {
    return {
      isValid: false,
      reason: "Account number must be a non-empty string.",
    };
  }

  const cleanAccount = accountNumber.trim();
  if (!/^\d{10}$/.test(cleanAccount)) {
    return {
      isValid: false,
      reason: "Account number must contain exactly 10 numeric digits.",
    };
  }

  if (!bankCode || typeof bankCode !== "string") {
    return {
      isValid: false,
      reason: "Bank code must be a non-empty string.",
    };
  }

  const cleanBankCode = bankCode.trim();
  if (!/^\d{3,6}$/.test(cleanBankCode)) {
    return {
      isValid: false,
      reason: "Bank code must contain between 3 and 6 numeric digits.",
    };
  }

  // Format bank code: padded to 3 digits for commercial or 6 digits for OFIs
  let paddedBankCode = cleanBankCode;
  if (cleanBankCode.length < 3) {
    paddedBankCode = cleanBankCode.padStart(3, "0");
  }

  // Take relevant bank code digits for CBN NUBAN formula (3-digit code prefix)
  const bankPrefix = paddedBankCode.slice(-3).padStart(3, "0");
  const serialNumber = cleanAccount.slice(0, 9);
  const expectedCheckDigit = parseInt(cleanAccount[9], 10);

  // Combine 3-digit bank prefix + 9-digit account serial = 12 digits
  const combinedDigits = `${bankPrefix}${serialNumber}`;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(combinedDigits[i], 10);
    sum += digit * NUBAN_WEIGHTS[i];
  }

  const remainder = sum % 10;
  const calculatedCheckDigit = (10 - remainder) % 10;

  const isValid = calculatedCheckDigit === expectedCheckDigit;

  return {
    isValid,
    reason: isValid
      ? undefined
      : `Check digit mismatch: expected ${expectedCheckDigit}, calculated ${calculatedCheckDigit}.`,
    calculatedCheckDigit,
    expectedCheckDigit,
  };
}
