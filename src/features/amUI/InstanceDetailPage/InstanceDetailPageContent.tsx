import { useMemo } from 'react';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
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
import { mapPermissionsToUserSearchNodes } from '../common/UserSearch/permissionMapper';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { useGetInstancesQuery } from '@/rtk/features/instanceApi';
import { useGetResourceQuery } from '@/rtk/features/resourceApi';
import { useProviderLogoUrl } from '@/resources/hooks';
import { PartyType } from '@/rtk/features/userInfoApi';
import { getAfUrl } from '@/resources/utils/pathUtils';
import { EnvelopeClosedIcon } from '@navikt/aksel-icons';

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
    data: resource,
    isLoading: isResourceLoading,
    isError: isResourceError,
    error: resourceError,
  } = useGetResourceQuery(resourceId, {
    skip: !resourceId,
  });

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
        users={users}
        isLoading={isInstancesLoading}
        canDelegate={false}
        noUsersText={t('instance_detail_page.no_users', {
          fromparty: formatDisplayName({
            fullName: fromParty?.name ?? '',
            type: fromParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
          }),
        })}
      />
    </>
  );
};
