import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  UserType,
  useGetPartyByUUIDQuery,
  useGetUserByUUIDQuery,
} from '@/rtk/features/lookup/lookupApi';

// Used for fetching recipient name from userUUID or partyUUID
export const useFetchNameFromUUID = (
  userUUID: string | null,
  partyUUID: string | null,
): [name: string | undefined, error: boolean, isLoading: boolean] => {
  const { t } = useTranslation('common');

  const [recipientName, setRecipientName] = useState<string | undefined>(undefined);
  const [error, setError] = useState(false);

  const {
    data: user,
    error: getUserError,
    isLoading: getUserIsLoading,
  } = useGetUserByUUIDQuery(userUUID ?? '', { skip: userUUID === null });
  const {
    data: party,
    error: getPartyError,
    isLoading: getPartyIsLoading,
  } = useGetPartyByUUIDQuery(partyUUID ?? '', { skip: partyUUID === null || userUUID !== null });

  const isLoading = getUserIsLoading || getPartyIsLoading;

  useEffect(() => {
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
            setRecipientName(`${user.userName}, ${t('common.org_nr')} ${user.party.orgNumber}`);
            break;
          default:
            // Recipient is of a type that cannot be delegated to
            setError(true);
        }
      }
    } else if (partyUUID && !getPartyIsLoading) {
      if (getPartyError) {
        setError(true);
      } else {
        setError(false);
        setRecipientName(`${party?.name}, ${t('common.org_nr')} ${party?.orgNumber}`);
      }
    } else if (!isLoading) {
      // No UUID given
      setError(true);
    }
  }, [user, party, getUserIsLoading, getPartyIsLoading, getUserError, getPartyError]);

  return [recipientName, error, isLoading];
};
