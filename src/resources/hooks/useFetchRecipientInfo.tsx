import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { UserType, useGetPartyByUUIDQuery, useGetUserByUUIDQuery } from '@/rtk/features/lookupApi';

// Used for fetching recipient name from userUUID or partyUUID
export const useFetchRecipientInfo = (
  userUUID: string | null,
  partyUUID: string | null,
): {
  name: string | undefined;
  userID: string;
  partyID: string;
  error: boolean;
  isLoading: boolean;
} => {
  const { t } = useTranslation();

  const [recipientName, setRecipientName] = useState<string | undefined>(undefined);
  const [userID, setUserID] = useState('');
  const [partyID, setPartyID] = useState('');
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
      if (getUserError || !user) {
        setError(true);
      } else {
        setUserID(user.userId);
        setPartyID(String(user.party.partyId));
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
    } else if (!userUUID && partyUUID && !getPartyIsLoading) {
      if (getPartyError || !party) {
        setError(true);
      } else {
        setError(false);
        setPartyID(String(party.partyId));
        setRecipientName(`${party?.name}, ${t('common.org_nr')} ${party?.orgNumber}`);
      }
    } else if (!isLoading) {
      // No UUID given
      setError(true);
    }
  }, [user, party, getUserIsLoading, getPartyIsLoading, getUserError, getPartyError]);

  return { name: recipientName, userID, partyID, error, isLoading };
};
