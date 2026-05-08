import { DsButton, DsHeading, DsParagraph } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import {
  useAddMaskinportenResourceMutation,
  useGetMaskinportenResourcesQuery,
  useMaskinportenResourceDelegationCheckQuery,
  useRemoveMaskinportenResourceMutation,
} from '@/rtk/features/maskinportenApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import { ResourceHeading } from '../common/DelegationModal/SingleRights/ResourceHeading';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import classes from './MaskinportenScopeInfo.module.css';

export const MaskinportenScopeInfo = ({ resource }: { resource: ServiceResource }) => {
  const { t } = useTranslation();
  const { fromParty, toParty } = usePartyRepresentation();
  const [addResource, { isLoading: isAddingResource }] = useAddMaskinportenResourceMutation();
  const [removeResource, { isLoading: isRemovingResource }] =
    useRemoveMaskinportenResourceMutation();
  const scopes =
    resource.resourceReferences?.filter(
      (reference) => reference.referenceType === 'MaskinportenScope' && reference.reference?.trim(),
    ) ?? [];
  const supplier = toParty?.orgNumber ?? '';

  const { data: delegationCheck, isFetching: isDelegationCheckLoading } =
    useMaskinportenResourceDelegationCheckQuery(
      {
        party: fromParty?.partyUuid,
        resource: resource.identifier,
      },
      {
        skip: !fromParty?.partyUuid || !resource.identifier,
        refetchOnMountOrArgChange: true,
      },
    );
  const { data: delegatedResources, isFetching: isDelegatedResourcesLoading } =
    useGetMaskinportenResourcesQuery(
      {
        party: fromParty?.partyUuid,
        supplier,
        resource: resource.identifier,
      },
      {
        skip: !fromParty?.partyUuid || !supplier || !resource.identifier,
        refetchOnMountOrArgChange: true,
      },
    );
  const canDelegateResource = delegationCheck?.rights?.some((right) => right.result) ?? false;
  const hasDelegatedResource =
    delegatedResources?.some(
      (delegatedResource) => delegatedResource.resource?.identifier === resource.identifier,
    ) ?? false;

  const handleAddResource = async () => {
    if (!fromParty?.partyUuid || !supplier || !resource.identifier || !canDelegateResource) {
      return;
    }

    await addResource({
      party: fromParty.partyUuid,
      supplier,
      resource: resource.identifier,
    }).unwrap();
  };

  const handleRemoveResource = async () => {
    if (!fromParty?.partyUuid || !supplier || !resource.identifier || !hasDelegatedResource) {
      return;
    }

    await removeResource({
      party: fromParty.partyUuid,
      supplier,
      resource: resource.identifier,
    }).unwrap();
  };

  return (
    <div className={classes.container}>
      <ResourceHeading resource={resource} />
      <div className={classes.description}>
        {resource.description && <DsParagraph>{resource.description}</DsParagraph>}
        {resource.rightDescription && <DsParagraph>{resource.rightDescription}</DsParagraph>}
      </div>
      <div className={classes.scopes}>
        <DsHeading
          level={4}
          data-size='2xs'
        >
          {t('api_delegation.scopes')}
        </DsHeading>
        {scopes.length > 0 ? (
          <ul className={classes.scopeList}>
            {scopes.map((scope) => (
              <li key={`${scope.reference}`}>{scope.reference}</li>
            ))}
          </ul>
        ) : (
          <DsParagraph>{t('maskinporten_page.no_scopes')}</DsParagraph>
        )}
      </div>
      {hasDelegatedResource ? (
        <DsButton
          data-color='danger'
          data-size='sm'
          disabled={isDelegatedResourcesLoading || isRemovingResource}
          onClick={handleRemoveResource}
          variant='tertiary'
        >
          {t('maskinporten_page.remove_service_button')}
        </DsButton>
      ) : (
        <DsButton
          data-size='sm'
          disabled={
            !canDelegateResource ||
            isDelegationCheckLoading ||
            isDelegatedResourcesLoading ||
            isAddingResource
          }
          onClick={handleAddResource}
        >
          {t('maskinporten_page.delegate_service_button')}
        </DsButton>
      )}
    </div>
  );
};
