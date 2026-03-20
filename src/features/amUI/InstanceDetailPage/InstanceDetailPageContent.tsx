import { useMemo } from 'react';
import { DsAlert, DsButton, DsParagraph } from '@altinn/altinn-components';
import { Navigate, useSearchParams } from 'react-router';
import { Trans, useTranslation } from 'react-i18next';

import { InstanceDetailHeader } from './InstanceDetailHeader';
import { ResourceInfoSkeleton } from '../common/DelegationModal/SingleRights/ResourceInfoSkeleton';
import { PageDivider } from '../common/PageDivider/PageDivider';
import UserSearch from '../common/UserSearch/UserSearch';
import { mapPermissionsToUserSearchNodes } from '../common/UserSearch/permissionMapper';
import { mapConnectionsToUserSearchNodes } from '../common/UserSearch/connectionMapper';
import {
  mapSimplifiedPartiesToUserSearchNodes,
  mapSimplifiedConnectionsToUserSearchNodes,
} from '../common/UserSearch/simplifiedMapper';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { useGetRightHoldersQuery, useGetAvailableUsersQuery } from '@/rtk/features/connectionApi';
import { useGetInstancesQuery, useGetInstanceUsersQuery } from '@/rtk/features/instanceApi';
import { useGetResourceQuery } from '@/rtk/features/resourceApi';
import { useProviderLogoUrl } from '@/resources/hooks';
import {
  useGetIsAdminQuery,
  useGetIsClientAdminQuery,
  useGetIsInstanceAdminQuery,
} from '@/rtk/features/userInfoApi';
import { getAfUrl } from '@/resources/utils/pathUtils';
import { AddUserButton } from './AddUserModal';
import { CheckmarkIcon, EnvelopeClosedIcon } from '@navikt/aksel-icons';

import classes from './InstanceDetailPageContent.module.css';

