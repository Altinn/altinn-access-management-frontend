import React from 'react';
import {
  Address,
  NotificationAddress,
  useCreateOrgNotificationAddressMutation,
  useDeleteOrgNotificationAddressMutation,
} from '@/rtk/features/settingsApi';
import { useState } from 'react';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import {
  validateEmail,
  validatePhoneNumber,
  validateCountryCode,
} from '@/resources/utils/textFieldUtils';

const addressIsEqual = (stored: NotificationAddress, current: Address) =>
  (stored.email === current.email || (!stored.email && !current.email)) &&
  (stored.phone === current.phone || (!stored.phone && !current.phone)) &&
  (stored.countryCode === current.countryCode || (!stored.countryCode && !current.countryCode));

export const hasDeletions = (stored: NotificationAddress[], current: Address[]) => {
  return stored.length > current.length;
};

export const hasAdditions = (stored: NotificationAddress[], current: Address[]) => {
  return (
    stored.length < current.filter((addr) => addr.email.length > 0 || addr.phone.length > 0).length
  );
};

export const hasEdits = (stored: NotificationAddress[], current: Address[]) => {
  return stored.some((addr, index) => !addressIsEqual(addr, current[index]));
};

export const hasChanges = (stored: NotificationAddress[], current: Address[]) =>
  (current.length === 0 && !!stored[0]) ||
  hasAdditions(stored, current) ||
  hasDeletions(stored, current) ||
  hasEdits(stored, current);

export const isValidAddresses = (addresses: Address[]) => {
  return addresses
    .filter((address) => address.email.length > 0 || address.phone.length > 0)
    .every((address) => {
      return (
        (address.email.length > 0 && validateEmail(address.email).isValid) ||
        (address.phone.length > 0 &&
          validatePhoneNumber(address.phone).isValid &&
          validateCountryCode(address.countryCode).isValid)
      );
    });
};

export const useSaveAddressChanges = (
  storedAddresses: NotificationAddress[],
  addressList: Address[],
) => {
  const isChanges = hasChanges(storedAddresses, addressList);
  const [isSaving, setIsSaving] = useState(false);
  const [isError, setIsError] = useState(false);
  const { actingParty } = usePartyRepresentation();
  const [createAddress] = useCreateOrgNotificationAddressMutation();
  const [deleteAddress] = useDeleteOrgNotificationAddressMutation();

  const saveChanges = () => {
    if (isSaving) {
      return; // Prevent multiple simultaneous saves
    }

    if (isChanges && actingParty?.orgNumber) {
      setIsSaving(true);
      setIsError(false); // Reset error state

      // Empty addresses can indicate deletions, but not additions
      const filteredChanges = addressList.filter(
        (addr) => addr.email.length > 0 || addr.phone.length > 0,
      );
      const toRemove = storedAddresses.filter(
        (stored) => !addressList.some((current) => addressIsEqual(stored, current)),
      );
      const toAdd = filteredChanges.filter(
        (current) => !storedAddresses.some((stored) => addressIsEqual(stored, current)),
      );

      // Delete outdated addresses and add new ones
      Promise.all([
        ...toRemove.map((address) =>
          deleteAddress({
            orgNumber: actingParty?.orgNumber ?? '',
            notificationAddressId: address.notificationAddressId,
          }),
        ),
        ...toAdd.map((address) =>
          createAddress({ orgNumber: actingParty?.orgNumber ?? '', address: address }),
        ),
      ])
        .then((results) => {
          // Check if any of the results contain errors
          const hasError = results.some((result) => 'error' in result);
          if (hasError) {
            setIsError(true);
          }
        })
        .catch(() => {
          // Fallback for any unexpected promise rejections
          setIsError(true);
        })
        .finally(() => {
          setIsSaving(false);
        });
    }
  };

  return { isChanges, saveChanges, isSaving, isError };
};
