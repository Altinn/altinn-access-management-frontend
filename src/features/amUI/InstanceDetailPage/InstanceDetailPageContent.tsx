import { useMemo } from 'react';
import { Avatar, DsAlert, DsHeading, DsParagraph, Icon } from '@altinn/altinn-components';
import { Navigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';

import UserSearch from '../common/UserSearch/UserSearch';
import { ResourceInfoSkeleton } from '../common/DelegationModal/SingleRights/ResourceInfoSkeleton';
import { mapPermissionsToUserSearchNodes } from '../common/UserSearch/permissionMapper';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { useGetInstancesQuery } from '@/rtk/features/instanceApi';
import { useProviderLogoUrl } from '@/resources/hooks';

import classes from './InstanceDetailPageContent.module.css';

export const InstanceDetailPageContent = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { actingParty, fromParty } = usePartyRepresentation();

  const { getProviderLogoUrl } = useProviderLogoUrl();
  const instanceUrn = searchParams.get('instanceUrn') ?? '';
  const resourceId = searchParams.get('resourceID') ?? '';

  const {
    data: instances = [],
    isLoading,
    isError,
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

  const instanceDelegation = instances[0] ?? null;

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

  if (isError) {
    return (
      <DsAlert
        role='alert'
        data-color='danger'
      >
        <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
      </DsAlert>
    );
  }

  if (!isLoading && instances.length === 0) {
    return (
      <Navigate
        to='/not-found'
        replace
      />
    );
  }

  if (isLoading || !instanceDelegation) {
    return <ResourceInfoSkeleton />;
  }

  const providerLogoUrl = instanceDelegation.resource.resourceOwnerOrgcode
    ? getProviderLogoUrl(instanceDelegation.resource.resourceOwnerOrgcode)
    : undefined;

  return (
    <>
      <div className={classes.infoHeading}>
        <DsHeading
          level={1}
          data-size='sm'
        >
          {instanceDelegation.resource.title}
        </DsHeading>
        <div className={classes.resourceOwner}>
          <Icon
            iconUrl={providerLogoUrl ?? instanceDelegation.resource.resourceOwnerLogoUrl}
            size='sm'
          />
          <DsParagraph>
            {instanceDelegation.resource.resourceOwnerName}{' '}
            <span className={classes.providerName}>til {fromParty?.name}</span>
          </DsParagraph>
        </div>
        {instanceDelegation.resource.description && (
          <>
            <DsParagraph data-size='sm'>{instanceDelegation.resource?.description}</DsParagraph>
          </>
        )}
      </div>
      <UserSearch
        includeSelfAsChild={false}
        users={users}
        isLoading={isLoading}
        canDelegate={false}
      />
    </>
  );
};