export const InstanceDetailPageContent = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { actingParty, fromParty } = usePartyRepresentation();

  const { getProviderLogoUrl } = useProviderLogoUrl();
  const instanceUrn = searchParams.get('instanceUrn') ?? '';
  const resourceId = searchParams.get('resourceId') ?? '';
  const dialogId = searchParams.get('dialogId');

  const {
    data: isAdmin,
    isLoading: isAdminLoading,
    isError: isAdminError,
    error: isAdminErrorObj,
  } = useGetIsAdminQuery();

  const {
    data: isInstanceAdmin,
    isLoading: isInstanceAdminLoading,
    isError: isInstanceAdminError,
    error: isInstanceAdminErrorObj,
  } = useGetIsInstanceAdminQuery();

  // Whether to use limited endpoints: isInstanceAdmin, but not full isAdmin
  const useLimitedEndpoints = !isAdmin && isInstanceAdmin;

  // --- Full endpoints (isAdmin) ---

  const {
    data: instances = [],
    isLoading: isInstancesLoading,
    isError: isInstancesError,
    error: instancesError,
  } = useGetInstancesQuery(
    {
      party: actingParty?.partyUuid || '',
      from: fromParty?.partyUuid,
      resource: resourceId,
      instance: instanceUrn,
    },
    {
      skip:
        !isAdmin || !actingParty?.partyUuid || !fromParty?.partyUuid || !resourceId || !instanceUrn,
    },
  );

  const adminUsers = useMemo(
    () =>
      mapPermissionsToUserSearchNodes(
        instances.flatMap((instanceDelegation) => instanceDelegation.permissions),
        {
          fromPartyUuid: fromParty?.partyUuid,
        },
      ),
    [fromParty?.partyUuid, instances],
  );

  const {
    data: indirectConnections,
    isLoading: isLoadingIndirectConnections,
    isFetching: isFetchingIndirectConnections,
  } = useGetRightHoldersQuery(
    {
      partyUuid: fromParty?.partyUuid ?? '',
      fromUuid: fromParty?.partyUuid ?? '',
      toUuid: '',
    },
    {
      skip: !isAdmin || !fromParty?.partyUuid,
    },
  );

  const adminIndirectUsers = useMemo(
    () => mapConnectionsToUserSearchNodes(indirectConnections),
    [indirectConnections],
  );

  // --- Limited endpoints (isInstanceAdmin only) ---
  // These return simplified data when the user lacks full admin access

  const {
    data: instanceUsers,
    isLoading: isInstanceUsersLoading,
    isError: isInstanceUsersError,
    error: instanceUsersError,
  } = useGetInstanceUsersQuery(
    {
      partyUuid: fromParty?.partyUuid ?? '',
      resource: resourceId,
      instance: instanceUrn,
    },
    {
      skip: !useLimitedEndpoints || !fromParty?.partyUuid || !resourceId || !instanceUrn,
    },
  );

  const clientAdminUsers = useMemo(
    () => mapSimplifiedPartiesToUserSearchNodes(instanceUsers),
    [instanceUsers],
  );

  const {
    data: availableUsers,
    isLoading: isAvailableUsersLoading,
    isFetching: isFetchingAvailableUsers,
  } = useGetAvailableUsersQuery(
    {
      partyUuid: fromParty?.partyUuid ?? '',
    },
    {
      skip: !useLimitedEndpoints || !fromParty?.partyUuid,
    },
  );

  const clientAdminIndirectUsers = useMemo(
    () => mapSimplifiedConnectionsToUserSearchNodes(availableUsers),
    [availableUsers],
  );

  // --- Resolved data: pick from the right source based on access level ---

  const users = isAdmin ? adminUsers : clientAdminUsers;
  const indirectUsers = isAdmin ? adminIndirectUsers : clientAdminIndirectUsers;

  const InstanceAddUserButton = useMemo(
    () =>
      ({ isLarge }: { isLarge?: boolean }) => (
        <AddUserButton
          isLarge={isLarge}
          resourceId={resourceId}
          instanceUrn={instanceUrn}
        />
      ),
    [resourceId, instanceUrn],
  );

  const {
    data: resource,
    isLoading: isResourceLoading,
    error: resourceError,
  } = useGetResourceQuery(resourceId, {
    skip: !resourceId,
  });

  if (!resourceId || !instanceUrn) {
    return (
      <Navigate
        to='/not-found'
        replace
      />
    );
  }

  const isCorrespondenceInstance = instanceUrn.startsWith('urn:altinn:correspondence-id:');

  const inboxUrl = dialogId
    ? `${getAfUrl()}inbox/${encodeURIComponent(dialogId)}`
    : `${getAfUrl()}redirect?instanceUrn=${encodeURIComponent(instanceUrn)}`;

  const showInboxLink = dialogId || !isCorrespondenceInstance;

  const inboxLink = showInboxLink ? (
    <div className={classes.inboxLinkContainer}>
      <DsButton
        asChild
        variant={dialogId ? 'primary' : 'secondary'}
        className={classes.inboxButton}
      >
        <a href={inboxUrl}>
          {dialogId ? <CheckmarkIcon aria-hidden /> : <EnvelopeClosedIcon aria-hidden />}
          {dialogId ? t('common.finished') : t('instance_detail_page.see_in_inbox')}
        </a>
      </DsButton>
    </div>
  ) : null;

  if (isResourceLoading || isAdminLoading || isInstanceAdminLoading) {
    return <ResourceInfoSkeleton />;
  }

  const contentTechnicalError =
    isAdminError ||
    isInstanceAdminError ||
    isInstancesError ||
    isInstanceUsersError ||
    resourceError
      ? createErrorDetails(
          instancesError ||
            instanceUsersError ||
            isAdminErrorObj ||
            isInstanceAdminErrorObj ||
            resourceError,
        )
      : null;

  const providerLogoUrl = resource?.resourceOwnerOrgcode
    ? getProviderLogoUrl(resource.resourceOwnerOrgcode)
    : undefined;

  return (
    <>
      {resource && (
        <InstanceDetailHeader
          resource={resource}
          resourceId={resourceId}
          providerLogoUrl={providerLogoUrl}
          fromPartyName={fromParty?.name}
          fromPartyTypeName={fromParty?.partyTypeName}
        />
      )}
      {inboxLink}
      <PageDivider />
      {contentTechnicalError ? (
        <DsAlert
          role='alert'
          data-color='danger'
        >
          <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
          <TechnicalErrorParagraphs
            size='sm'
            status={contentTechnicalError.status}
            time={contentTechnicalError.time}
            traceId={contentTechnicalError.traceId}
          />
        </DsAlert>
      ) : (
        <div className={classes.contentSection}>
          <DsParagraph data-size='sm'>
            {isInstanceAdmin ? (
              t('instance_detail_page.description')
            ) : (
              <Trans
                i18nKey='instance_detail_page.no_access_description'
                components={{ b: <strong /> }}
              />
            )}
          </DsParagraph>
          {isAdmin ? (
            // Full admin: use full endpoints with complete user/permission data
            <UserSearch
              includeSelfAsChild={false}
              AddUserButton={InstanceAddUserButton}
              users={users}
              indirectUsers={indirectUsers}
              isLoading={
                isInstancesLoading || isLoadingIndirectConnections || isInstanceAdminLoading
              }
              isActionLoading={isFetchingIndirectConnections}
              canDelegate
              noUsersText={t('instance_detail_page.no_users')}
            />
          ) : isInstanceAdmin ? (
            // Instance admin: use limited endpoints with simplified user data
            <UserSearch
              includeSelfAsChild={false}
              AddUserButton={InstanceAddUserButton}
              users={users}
              indirectUsers={indirectUsers}
              isLoading={isInstanceUsersLoading || isAvailableUsersLoading}
              isActionLoading={isFetchingAvailableUsers}
              canDelegate
              noUsersText={t('instance_detail_page.no_users')}
            />
          ) : null}
        </div>
      )}
    </>
  );
};
