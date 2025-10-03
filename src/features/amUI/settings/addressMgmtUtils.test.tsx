import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import React from 'react';

import type { Address, NotificationAddress } from '@/rtk/features/settingsApi';
import { settingsApi } from '@/rtk/features/settingsApi';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import type { Party } from '@/rtk/features/lookupApi';
import { PartyType } from '@/rtk/features/userInfoApi';

import {
  hasDeletions,
  hasAdditions,
  hasEdits,
  hasChanges,
  isValidAddresses,
  useSaveAddressChanges,
} from './addressMgmtUtils';

// Mock the PartyRepresentation hook
vi.mock('../common/PartyRepresentationContext/PartyRepresentationContext', () => ({
  usePartyRepresentation: vi.fn(),
}));

// Mock the validation functions
vi.mock('@/resources/utils/textFieldUtils', () => ({
  validateEmail: vi.fn((email: string) => ({
    isValid: email.includes('@') && email.includes('.'),
  })),
  validatePhoneNumber: vi.fn((phone: string) => ({
    isValid: phone.length >= 8 && /^\d+$/.test(phone),
  })),
  validateCountryCode: vi.fn((countryCode: string) => ({
    isValid: countryCode.length >= 2 && countryCode.length <= 3,
  })),
}));

// Mock the RTK mutations
const mockCreateAddress = vi.fn();
const mockDeleteAddress = vi.fn();
const mockUpdateAddress = vi.fn();

vi.mock('@/rtk/features/settingsApi', async () => {
  const actual = await vi.importActual('@/rtk/features/settingsApi');
  return {
    ...actual,
    useCreateOrgNotificationAddressMutation: () => [mockCreateAddress],
    useDeleteOrgNotificationAddressMutation: () => [mockDeleteAddress],
    useUpdateOrgNotificationAddressMutation: () => [mockUpdateAddress],
  };
});

// Test data
const createNotificationAddress = (
  id: string,
  email: string = '',
  phone: string = '',
  countryCode: string = '',
): NotificationAddress => ({
  notificationAddressId: id,
  email,
  phone,
  countryCode,
});

const createAddress = (
  email: string = '',
  phone: string = '',
  countryCode: string = '',
  notificationAddressId?: string,
): NotificationAddress => ({
  email,
  phone,
  countryCode,
  notificationAddressId: notificationAddressId || '',
});

