import { useEffect, useMemo, useRef, useState } from 'react';
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
import { useGetInstancesQuery, useRemoveInstanceMutation } from '@/rtk/features/instanceApi';
import { useGetResourceQuery } from '@/rtk/features/resourceApi';
import { useProviderLogoUrl } from '@/resources/hooks';
import {
  PartyType,
  useGetIsAdminQuery,
  useGetIsInstanceAdminQuery,
} from '@/rtk/features/userInfoApi';
import { getAfUrl } from '@/resources/utils/pathUtils';
import { CheckmarkIcon, EnvelopeClosedIcon } from '@navikt/aksel-icons';
import { DelegationAction, EditModal } from '../common/DelegationModal/EditModal';
import type { ActionError } from '@/resources/hooks/useActionError';
import type { UserActionTarget } from '../common/UserSearch/types';
import { AddUserButton } from './AddUserModal';

import classes from './InstanceDetailPageContent.module.css';

export const InstanceDetailPageContent = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { actingParty, fromParty } = usePartyRepresentation();

  const modalRef = useRef<HTMLDialogElement>(null);
  const [selectedUser, setSelectedUser] = useState<UserActionTarget | null>(null);
  const [selectedUserMode, setSelectedUserMode] = useState<'edit' | 'delegate'>('edit');
  const [actionError, setActionError] = useState<ActionError | null>(null);
  const [removeInstance, { isLoading: isRevoking }] = useRemoveInstanceMutation();

  useEffect(() => {
    if (selectedUser && modalRef.current) {
      modalRef.current.showModal();
    }
  }, [selectedUser]);

  const handleUserSelect = (user: UserActionTarget) => {
    setActionError(null);
    setSelectedUserMode('edit');
    setSelectedUser(user);
  };

  const handleIndirectUserDelegate = (user: UserActionTarget) => {
    setActionError(null);
    setSelectedUserMode('delegate');
    setSelectedUser(user);
  };

  const handleRevoke = (user: UserActionTarget) => {
    if (!actingParty?.partyUuid || !fromParty?.partyUuid) return;
    removeInstance({
      party: actingParty.partyUuid,
      from: fromParty.partyUuid,
      to: user.id,
      resource: resourceId,
      instance: instanceUrn,
    })
      .unwrap()
      .then(() => {
        setSelectedUser(null);
        setActionError(null);
      })
      .catch(() => {
        setActionError({
          httpStatus: 'unknown',
          timestamp: new Date().toISOString(),
        });
        setSelectedUserMode('edit');
        setSelectedUser(user);
      });
  };

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
    isAdminError || isInstanceAdminError || isInstancesError || resourceError
      ? createErrorDetails(
          instancesError || isAdminErrorObj || isInstanceAdminErrorObj || resourceError,
        )
      : null;

  const providerLogoUrl = resource?.resourceOwnerOrgcode
    ? getProviderLogoUrl(resource.resourceOwnerOrgcode)
    : undefined;
  const selectedUserAvailableActions =
    selectedUserMode === 'delegate'
      ? [DelegationAction.DELEGATE]
      : [DelegationAction.REVOKE, DelegationAction.DELEGATE];

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
            <UserSearch
              includeSelfAsChild={false}
              AddUserButton={InstanceAddUserButton}
              users={users}
              indirectUsers={indirectUsers}
              isLoading={
                isInstancesLoading || isLoadingIndirectConnections || isInstanceAdminLoading
              }
              isActionLoading={isFetchingIndirectConnections || isRevoking}
              canDelegate
              noUsersText={t('instance_detail_page.no_users')}
              onDelegate={handleIndirectUserDelegate}
              onSelect={handleUserSelect}
              onRevoke={handleRevoke}
            />
          ) : isInstanceAdmin ? (
            <InstanceAddUserButton isLarge />
          ) : null}
        </div>
      )}
      {resource && selectedUser && (
        <EditModal
          ref={modalRef}
          resource={resource}
          instance={{ instanceUrn }}
          toParty={{
            partyUuid: selectedUser.id,
            name: selectedUser.name,
            partyTypeName:
              selectedUser.type === 'person' ? PartyType.Person : PartyType.Organization,
          }}
          openWithError={actionError}
          onSuccess={() => modalRef.current?.close()}
          onClose={() => {
            setSelectedUser(null);
            setActionError(null);
          }}
          availableActions={selectedUserAvailableActions}
        />
      )}
    </>
  );
};
