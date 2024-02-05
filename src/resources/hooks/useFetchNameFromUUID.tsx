import { useState } from 'react';

import {
  UserType,
  useGetPartyByUUIDQuery,
  useGetUserByUUIDQuery,
} from '@/rtk/features/lookup/lookupApi';

import { useUpdate } from './useUpdate';

// Used for fetching recipient name from userUUID or partyUUID
export const useFetchNameFromUUID = (
  userUUID?: string,
  partyUUID?: string,
): [name: string | undefined, error: boolean, isLoading: boolean] => {
  const [recipientName, setRecipientName] = useState<string | undefined>(undefined);
  const [error, setError] = useState(false);
  const {
    data: user,
    error: getUserError,
    isLoading: getUserIsLoading,
  } = useGetUserByUUIDQuery(userUUID ?? '');
  const {
    data: party,
    error: getPartyError,
    isLoading: getPartyIsLoading,
  } = useGetPartyByUUIDQuery(partyUUID ?? '');

  const isLoading = getUserIsLoading || getPartyIsLoading;

  useUpdate(() => {
    if (userUUID && !getUserIsLoading) {
      if (getUserError) {
        setError(true);
      } else {
        switch (user?.userType) {
          case UserType.SSNIdentified:
            // Recipient is a person
            setError(false);
            setRecipientName(user.party.name);
            break;
          case UserType.EnterpriseIdentified:
            // Recipient is an enterprize user
            setError(false);
            setRecipientName(`${user.userName} (${user.party.orgNumber})`);
            break;
          default:
            // Recipient is null or is of a type that cannot be delegated to
            setError(true);
        }
      }
    } else if (partyUUID && !getPartyIsLoading) {
      // Fetch party from getParty query
      if (getPartyError) {
        setError(true);
      } else {
        setError(false);
        setRecipientName(`${party?.name} (${party?.orgNumber})`);
      }
    } else if (!isLoading) {
      // No UUID given -> Display Error
      setError(true);
    }
  }, [user, party, getUserIsLoading, getPartyIsLoading]);

  return [recipientName, error, isLoading];
};
