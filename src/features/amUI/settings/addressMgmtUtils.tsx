import { useState } from 'react';

import { useAppDispatch } from '@/rtk/app/hooks';
import {
  type Address,
  type NotificationAddress,
  settingsApi,
  useCreateOrgNotificationAddressMutation,
  useDeleteOrgNotificationAddressMutation,
  useUpdateOrgNotificationAddressMutation,
} from '@/rtk/features/settingsApi';
import {
  validateEmail,
  validatePhoneNumber,
  validateCountryCode,
} from '@/resources/utils/textFieldUtils';

import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';

export type AddressRow = NotificationAddress & { errorKey?: string };

export const COUNTRY_CODE_ERROR_KEY = 'text_field_errors.invalid_country_code';
const ADDRESS_ALREADY_EXISTS_KEY = 'settings_page.address_already_exists';
const GENERIC_ERROR_KEY = 'settings_page.error_saving_addresses';
const ADDRESS_NOT_FOUND_CODE = 'STUI-00006';

const rowErrorKeys: Record<string, string> = {
  'STUI-00000': 'text_field_errors.invalid_email_pattern',
  'STUI-00001': 'text_field_errors.invalid_phone',
  'STUI-00002': COUNTRY_CODE_ERROR_KEY,
  'STUI-00004': ADDRESS_ALREADY_EXISTS_KEY,
};

const generalErrorKeys: Record<string, string> = {
  'STUI-00003': 'settings_page.organization_not_in_er',
  'STUI-00005': 'settings_page.no_addresses_error',
  [ADDRESS_NOT_FOUND_CODE]: 'settings_page.address_not_found',
  'STUI-00007': 'settings_page.not_authorized_error',
};

const getErrorCode = (error: unknown) =>
  (error as { data?: { code?: string } } | undefined)?.data?.code ?? '';

export const addressIsEmpty = (address: Address) => !address.email && !address.phone;

export const addressIsEqual = (stored: NotificationAddress, current: NotificationAddress) =>
  (stored.email === current.email || (!stored.email && !current.email)) &&
  (stored.phone === current.phone || (!stored.phone && !current.phone)) &&
  (stored.countryCode === current.countryCode || (!stored.countryCode && !current.countryCode));

export const hasDeletions = (stored: NotificationAddress[], current: NotificationAddress[]) => {
  return stored.length > current.length;
};

export const hasAdditions = (stored: NotificationAddress[], current: NotificationAddress[]) => {
  return (
    stored.length <
    current.filter((addr) => addr.email?.length > 0 || addr.phone?.length > 0).length
  );
};

export const hasEdits = (stored: NotificationAddress[], current: NotificationAddress[]) => {
  return stored.some((addr, index) => !addressIsEqual(addr, current[index]));
};

export const hasChanges = (stored: NotificationAddress[], current: NotificationAddress[]) =>
  (current.length === 0 && !!stored[0]) ||
  hasAdditions(stored, current) ||
  hasDeletions(stored, current) ||
  hasEdits(stored, current);

export const getAddressErrorKey = (
  address: NotificationAddress,
  stored: NotificationAddress[] = [],
): string | undefined => {
  // Stored addresses can predate the rules in Core and must not stop other changes from being saved
  if (addressIsEmpty(address) || stored.some((s) => addressIsEqual(s, address))) {
    return undefined;
  }

  if (address.email) {
    const validation = validateEmail(address.email);
    return validation.isValid ? undefined : validation.errorMessageKey;
  }

  const countryCodeValidation = validateCountryCode(address.countryCode);
  if (!countryCodeValidation.isValid) {
    return countryCodeValidation.errorMessageKey;
  }

  const phoneValidation = validatePhoneNumber(address.phone, address.countryCode);
  return phoneValidation.isValid ? undefined : phoneValidation.errorMessageKey;
};

export const isValidAddresses = (
  addresses: NotificationAddress[],
  stored: NotificationAddress[] = [],
) => addresses.every((address) => !getAddressErrorKey(address, stored));

const getDuplicateKey = (address: NotificationAddress) =>
  address.email ? address.email.toLowerCase() : `${address.countryCode}${address.phone}`;

