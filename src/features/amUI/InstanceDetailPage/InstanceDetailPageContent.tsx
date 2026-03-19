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
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { useGetRightHoldersQuery } from '@/rtk/features/connectionApi';
import { useGetInstancesQuery } from '@/rtk/features/instanceApi';
import { useGetResourceQuery } from '@/rtk/features/resourceApi';
import { useProviderLogoUrl } from '@/resources/hooks';
import {
  type User,
  useGetIsAdminQuery,
  useGetIsInstanceAdminQuery,
} from '@/rtk/features/userInfoApi';
import { getAfUrl } from '@/resources/utils/pathUtils';
import { CheckmarkIcon } from '@navikt/aksel-icons';
import { AddUserButton as InstanceAddUserButton } from './AddUserModal';

import classes from './InstanceDetailPageContent.module.css';

export const InstanceDetailPageContent = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { actingParty, fromParty } = usePartyRepresentation();

  const { getProviderLogoUrl } = useProviderLogoUrl();
  const instanceUrn = searchParams.get('instanceUrn') ?? '';
  const resourceId = searchParams.get('resourceId') ?? searchParams.get('resourceID') ?? '';
  const dialogId = searchParams.get('dialogId');
  const inboxUrl = dialogId ? `${getAfUrl()}inbox/${encodeURIComponent(dialogId)}` : undefined;

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
        !isInstanceAdmin ||
        !actingParty?.partyUuid ||
        !fromParty?.partyUuid ||
        !resourceId ||
        !instanceUrn,
    },
  );

  const users = useMemo(
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

  const indirectUsers = useMemo(
    () => mapConnectionsToUserSearchNodes(indirectConnections),
    [indirectConnections],
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

  const inboxLink = inboxUrl ? (
    <div className={classes.inboxLinkContainer}>
      <DsButton
        asChild
        variant='primary'
        className={classes.inboxButton}
      >
        <a href={inboxUrl}>
          <CheckmarkIcon aria-hidden />
          {t('common.finished')}
        </a>
      </DsButton>
    </div>
  ) : null;

  if (isResourceLoading || isAdminLoading || isInstanceAdminLoading) {
    return <ResourceInfoSkeleton />;
  }

  const contentTechnicalError =
    isAdminError || isInstanceAdminError || isInstancesError || resourceError
      ? createErrorDetails(
          instancesError || isAdminErrorObj || isInstanceAdminErrorObj || resourceError,
        )
      : null;

  const providerLogoUrl = resource?.resourceOwnerOrgcode
    ? getProviderLogoUrl(resource.resourceOwnerOrgcode)
    : undefined;

  const AddInstanceUserButton: React.FC<{
    isLarge?: boolean;
    onComplete?: (user: User) => void;
  }> = ({ isLarge }) => (
    <InstanceAddUserButton
      isLarge={isLarge}
      resourceId={resourceId}
      instanceUrn={instanceUrn}
      onComplete={(draft) => {
        console.log('Add instance user draft:', draft);
      }}
    />
  );

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
          {isInstanceAdmin && (
            <UserSearch
              includeSelfAsChild={false}
              AddUserButton={AddInstanceUserButton}
              users={users}
              indirectUsers={indirectUsers}
              isLoading={
                isInstancesLoading || isLoadingIndirectConnections || isInstanceAdminLoading
              }
              isActionLoading={isFetchingIndirectConnections}
              canDelegate
              noUsersText={t('instance_detail_page.no_users')}
            />
          )}
        </div>
      )}
    </>
  );
};
