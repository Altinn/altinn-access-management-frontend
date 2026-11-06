import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import React from 'react';

import { PartyType } from '@/dataObjects/dtos/Party';
import type { NotificationAddress } from '@/rtk/features/settingsApi';
import { settingsApi } from '@/rtk/features/settingsApi';

import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';

import type { AddressRow } from './addressMgmtUtils';
import {
  getAddressChanges,
  getAddressErrorKey,
  hasDeletions,
  hasAdditions,
  hasEdits,
  hasChanges,
  isValidAddresses,
  useSaveAddressChanges,
  withDuplicateErrors,
} from './addressMgmtUtils';

// Mock the PartyRepresentation hook
vi.mock('../common/PartyRepresentationContext/PartyRepresentationContext', () => ({
  usePartyRepresentation: vi.fn(),
}));

// Mock the validation functions
vi.mock('@/resources/utils/textFieldUtils', () => ({
  validateEmail: vi.fn((email: string) => {
    const isValid = email.includes('@') && email.includes('.');
    return { isValid, errorMessageKey: isValid ? '' : 'invalid_email' };
  }),
  validatePhoneNumber: vi.fn((phone: string) => {
    const isValid = phone.length >= 8 && /^\d+$/.test(phone);
    return { isValid, errorMessageKey: isValid ? '' : 'invalid_phone' };
  }),
  validateCountryCode: vi.fn((countryCode: string) => {
    const isValid = countryCode.length >= 2 && countryCode.length <= 3;
    return { isValid, errorMessageKey: isValid ? '' : 'invalid_country_code' };
  }),
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
        id: 'test-uuid-123',
        organizationIdentifier: '123456789',
        name: 'Test Organization',
        type: PartyType.Organization,
        isDeleted: false,
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

  describe('getAddressErrorKey', () => {
    it('should return the key from the failing validator', () => {
      expect(getAddressErrorKey(createAddress('invalid-email'))).toBe('invalid_email');
      expect(getAddressErrorKey(createAddress('', '123', '+47'))).toBe('invalid_phone');
      expect(getAddressErrorKey(createAddress('', '12345678', 'X'))).toBe('invalid_country_code');
    });

    it('should not report empty rows', () => {
      expect(getAddressErrorKey(createAddress('', '', '+47'))).toBeUndefined();
    });

    it('should not report stored addresses that predate the current rules', () => {
      const stored = [createNotificationAddress('1', '', '123', '+47')];

      expect(getAddressErrorKey(createAddress('', '123', '+47', '1'), stored)).toBeUndefined();
      expect(isValidAddresses([createAddress('', '123', '+47', '1')], stored)).toBe(true);
    });
  });

  describe('withDuplicateErrors', () => {
    it('should mark the later of two equal emails regardless of case', () => {
      const rows = withDuplicateErrors([
        createAddress('Same@example.com'),
        createAddress('same@example.com'),
        createAddress('other@example.com'),
      ]);

      expect(rows.map((row) => row.errorKey)).toEqual([
        undefined,
        'settings_page.address_already_exists',
        undefined,
      ]);
    });

    it('should compare phone numbers together with the country code', () => {
      const rows = withDuplicateErrors([
        createAddress('', '12345678', '+47'),
        createAddress('', '12345678', '+46'),
        createAddress('', '12345678', '+47'),
      ]);

      expect(rows.map((row) => row.errorKey)).toEqual([
        undefined,
        undefined,
        'settings_page.address_already_exists',
      ]);
    });

    it('should ignore empty rows', () => {
      const rows = withDuplicateErrors([createAddress(), createAddress()]);

      expect(rows.map((row) => row.errorKey)).toEqual([undefined, undefined]);
    });
  });

  describe('getAddressChanges', () => {
    it('should update a row that takes over the value of a removed row', () => {
      const stored = [
        createNotificationAddress('1', 'a@example.com'),
        createNotificationAddress('2', 'b@example.com'),
      ];
      const current = [createAddress('b@example.com', '', '', '1')];

      const { additions, updates, deletions } = getAddressChanges(stored, current);

      expect(additions).toEqual([]);
      expect(updates).toEqual(current);
      expect(deletions).toEqual([stored[1]]);
    });

    it('should not delete an address that is typed again in a new row', () => {
      const stored = [createNotificationAddress('1', 'a@example.com')];
      const current = [createAddress('a@example.com')];

      const { additions, updates, deletions } = getAddressChanges(stored, current);

      expect(additions).toEqual([]);
      expect(updates).toEqual([]);
      expect(deletions).toEqual([]);
    });

    it('should treat an emptied row as a deletion', () => {
      const stored = [createNotificationAddress('1', 'a@example.com')];

      const { deletions } = getAddressChanges(stored, [createAddress('', '', '', '1')]);

      expect(deletions).toEqual(stored);
    });
  });

  describe('useSaveAddressChanges', () => {
    const setAddressList = vi.fn();

    const renderSave = (stored: NotificationAddress[], current: AddressRow[]) =>
      renderHook(() => useSaveAddressChanges(stored, current, setAddressList), {
        wrapper: TestWrapper,
      });

    const save = async (stored: NotificationAddress[], current: AddressRow[]) => {
      const { result } = renderSave(stored, current);
      await act(async () => {
        await result.current.saveChanges();
      });
      return result;
    };

    const problem = (code: string) => ({ error: { status: 400, data: { code } } });

    const savedRows = () => setAddressList.mock.lastCall?.[0] as AddressRow[];

    it('should detect changes correctly', () => {
      const { result } = renderSave(
        [createNotificationAddress('1', 'test@example.com')],
        [createAddress('test2@example.com')],
      );

      expect(result.current.isChanges).toBe(true);
    });

    it('should detect no changes correctly', () => {
      const { result } = renderSave(
        [createNotificationAddress('1', 'test@example.com')],
        [createAddress('test@example.com')],
      );

      expect(result.current.isChanges).toBe(false);
    });

    it('should initialize with correct default state', () => {
      const { result } = renderSave([], []);

      expect(result.current.isSaving).toBe(false);
      expect(result.current.generalErrorKey).toBeUndefined();
      expect(result.current.isChanges).toBe(false);
    });

    it('should not save when there are no changes', async () => {
      await save(
        [createNotificationAddress('1', 'test@example.com')],
        [createAddress('test@example.com')],
      );

      expect(mockCreateAddress).not.toHaveBeenCalled();
      expect(mockDeleteAddress).not.toHaveBeenCalled();
    });

    it('should not save when actingParty has no orgNumber', async () => {
      vi.mocked(usePartyRepresentation).mockReturnValue({
        actingParty: undefined,
        isLoading: false,
        isError: false,
      });

      await save(
        [createNotificationAddress('1', 'test@example.com')],
        [createAddress('test2@example.com')],
      );

      expect(mockCreateAddress).not.toHaveBeenCalled();
      expect(mockDeleteAddress).not.toHaveBeenCalled();
    });

    it('should not send anything when two rows have the same address', async () => {
      await save(
        [createNotificationAddress('1', 'a@example.com')],
        [createAddress('a@example.com', '', '', '1'), createAddress('A@example.com')],
      );

      expect(mockCreateAddress).not.toHaveBeenCalled();
      expect(savedRows()[1].errorKey).toBe('settings_page.address_already_exists');
    });

    it('should filter out empty addresses when saving', async () => {
      mockCreateAddress.mockResolvedValue({ data: { notificationAddressId: 9 } });

      await save(
        [],
        [
          createAddress('test@example.com'),
          createAddress('', '', ''),
          createAddress('', '12345678', '+47'),
        ],
      );

      expect(mockCreateAddress).toHaveBeenCalledTimes(2);
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

    it('should add, then delete, then update', async () => {
      const calls: string[] = [];
      mockCreateAddress.mockImplementation(() => {
        calls.push('create');
        return Promise.resolve({ data: { notificationAddressId: 9 } });
      });
      mockDeleteAddress.mockImplementation(() => {
        calls.push('delete');
        return Promise.resolve({ data: {} });
      });
      mockUpdateAddress.mockImplementation(() => {
        calls.push('update');
        return Promise.resolve({ data: { notificationAddressId: 1 } });
      });

      await save(
        [
          createNotificationAddress('1', 'edit@example.com'),
          createNotificationAddress('2', 'remove@example.com'),
        ],
        [createAddress('edited@example.com', '', '', '1'), createAddress('add@example.com')],
      );

      expect(calls).toEqual(['create', 'delete', 'update']);
      expect(mockDeleteAddress).toHaveBeenCalledWith({
        orgNumber: '123456789',
        notificationAddressId: '2',
      });
      expect(mockUpdateAddress).toHaveBeenCalledWith({
        orgNumber: '123456789',
        address: {
          email: 'edited@example.com',
          phone: '',
          countryCode: '',
          notificationAddressId: '1',
        },
      });
    });

    it('should give saved rows their new id and report no errors', async () => {
      mockCreateAddress.mockResolvedValueOnce({ data: { notificationAddressId: 9 } });

      const result = await save([], [createAddress('new@example.com')]);

      expect(savedRows()[0].notificationAddressId).toBe(9);
      expect(savedRows()[0].errorKey).toBeUndefined();
      expect(result.current.generalErrorKey).toBeUndefined();
    });

    it.each([
      ['STUI-00000', 'text_field_errors.invalid_email_pattern'],
      ['STUI-00001', 'text_field_errors.invalid_phone'],
      ['STUI-00002', 'text_field_errors.invalid_country_code'],
    ])('should show %s on the row that failed', async (code, expectedKey) => {
      mockCreateAddress
        .mockResolvedValueOnce({ data: { notificationAddressId: 9 } })
        .mockResolvedValueOnce(problem(code));

      const result = await save(
        [],
        [createAddress('ok@example.com'), createAddress('bad@example.com')],
      );

      expect(savedRows()[0].errorKey).toBeUndefined();
      expect(savedRows()[1].errorKey).toBe(expectedKey);
      expect(result.current.generalErrorKey).toBeUndefined();
    });

    it('should show a conflict on update on the row that failed', async () => {
      mockUpdateAddress.mockResolvedValueOnce(problem('STUI-00004'));

      await save(
        [createNotificationAddress('1', 'a@example.com')],
        [createAddress('b@example.com', '', '', '1')],
      );

      expect(savedRows()[0].errorKey).toBe('settings_page.address_already_exists');
    });

    it.each([
      ['STUI-00003', 'settings_page.organization_not_in_er'],
      ['STUI-00007', 'settings_page.not_authorized_error'],
      ['STUI-00099', 'settings_page.error_saving_addresses'],
      ['', 'settings_page.error_saving_addresses'],
    ])('should show %s as a general error', async (code, expectedKey) => {
      mockCreateAddress.mockResolvedValueOnce(problem(code));

      const result = await save([], [createAddress('new@example.com')]);

      expect(result.current.generalErrorKey).toBe(expectedKey);
      expect(savedRows()[0].errorKey).toBeUndefined();
    });

    it('should show the last address conflict as a general error', async () => {
      mockDeleteAddress.mockResolvedValueOnce(problem('STUI-00005'));

      const result = await save(
        [createNotificationAddress('1', 'a@example.com')],
        [createAddress('', '', '', '1')],
      );

      expect(result.current.generalErrorKey).toBe('settings_page.no_addresses_error');
    });

    it('should not delete anything when a new address fails', async () => {
      mockCreateAddress.mockResolvedValueOnce(problem('STUI-00000'));

      await save(
        [createNotificationAddress('1', 'old@example.com')],
        [createAddress('new@example.com')],
      );

      expect(mockDeleteAddress).not.toHaveBeenCalled();
    });

    it('should create an address again when it was removed by someone else', async () => {
      mockUpdateAddress.mockResolvedValueOnce(problem('STUI-00006'));

      const result = await save(
        [createNotificationAddress('1', 'a@example.com')],
        [createAddress('b@example.com', '', '', '1')],
      );

      expect(result.current.generalErrorKey).toBe('settings_page.address_not_found');
      expect(savedRows()[0].notificationAddressId).toBe('');
      expect(savedRows()[0].email).toBe('b@example.com');
    });

    it('should show a general error when a mutation rejects', async () => {
      mockCreateAddress.mockRejectedValueOnce(new Error('Network error'));

      const result = await save([], [createAddress('new@example.com')]);

      expect(result.current.generalErrorKey).toBe('settings_page.error_saving_addresses');
      expect(result.current.isSaving).toBe(false);
    });

    it('should not send the row error to the api', async () => {
      mockCreateAddress.mockResolvedValueOnce({ data: { notificationAddressId: 9 } });

      await save([], [{ ...createAddress('new@example.com'), errorKey: 'stale_error' }]);

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
  });
});