export const withDuplicateErrors = (rows: AddressRow[]): AddressRow[] => {
  const seen = new Set<string>();
  return rows.map((row) => {
    if (addressIsEmpty(row)) {
      return row;
    }
    const key = getDuplicateKey(row);
    if (seen.has(key)) {
      return { ...row, errorKey: ADDRESS_ALREADY_EXISTS_KEY };
    }
    seen.add(key);
    return row;
  });
};

export const getAddressChanges = <T extends NotificationAddress>(
  stored: NotificationAddress[],
  current: T[],
) => {
  // Empty addresses can indicate deletions, but not additions
  const filteredCurrent = current.filter((row) => !addressIsEmpty(row));
  const additions = filteredCurrent.filter(
    (row) => !row.notificationAddressId && !stored.some((s) => addressIsEqual(s, row)),
  );
  const updates = filteredCurrent.filter((row) => {
    if (!row.notificationAddressId) {
      return false;
    }
    const storedRow = stored.find((s) => s.notificationAddressId === row.notificationAddressId);
    return !storedRow || !addressIsEqual(storedRow, row);
  });
  const deletions = stored.filter(
    (s) =>
      !filteredCurrent.some(
        (row) =>
          row.notificationAddressId === s.notificationAddressId ||
          (!row.notificationAddressId && addressIsEqual(s, row)),
      ),
  );

  return { additions, updates, deletions };
};

const toAddress = ({ notificationAddressId, email, phone, countryCode }: AddressRow) => ({
  notificationAddressId,
  email,
  phone,
  countryCode,
});

export const useSaveAddressChanges = (
  storedAddresses: NotificationAddress[],
  addressList: AddressRow[],
  setAddressList: (rows: AddressRow[]) => void,
) => {
  const isChanges = hasChanges(storedAddresses, addressList);
  const [isSaving, setIsSaving] = useState(false);
  const [generalErrorKey, setGeneralErrorKey] = useState<string>();
  const dispatch = useAppDispatch();
  const { actingParty } = usePartyRepresentation();
  const [createAddress] = useCreateOrgNotificationAddressMutation();
  const [deleteAddress] = useDeleteOrgNotificationAddressMutation();
  const [updateAddress] = useUpdateOrgNotificationAddressMutation();

  const saveChanges = async () => {
    const orgNumber = actingParty?.organizationIdentifier;
    if (isSaving || !isChanges || !orgNumber) {
      return;
    }

    setGeneralErrorKey(undefined);
    const rows = withDuplicateErrors(addressList.map((row) => ({ ...row, errorKey: undefined })));
    if (rows.some((row) => row.errorKey)) {
      setAddressList(rows);
      return;
    }

    setIsSaving(true);
    let generalError: string | undefined;

    const handleError = (error: unknown, row?: AddressRow) => {
      const code = getErrorCode(error);
      if (row && rowErrorKeys[code]) {
        row.errorKey = rowErrorKeys[code];
        return;
      }
      generalError = generalErrorKeys[code] ?? GENERIC_ERROR_KEY;
      if (row && code === ADDRESS_NOT_FOUND_CODE) {
        row.notificationAddressId = ''; // Removed by someone else, so saving again must create it
      }
    };

    const { additions, updates, deletions } = getAddressChanges(storedAddresses, rows);

    try {
      // New addresses go first so the organization is never left without one, and deletions
      // before updates so a row can take over an address that is removed in the same save
      let additionFailed = false;
      for (const row of additions) {
        const result = await createAddress({ orgNumber, address: toAddress(row) });
        if ('error' in result) {
          additionFailed = true;
          handleError(result.error, row);
        } else {
          row.notificationAddressId = result.data.notificationAddressId;
        }
      }
      if (!additionFailed) {
        for (const address of deletions) {
          const result = await deleteAddress({
            orgNumber,
            notificationAddressId: address.notificationAddressId,
          });
          if ('error' in result) {
            handleError(result.error);
          }
        }
      }
      for (const row of updates) {
        const result = await updateAddress({ orgNumber, address: toAddress(row) });
        if ('error' in result) {
          handleError(result.error, row);
        } else {
          row.notificationAddressId = result.data.notificationAddressId;
        }
      }
    } catch {
      generalError = GENERIC_ERROR_KEY;
    }

    setAddressList(rows);
    setGeneralErrorKey(generalError);
    setIsSaving(false);
    dispatch(settingsApi.util.invalidateTags(['NotificationAddress']));
  };

  return { isChanges, saveChanges, isSaving, generalErrorKey, setGeneralErrorKey };
};
