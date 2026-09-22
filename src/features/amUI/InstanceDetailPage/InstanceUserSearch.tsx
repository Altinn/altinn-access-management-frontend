import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { DsAlert, DsParagraph } from '@altinn/altinn-components';

import UserSearch from '../common/UserSearch/UserSearch';
import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { ConnectionUserType } from '@/rtk/features/connectionApi';
import type { UserActionTarget, UserSearchNode } from '../common/UserSearch/types';
import { AddUserButton } from './AddUserModal';

interface InstanceUserSearchProps {
  resourceId: string;
  instanceUrn: string;
  /*** Users that already have access to the instance */
  users: UserSearchNode[];
  /*** Users that can be given access to the instance */
  indirectUsers: UserSearchNode[];
  isLoading?: boolean;
  isActionLoading?: boolean;
  error?: FetchBaseQueryError | SerializedError;
  /*** Which actions the acting party is allowed to perform is decided by the
   * callbacks given: an action is hidden when its callback is left out */
  onSelect?: (user: UserActionTarget) => void;
  onDelegate?: (user: UserActionTarget) => void;
  onRevoke?: (user: UserActionTarget) => void;
  restoreFocusFallbackId?: string;
}

// An organization is only worth listing as indirect if someone can be delegated through it
const hasDelegatableUsers = (user: UserSearchNode) =>
  user.type !== ConnectionUserType.Organization || (user.children?.length ?? 0) > 0;

/**
 * The user list of the instance detail page. Fetching is left to the callers
 * (InstanceUsersAsAdmin / InstanceUsersAsInstanceAdmin), as admins and instance
 * admins read the users from different endpoints.
 */
export const InstanceUserSearch = ({
  resourceId,
  instanceUrn,
  users,
  indirectUsers,
  isLoading = false,
  isActionLoading = false,
  error,
  onSelect,
  onDelegate,
  onRevoke,
  restoreFocusFallbackId,
}: InstanceUserSearchProps) => {
  const { t } = useTranslation();

  const errorDetails = createErrorDetails(error);

  const delegatableIndirectUsers = useMemo(
    () => indirectUsers.filter(hasDelegatableUsers),
    [indirectUsers],
  );

  return (
    <>
      {errorDetails && (
        <DsAlert
          role='alert'
          data-color='danger'
        >
          <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
          <TechnicalErrorParagraphs
            size='sm'
            status={errorDetails.status}
            time={errorDetails.time}
            traceId={errorDetails.traceId}
          />
        </DsAlert>
      )}
      <UserSearch
        includeSelfAsChild={false}
        includeSelfAsChildOnIndirect={false}
        restoreFocusFallbackId={restoreFocusFallbackId}
        AddUserButton={
          <AddUserButton
            resourceId={resourceId}
            instanceUrn={instanceUrn}
          />
        }
        users={users}
        indirectUsers={delegatableIndirectUsers}
        isLoading={isLoading}
        isActionLoading={isActionLoading}
        canDelegate
        noUsersText={t('instance_detail_page.no_users')}
        directConnectionsHeading={t('instance_detail_page.direct_connections')}
        indirectConnectionsHeading={t('instance_detail_page.indirect_connections')}
        searchPlaceholder={t('instance_detail_page.search_placeholder')}
        onDelegate={onDelegate}
        onSelect={onSelect}
        onRevoke={onRevoke}
      />
    </>
  );
};
