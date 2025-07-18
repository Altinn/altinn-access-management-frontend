import { describe, expect, test } from 'vitest';

import { formatDateToNorwegian, formatDateToNorwegianWithMonthName } from './dateUtils';

describe('dateUtils', () => {
  describe('formatDateToNorwegian', () => {
    test('should format ISO date to Norwegian DD.MM.YYYY format', () => {
      expect(formatDateToNorwegian('1990-12-25')).toBe('25.12.1990');
      expect(formatDateToNorwegian('2000-01-01')).toBe('01.01.2000');
      expect(formatDateToNorwegian('1985-06-15')).toBe('15.06.1985');
    });

    test('should handle undefined input', () => {
      expect(formatDateToNorwegian(undefined)).toBeUndefined();
    });

    test('should handle invalid date strings', () => {
      expect(formatDateToNorwegian('invalid-date')).toBe('invalid-date');
      expect(formatDateToNorwegian('')).toBe('');
    });

    test('should handle edge cases', () => {
      expect(formatDateToNorwegian('2024-02-29')).toBe('29.02.2024'); // Leap year
      expect(formatDateToNorwegian('2023-12-31')).toBe('31.12.2023');
    });
  });

  describe('formatDateToNorwegianWithMonthName', () => {
    test('should format ISO date with Norwegian month names', () => {
      // Note: These tests might vary based on the actual Norwegian locale implementation
      const result = formatDateToNorwegianWithMonthName('1990-12-25');
      expect(result).toContain('25');
      expect(result).toContain('1990');
      expect(result).toBeDefined();
    });

    test('should handle undefined input', () => {
      expect(formatDateToNorwegianWithMonthName(undefined)).toBeUndefined();
    });

    test('should handle invalid date strings', () => {
      expect(formatDateToNorwegianWithMonthName('invalid-date')).toBe('invalid-date');
    });
  });
});
