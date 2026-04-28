import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert } from '@altinn/altinn-components';

import type { MaskinportenConnection } from '@/rtk/features/maskinportenApi';

import { mapMaskinportenConnectionsToUserSearchNodes } from '../common/UserSearch/connectionMapper';
import { UserSearch, UserSearchProps } from '../common/UserSearch/UserSearch';

interface MaskinportenUserSearchProps extends Pick<
  UserSearchProps,
  | 'searchPlaceholder'
  | 'canDelegate'
  | 'addUserButtonLabel'
  | 'AddUserButton'
  | 'isLoading'
  | 'titleAs'
> {
  connections?: MaskinportenConnection[];
  emptyText?: UserSearchProps['noUsersText'];
  error: unknown;
}

export const MaskinportenUserSearch = ({
  connections,
  error,
  emptyText,
  ...props
}: MaskinportenUserSearchProps) => {
  const { t } = useTranslation();
  const users = useMemo(
    () => mapMaskinportenConnectionsToUserSearchNodes(connections),
    [connections],
  );

  if (error) {
    return <DsAlert data-color='danger'>{t('maskinporten_page.load_error')}</DsAlert>;
  }

  return (
    <UserSearch
      users={users}
      searchPlaceholder={t('common.search')}
      titleAs='h2'
      noUsersText={emptyText}
      includeSelfAsChild={false}
      {...props}
    />
  );
};
