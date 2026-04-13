import { useEffect, useMemo, useRef, useState } from 'react';
import { DsAlert, DsParagraph } from '@altinn/altinn-components';
import { Navigate, useSearchParams } from 'react-router';
import { Trans, useTranslation } from 'react-i18next';

import { ResourceInfoSkeleton } from '../common/DelegationModal/SingleRights/ResourceInfoSkeleton';
import { PageDivider } from '../common/PageDivider/PageDivider';
import { InstanceUsersAsAdmin } from './InstanceUsersAsAdmin';
import { InstanceUsersAsInstanceAdmin } from './InstanceUsersAsInstanceAdmin';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { useRemoveInstanceMutation, useGetInstancesQuery } from '@/rtk/features/instanceApi';
import { useGetResourceQuery } from '@/rtk/features/resourceApi';
import {
  PartyType,
  useGetIsAdminQuery,
  useGetIsInstanceAdminQuery,
} from '@/rtk/features/userInfoApi';
import { DelegationAction, EditModal } from '../common/DelegationModal/EditModal';
import type { ActionError } from '@/resources/hooks/useActionError';
import type { UserActionTarget } from '../common/UserSearch/types';
import { AddUserButton } from './AddUserModal';
import { InstanceInboxLink } from '../common/InstanceList/InstanceInboxLink';
import { InstanceMetadataSection } from '../common/InstanceMetadataSection/InstanceMetadataSection';

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

  const instanceUrn = searchParams.get('instanceUrn') ?? '';
  const resourceId = searchParams.get('resourceId') ?? '';
  const dialogId = searchParams.get('dialogId');

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
    data: resource,
    isLoading: isResourceLoading,
    error: resourceError,
  } = useGetResourceQuery(resourceId, {
    skip: !resourceId,
  });

  const { data: instanceDelegations, isError: isInstanceDelegationsError } = useGetInstancesQuery(
    {
      party: actingParty?.partyUuid ?? '',
      from: fromParty?.partyUuid,
      instance: instanceUrn,
    },
    { skip: !actingParty?.partyUuid || !fromParty?.partyUuid || !instanceUrn },
  );
  const dialogLookup = instanceDelegations?.[0]?.dialogLookup;
  const instanceData = {
    instance: { refId: instanceUrn, type: null },
    dialogLookup,
  };

  if (!resourceId || !instanceUrn) {
    return (
      <Navigate
        to='/not-found'
        replace
      />
    );
  }

  if (isResourceLoading || isAdminLoading || isInstanceAdminLoading) {
    return <ResourceInfoSkeleton />;
  }

  const contentTechnicalError =
    isAdminError || isInstanceAdminError || resourceError
      ? createErrorDetails(isAdminErrorObj || isInstanceAdminErrorObj || resourceError)
      : null;

  const selectedUserAvailableActions =
    selectedUserMode === 'delegate' || isAdmin === false
      ? [DelegationAction.DELEGATE]
      : [DelegationAction.REVOKE, DelegationAction.DELEGATE];

  return (
    <>
      {resource && !isInstanceDelegationsError && (
        <>
          <InstanceMetadataSection
            resource={resource}
            instanceData={instanceData}
            fromPartyName={fromParty?.name}
            fromPartyType={fromParty?.partyTypeName}
            titleLevel={1}
          />
        </>
      )}
      <div className={classes.inboxLinkContainer}>
        <InstanceInboxLink
          instanceUrn={instanceUrn}
          dialogLookup={dialogLookup}
          dialogId={dialogId}
          isLarge
        />
      </div>
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
          {isInstanceAdmin && isAdmin === false && (
            <DsParagraph data-size='sm'>
              {t('instance_detail_page.instance_admin_edit_disclaimer')}
            </DsParagraph>
          )}
          {isAdmin ? (
            <InstanceUsersAsAdmin
              resourceId={resourceId}
              instanceUrn={instanceUrn}
              AddUserButton={InstanceAddUserButton}
              onSelect={handleUserSelect}
              onDelegate={handleIndirectUserDelegate}
              onRevoke={handleRevoke}
              isRevoking={isRevoking}
            />
          ) : isInstanceAdmin ? (
            <InstanceUsersAsInstanceAdmin
              resourceId={resourceId}
              instanceUrn={instanceUrn}
              AddUserButton={InstanceAddUserButton}
              onDelegate={handleIndirectUserDelegate}
            />
          ) : null}
        </div>
      )}
      {resource && selectedUser && (
        <EditModal
          ref={modalRef}
          resource={resource}
          instance={instanceData}
          toParty={{
            partyUuid: selectedUser.id,
            name: selectedUser.name,
            partyTypeName:
              selectedUser.type === 'person' ? PartyType.Person : PartyType.Organization,
          }}
          openWithError={actionError}
          onSuccess={selectedUserMode === 'delegate' ? () => modalRef.current?.close() : undefined}
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
