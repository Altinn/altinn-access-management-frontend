import { useMemo, useRef, useState } from 'react';
import {
  DsAlert,
  DsButton,
  DsHeading,
  DsParagraph,
  formatDisplayName,
  Icon,
} from '@altinn/altinn-components';
import { Navigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';

import UserSearch from '../common/UserSearch/UserSearch';
import { ResourceInfoSkeleton } from '../common/DelegationModal/SingleRights/ResourceInfoSkeleton';
import { mapConnectionsToUserSearchNodes } from '../common/UserSearch/connectionMapper';
import { mapPermissionsToUserSearchNodes } from '../common/UserSearch/permissionMapper';
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
import { PartyType, useGetIsAdminQuery } from '@/rtk/features/userInfoApi';
import { getAfUrl } from '@/resources/utils/pathUtils';
import { EnvelopeClosedIcon } from '@navikt/aksel-icons';

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
  const { data: isAdmin = false, isLoading: isAdminLoading } = useGetIsAdminQuery();

  const {
    data: resource,
    isLoading: isResourceLoading,
    isError: isResourceError,
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
      skip: !actingParty?.partyUuid || !fromParty?.partyUuid || !resourceId || !instanceUrn,
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

  const { data: indirectConnections, isLoading: isIndirectLoading } = useGetRightHoldersQuery(
    {
      partyUuid: fromParty?.partyUuid ?? '',
      fromUuid: fromParty?.partyUuid ?? '',
      toUuid: '',
    },
    {
      skip: !fromParty?.partyUuid || !isAdmin,
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
  const isInstanceAdmin = delegateActionKeys.length > 0;
  const canDelegate = isAdmin || isInstanceAdmin;

  if (!resourceId || !instanceUrn) {
    return (
      <Navigate
        to='/not-found'
        replace
      />
    );
  }

  if (isInstancesError || isResourceError) {
    const technicalError = createErrorDetails(resourceError || instancesError);
    return (
      <DsAlert
        role='alert'
        data-color='danger'
      >
        <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
        {technicalError && (
          <TechnicalErrorParagraphs
            size='sm'
            status={technicalError.status}
            time={technicalError.time}
            traceId={technicalError.traceId}
          />
        )}
      </DsAlert>
    );
  }

  if (isInstancesLoading || (isResourceLoading && !resource)) {
    return <ResourceInfoSkeleton />;
  }

  const providerLogoUrl = resource?.resourceOwnerOrgcode
    ? getProviderLogoUrl(resource.resourceOwnerOrgcode)
    : undefined;

  const handleOnDelegate = (user: UserActionTarget) => {
    setSelectedUser(user);
    modalRef.current?.showModal();
  };

  return (
    <>
      <div className={classes.infoHeading}>
        <DsHeading
          level={1}
          data-size='sm'
        >
          {resource?.title ?? resourceId}
        </DsHeading>
        {resource && (
          <>
            <div className={classes.resourceOwner}>
              <Icon
                iconUrl={providerLogoUrl ?? resource.resourceOwnerLogoUrl}
                size='sm'
              />
              <DsParagraph data-size='sm'>
                {resource.resourceOwnerName}{' '}
                <span className={classes.providerName}>
                  {t('instance_detail_page.provider_name', {
                    name: formatDisplayName({
                      fullName: fromParty?.name ?? '',
                      type: fromParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
                    }),
                  })}
                </span>
              </DsParagraph>
            </div>
            {resource.description && (
              <DsParagraph data-size='sm'>{resource.description}</DsParagraph>
            )}
          </>
        )}
      </div>
      {inboxUrl ? (
        <div className={classes.inboxLinkContainer}>
          <DsButton
            asChild
            variant='secondary'
            className={classes.inboxButton}
          >
            <a href={inboxUrl}>
              <EnvelopeClosedIcon />
              {t('instance_detail_page.back_to_inbox')}
            </a>
          </DsButton>
        </div>
      ) : null}
      <UserSearch
        includeSelfAsChild={false}
        AddUserButton={HideAddUserButton}
        showIndirectConnectionsByDefault
        users={users}
        indirectUsers={indirectUsers}
        isLoading={isInstancesLoading || isIndirectLoading || isAdminLoading}
        onDelegate={canDelegate ? handleOnDelegate : undefined}
        canDelegate={canDelegate}
        noUsersText={t('instance_detail_page.no_users', {
          fromparty: formatDisplayName({
            fullName: fromParty?.name ?? '',
            type: fromParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
          }),
        })}
      />
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