// Test wrapper component
const createTestWrapper = () => {
  const store = configureStore({
    reducer: {
      [settingsApi.reducerPath]: settingsApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(settingsApi.middleware),
  });

  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe('addressMgmtUtils', () => {
  const TestWrapper = createTestWrapper();

  beforeEach(() => {
    vi.clearAllMocks();
    // Set default mock for usePartyRepresentation
    vi.mocked(usePartyRepresentation).mockReturnValue({
      actingParty: {
        partyId: 1,
        partyUuid: 'test-uuid-123',
        orgNumber: '123456789',
        name: 'Test Organization',
        partyTypeName: PartyType.Organization,
      },
      isLoading: false,
      isError: false,
    });
  });

  describe('hasDeletions', () => {
    it('should return true when stored array is longer than current array', () => {
      const stored = [
        createNotificationAddress('1', 'test1@example.com'),
        createNotificationAddress('2', 'test2@example.com'),
      ];
      const current = [createAddress('test1@example.com')];

      expect(hasDeletions(stored, current)).toBe(true);
    });

    it('should return false when stored array is same length as current array', () => {
      const stored = [createNotificationAddress('1', 'test1@example.com')];
      const current = [createAddress('test1@example.com')];

      expect(hasDeletions(stored, current)).toBe(false);
    });

    it('should return false when stored array is shorter than current array', () => {
      const stored = [createNotificationAddress('1', 'test1@example.com')];
      const current = [createAddress('test1@example.com'), createAddress('test2@example.com')];

      expect(hasDeletions(stored, current)).toBe(false);
    });

    it('should return false when stored array is empty', () => {
      const stored: NotificationAddress[] = [];
      const current = [createAddress('test1@example.com')];

      expect(hasDeletions(stored, current)).toBe(false);
    });
  });

  describe('hasAdditions', () => {
    it('should return true when current array has more valid addresses than stored', () => {
      const stored = [createNotificationAddress('1', 'test1@example.com')];
      const current = [createAddress('test1@example.com'), createAddress('test2@example.com')];

      expect(hasAdditions(stored, current)).toBe(true);
    });

    it('should return false when arrays have same number of valid addresses', () => {
      const stored = [createNotificationAddress('1', 'test1@example.com')];
      const current = [createAddress('test1@example.com')];

      expect(hasAdditions(stored, current)).toBe(false);
    });

    it('should return false when current has fewer valid addresses than stored', () => {
      const stored = [
        createNotificationAddress('1', 'test1@example.com'),
        createNotificationAddress('2', 'test2@example.com'),
      ];
      const current = [createAddress('test1@example.com')];

      expect(hasAdditions(stored, current)).toBe(false);
    });

    it('should ignore empty addresses when counting current addresses', () => {
      const stored = [createNotificationAddress('1', 'test1@example.com')];
      const current = [
        createAddress('test1@example.com'),
        createAddress('', ''), // empty address should be ignored
        createAddress('test2@example.com'),
      ];

      expect(hasAdditions(stored, current)).toBe(true);
    });

    it('should count phone numbers as valid addresses', () => {
      const stored = [createNotificationAddress('1', '', '12345678', '+47')];
      const current = [createAddress('', '12345678', '+47'), createAddress('', '87654321', '+47')];

      expect(hasAdditions(stored, current)).toBe(true);
    });
  });

  describe('hasEdits', () => {
    it('should return true when email addresses are different', () => {
      const stored = [createNotificationAddress('1', 'test1@example.com')];
      const current = [createAddress('test2@example.com')];

      expect(hasEdits(stored, current)).toBe(true);
    });

    it('should return true when phone numbers are different', () => {
      const stored = [createNotificationAddress('1', '', '12345678', '+47')];
      const current = [createAddress('', '87654321', '+47')];

      expect(hasEdits(stored, current)).toBe(true);
    });

    it('should return true when country codes are different', () => {
      const stored = [createNotificationAddress('1', '', '12345678', '+47')];
      const current = [createAddress('', '12345678', '+46')];

      expect(hasEdits(stored, current)).toBe(true);
    });

    it('should return false when addresses are identical', () => {
      const stored = [createNotificationAddress('1', 'test@example.com', '12345678', '+47')];
      const current = [createAddress('test@example.com', '12345678', '+47')];

      expect(hasEdits(stored, current)).toBe(false);
    });

    it('should handle empty values correctly', () => {
      const stored = [createNotificationAddress('1', 'test@example.com', '', '')];
      const current = [createAddress('test@example.com', '', '')];

      expect(hasEdits(stored, current)).toBe(false);
    });

    it('should treat null/undefined and empty string as equal', () => {
      const stored = [createNotificationAddress('1', 'test@example.com')];
      const current = [createAddress('test@example.com', '', '')];

      expect(hasEdits(stored, current)).toBe(false);
    });
  });

  describe('hasChanges', () => {
    it('should return true when current is empty but stored has addresses', () => {
      const stored = [createNotificationAddress('1', 'test@example.com')];
      const current: NotificationAddress[] = [];

      expect(hasChanges(stored, current)).toBe(true);
    });

    it('should return true when there are additions', () => {
      const stored = [createNotificationAddress('1', 'test1@example.com')];
      const current = [createAddress('test1@example.com'), createAddress('test2@example.com')];

      expect(hasChanges(stored, current)).toBe(true);
    });

    it('should return true when there are deletions', () => {
      const stored = [
        createNotificationAddress('1', 'test1@example.com'),
        createNotificationAddress('2', 'test2@example.com'),
      ];
      const current = [createAddress('test1@example.com')];

      expect(hasChanges(stored, current)).toBe(true);
    });

    it('should return true when there are edits', () => {
      const stored = [createNotificationAddress('1', 'test1@example.com')];
      const current = [createAddress('test2@example.com')];

      expect(hasChanges(stored, current)).toBe(true);
    });

    it('should return false when arrays are identical', () => {
      const stored = [createNotificationAddress('1', 'test@example.com', '12345678', '+47')];
      const current = [createAddress('test@example.com', '12345678', '+47')];

      expect(hasChanges(stored, current)).toBe(false);
    });

    it('should return false when both arrays are empty', () => {
      const stored: NotificationAddress[] = [];
      const current: NotificationAddress[] = [];

      expect(hasChanges(stored, current)).toBe(false);
    });
  });

  describe('isValidAddresses', () => {
    it('should return true for valid email addresses', () => {
      const addresses = [createAddress('test@example.com'), createAddress('another@test.com')];

      expect(isValidAddresses(addresses)).toBe(true);
    });

    it('should return true for valid phone numbers', () => {
      const addresses = [
        createAddress('', '12345678', '+47'),
        createAddress('', '87654321', '+46'),
      ];

      expect(isValidAddresses(addresses)).toBe(true);
    });

    it('should return true for mixed valid addresses', () => {
      const addresses = [createAddress('test@example.com'), createAddress('', '12345678', '+47')];

      expect(isValidAddresses(addresses)).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      const addresses = [
        createAddress('invalid-email'), // no @ or .
      ];

      expect(isValidAddresses(addresses)).toBe(false);
    });

    it('should return false for invalid phone numbers', () => {
      const addresses = [
        createAddress('', '123', '+47'), // too short phone number
      ];

      expect(isValidAddresses(addresses)).toBe(false);
    });

    it('should return false for invalid country codes', () => {
      const addresses = [
        createAddress('', '12345678', 'X'), // too short country code
      ];

      expect(isValidAddresses(addresses)).toBe(false);
    });

    it('should ignore empty addresses', () => {
      const addresses = [
        createAddress('', '', ''), // empty address should be ignored
        createAddress('test@example.com'),
      ];

      expect(isValidAddresses(addresses)).toBe(true);
    });

    it('should return true when all addresses are empty', () => {
      const addresses = [createAddress('', '', ''), createAddress('', '', '')];

      expect(isValidAddresses(addresses)).toBe(true);
    });
  });

  describe('useSaveAddressChanges', () => {
    it('should detect changes correctly', () => {
      const stored = [createNotificationAddress('1', 'test@example.com')];
      const current = [createAddress('test2@example.com')];

      const { result } = renderHook(() => useSaveAddressChanges(stored, current), {
        wrapper: TestWrapper,
      });

      expect(result.current.isChanges).toBe(true);
    });

    it('should detect no changes correctly', () => {
      const stored = [createNotificationAddress('1', 'test@example.com')];
      const current = [createAddress('test@example.com')];

      const { result } = renderHook(() => useSaveAddressChanges(stored, current), {
        wrapper: TestWrapper,
      });

      expect(result.current.isChanges).toBe(false);
    });

    it('should initialize with correct default state', () => {
      const stored: NotificationAddress[] = [];
      const current: NotificationAddress[] = [];

      const { result } = renderHook(() => useSaveAddressChanges(stored, current), {
        wrapper: TestWrapper,
      });

      expect(result.current.isSaving).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.isChanges).toBe(false);
    });

    it('should not save when there are no changes', async () => {
      const stored = [createNotificationAddress('1', 'test@example.com')];
      const current = [createAddress('test@example.com')];

      const { result } = renderHook(() => useSaveAddressChanges(stored, current), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.saveChanges();
      });

      expect(mockCreateAddress).not.toHaveBeenCalled();
      expect(mockDeleteAddress).not.toHaveBeenCalled();
    });

    it('should not save when actingParty has no orgNumber', async () => {
      // Override the mock for this specific test
      vi.mocked(usePartyRepresentation).mockReturnValue({
        actingParty: undefined,
        isLoading: false,
        isError: false,
      });

      const stored = [createNotificationAddress('1', 'test@example.com')];
      const current = [createAddress('test2@example.com')];

      const { result } = renderHook(() => useSaveAddressChanges(stored, current), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.saveChanges();
      });

      expect(mockCreateAddress).not.toHaveBeenCalled();
      expect(mockDeleteAddress).not.toHaveBeenCalled();
    });

    it('should handle successful save operations', async () => {
      mockCreateAddress.mockResolvedValueOnce({ data: {} });
      mockDeleteAddress.mockResolvedValueOnce({ data: {} });

      const stored = [createNotificationAddress('1', 'old@example.com')];
      const current = [createAddress('new@example.com')];

      const { result } = renderHook(() => useSaveAddressChanges(stored, current), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        result.current.saveChanges();
      });

      expect(mockDeleteAddress).toHaveBeenCalledWith({
        orgNumber: '123456789',
        notificationAddressId: '1',
      });
      expect(mockCreateAddress).toHaveBeenCalledWith({
        orgNumber: '123456789',
        address: {
          email: 'new@example.com',
          phone: '',
          countryCode: '',
          notificationAddressId: '',
        },
      });
    });

    it('should handle API errors correctly', async () => {
      mockCreateAddress.mockResolvedValueOnce({ error: 'API Error' });

      const stored: NotificationAddress[] = [];
      const current = [createAddress('new@example.com')];

      const { result } = renderHook(() => useSaveAddressChanges(stored, current), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        result.current.saveChanges();
      });

      expect(result.current.isError).toBe(true);
    });

    it('should handle promise rejections correctly', async () => {
      mockCreateAddress.mockRejectedValueOnce(new Error('Network error'));

      const stored: NotificationAddress[] = [];
      const current = [createAddress('new@example.com')];

      const { result } = renderHook(() => useSaveAddressChanges(stored, current), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        result.current.saveChanges();
      });

      expect(result.current.isError).toBe(true);
    });

    it('should filter out empty addresses when saving', async () => {
      mockCreateAddress.mockResolvedValueOnce({ data: {} });

      const stored: NotificationAddress[] = [];
      const current = [
        createAddress('test@example.com'),
        createAddress('', '', ''), // empty address should be filtered out
        createAddress('', '12345678', '+47'),
      ];

      const { result } = renderHook(() => useSaveAddressChanges(stored, current), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        result.current.saveChanges();
      });

      expect(mockCreateAddress).toHaveBeenCalledTimes(2); // Only non-empty addresses
      expect(mockCreateAddress).toHaveBeenCalledWith({
        orgNumber: '123456789',
        address: {
          email: 'test@example.com',
          phone: '',
          countryCode: '',
          notificationAddressId: '',
        },
      });
      expect(mockCreateAddress).toHaveBeenCalledWith({
        orgNumber: '123456789',
        address: { email: '', phone: '12345678', countryCode: '+47', notificationAddressId: '' },
      });
    });

    it('should properly identify addresses to add and remove', async () => {
      mockCreateAddress.mockResolvedValueOnce({ data: {} });
      mockDeleteAddress.mockResolvedValueOnce({ data: {} });

      const stored = [
        createNotificationAddress('1', 'keep@example.com'),
        createNotificationAddress('2', 'remove@example.com'),
      ];
      const current = [
        createAddress('keep@example.com', '', '', '1'), // Keep existing with ID
        createAddress('add@example.com'), // New address without ID
      ];

      const { result } = renderHook(() => useSaveAddressChanges(stored, current), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        result.current.saveChanges();
      });

      expect(mockDeleteAddress).toHaveBeenCalledTimes(1);
      expect(mockDeleteAddress).toHaveBeenCalledWith({
        orgNumber: '123456789',
        notificationAddressId: '2',
      });

      expect(mockCreateAddress).toHaveBeenCalledTimes(1);
      expect(mockCreateAddress).toHaveBeenCalledWith({
        orgNumber: '123456789',
        address: {
          email: 'add@example.com',
          phone: '',
          countryCode: '',
          notificationAddressId: '',
        },
      });
    });

    it('should properly identify addresses to update', async () => {
      mockUpdateAddress.mockResolvedValueOnce({ data: {} });

      const stored = [createNotificationAddress('1', 'original@example.com')];
      const current = [
        createAddress('updated@example.com', '', '', '1'), // Same ID, different email = update
      ];

      const { result } = renderHook(() => useSaveAddressChanges(stored, current), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        result.current.saveChanges();
      });

      expect(mockUpdateAddress).toHaveBeenCalledTimes(1);
      expect(mockUpdateAddress).toHaveBeenCalledWith({
        orgNumber: '123456789',
        address: {
          email: 'updated@example.com',
          phone: '',
          countryCode: '',
          notificationAddressId: '1',
        },
      });

      expect(mockCreateAddress).not.toHaveBeenCalled();
      expect(mockDeleteAddress).not.toHaveBeenCalled();
    });
  });
});
