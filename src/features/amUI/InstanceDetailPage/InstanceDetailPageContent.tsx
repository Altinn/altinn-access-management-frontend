import { useMemo, useRef, useState } from 'react';
import { DsAlert, DsButton, DsParagraph } from '@altinn/altinn-components';
import { Navigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';

import { InstanceDetailHeader } from './InstanceDetailHeader';
import { ResourceInfoSkeleton } from '../common/DelegationModal/SingleRights/ResourceInfoSkeleton';
import { PageDivider } from '../common/PageDivider/PageDivider';
import UserSearch from '../common/UserSearch/UserSearch';
import { mapPermissionsToUserSearchNodes } from '../common/UserSearch/permissionMapper';
import { mapConnectionsToUserSearchNodes } from '../common/UserSearch/connectionMapper';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import type { UserActionTarget } from '../common/UserSearch/types';
import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { useGetRightHoldersQuery } from '@/rtk/features/connectionApi';
import { useGetInstancesQuery, useInstanceDelegationCheckQuery } from '@/rtk/features/instanceApi';
import { useGetResourceQuery } from '@/rtk/features/resourceApi';
import { useProviderLogoUrl } from '@/resources/hooks';
import { useGetIsAdminQuery, useGetIsInstanceAdminQuery } from '@/rtk/features/userInfoApi';
import { getAfUrl } from '@/resources/utils/pathUtils';
import { CheckmarkIcon } from '@navikt/aksel-icons';

import classes from './InstanceDetailPageContent.module.css';
import { InstanceDelegationModal } from './InstanceDelegationModal';

const HideAddUserButton = () => null;

export const InstanceDetailPageContent = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const { actingParty, fromParty } = usePartyRepresentation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [selectedUser, setSelectedUser] = useState<UserActionTarget | null>(null);

  const { getProviderLogoUrl } = useProviderLogoUrl();
  const instanceUrn = searchParams.get('instanceUrn') ?? '';
  const resourceId = searchParams.get('resourceId') ?? searchParams.get('resourceID') ?? '';
  const dialogId = searchParams.get('dialogId');
  const inboxUrl = dialogId ? `${getAfUrl()}inbox/${encodeURIComponent(dialogId)}` : undefined;

  const {
    data: isAdmin = false,
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
    data: resource,
    isLoading: isResourceLoading,
    error: resourceError,
  } = useGetResourceQuery(
    {
      resourceId,
      language: i18n.language,
    },
    {
      skip: !resourceId,
    },
  );

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

  const { data: delegationCheckResults = [] } = useInstanceDelegationCheckQuery(
    {
      party: fromParty?.partyUuid || '',
      resource: resourceId,
      instance: instanceUrn,
    },
    {
      skip: !fromParty?.partyUuid || !resourceId || !instanceUrn,
    },
  );

  const {
    data: indirectConnections,
    isLoading: isIndirectLoading,
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

  const delegateActionKeys = useMemo(
    () => delegationCheckResults.filter((right) => right.result).map((right) => right.right.key),
    [delegationCheckResults],
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

  const indirectUsers = useMemo(
    () => mapConnectionsToUserSearchNodes(indirectConnections),
    [indirectConnections],
  );

  const canDelegate = isAdmin || (isInstanceAdmin && delegateActionKeys.length > 0);

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

  const handleOnDelegate = (user: UserActionTarget) => {
    setSelectedUser(user);
    modalRef.current?.showModal();
  };

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
      ) : isInstanceAdmin ? (
        <UserSearch
          includeSelfAsChild={false}
          AddUserButton={HideAddUserButton}
          showIndirectConnectionsByDefault
          users={users}
          indirectUsers={indirectUsers}
          isLoading={isInstancesLoading || isIndirectLoading || isAdminLoading}
          isActionLoading={isFetchingIndirectConnections}
          onDelegate={canDelegate ? handleOnDelegate : undefined}
          canDelegate={canDelegate}
          noUsersText={t('instance_detail_page.no_users')}
        />
      ) : (
        <DsParagraph data-size='sm'>
          {t('instance_detail_page.cannot_share_with_others')}
        </DsParagraph>
      )}
      <InstanceDelegationModal
        ref={modalRef}
        resource={resource}
        instanceUrn={instanceUrn}
        actingPartyUuid={actingParty?.partyUuid}
        fromPartyUuid={fromParty?.partyUuid}
        toPartyUuid={selectedUser?.id}
        onClose={() => setSelectedUser(null)}
      />
    </>
  );
};
