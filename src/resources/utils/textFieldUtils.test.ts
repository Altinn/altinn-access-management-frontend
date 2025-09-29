import { describe, it, expect, vi } from 'vitest';
import { validateEmail, validatePhoneNumber } from './textFieldUtils';

describe('validateEmail', () => {
  it('should return valid for correct email formats', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'firstname+lastname@company.org',
      'test123@test-domain.com',
      'user_name@example-domain.com',
      'test.email.with+symbol@example.com',
      'a@b.co', // minimal valid email
      'user123@sub.domain.org',
    ];

    validEmails.forEach((email) => {
      const result = validateEmail(email);
      expect(result.isValid).toBe(true);
      expect(result.errorMessageKey).toBe('');
    });
  });

  it('should return invalid for incorrect email formats', () => {
    const invalidEmails = [
      '', // empty string
      'invalid-email', // no @ symbol
      '@example.com', // missing local part
      'test@', // missing domain
      'test@example', // missing TLD
      'test @example.com', // space in local part
      'test@example .com', // space in domain
      'test@.com', // domain starts with dot
      '.test@example.com', // local part starts with dot
      'test.@example.com', // local part ends with dot
      'test@example.c', // TLD too short (1 character)
      'test@@example.com', // double @ symbol
    ];

    invalidEmails.forEach((email) => {
      const result = validateEmail(email);
      expect(result.isValid).toBe(false);
      expect(result.errorMessageKey).toBe('text_field_errors.invalid_email_pattern');
    });
  });

  it('should handle edge cases', () => {
    // Very long email
    const longEmail = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com';
    const longResult = validateEmail(longEmail);
    expect(longResult.isValid).toBe(true);

    // Email with special characters
    const specialEmail = 'test+tag@example.com';
    const specialResult = validateEmail(specialEmail);
    expect(specialResult.isValid).toBe(true);
  });
});

describe('validatePhoneNumber', () => {
  it('should return valid for correct phone number formats', () => {
    const validPhones = [
      '12345678', // exactly 8 digits
      '123456789', // 9 digits
      '1234567890', // 10 digits
      '12345678901', // 11 digits
      '123456789012', // 12 digits
      '1234567890123', // 13 digits
      '12345678901234', // 14 digits
      '123456789012345', // exactly 15 digits
      '90123456', // Norwegian mobile format
      '22334455', // Norwegian landline format
    ];

    validPhones.forEach((phone) => {
      const result = validatePhoneNumber(phone);
      expect(result.isValid).toBe(true);
      expect(result.errorMessageKey).toBe('');
    });
  });

  it('should return invalid for incorrect phone number formats', () => {
    const invalidPhones = [
      '', // empty string
      '1234567', // too short (7 digits)
      '1234567890123456', // too long (16 digits)
      '12345abc', // contains letters
      '123-456-7890', // contains hyphens
      '123 456 7890', // contains spaces
      '+4712345678', // contains plus sign
      '(123)4567890', // contains parentheses
      '123.456.7890', // contains dots
      'abcdefgh', // all letters
      '12345678a', // ends with letter
      'a12345678', // starts with letter
      '1234 5678', // space in middle
    ];

    invalidPhones.forEach((phone) => {
      const result = validatePhoneNumber(phone);
      expect(result.isValid).toBe(false);
      expect(result.errorMessageKey).toBe('text_field_errors.invalid_phone');
    });
  });

  it('should handle edge cases', () => {
    // Exactly minimum length
    const minLength = '12345678';
    const minResult = validatePhoneNumber(minLength);
    expect(minResult.isValid).toBe(true);

    // Exactly maximum length
    const maxLength = '123456789012345';
    const maxResult = validatePhoneNumber(maxLength);
    expect(maxResult.isValid).toBe(true);

    // One digit short
    const tooShort = '1234567';
    const shortResult = validatePhoneNumber(tooShort);
    expect(shortResult.isValid).toBe(false);

    // One digit too long
    const tooLong = '1234567890123456';
    const longResult = validatePhoneNumber(tooLong);
    expect(longResult.isValid).toBe(false);
  });

  it('should only accept numeric characters', () => {
    // Mixed valid and invalid characters
    const mixedCases = [
      '1234567a', // letter at end
      'a1234567', // letter at start
      '123a5678', // letter in middle
      '123456@8', // special character
      '12345#78', // hash symbol
      '1234*678', // asterisk
    ];

    mixedCases.forEach((phone) => {
      const result = validatePhoneNumber(phone);
      expect(result.isValid).toBe(false);
      expect(result.errorMessageKey).toBe('text_field_errors.invalid_phone');
    });
  });
});
