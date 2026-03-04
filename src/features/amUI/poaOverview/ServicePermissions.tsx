import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsParagraph } from '@altinn/altinn-components';

import { ResourceList } from '../common/ResourceList/ResourceList';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import {
  ServiceResource,
  useGetDelegatedResourcesByFromOrToQuery,
} from '@/rtk/features/singleRights/singleRightsApi';
import { amUIPath } from '@/routes/paths';

export const ServicePermissions = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { actingParty, fromParty } = usePartyRepresentation();

  const {
    data: delegatedResources,
    isLoading,
    isError,
  } = useGetDelegatedResourcesByFromOrToQuery(
    {
      actingParty: actingParty?.partyUuid || '',
      from: fromParty?.partyUuid || '',
    },
    {
      skip: !actingParty?.partyUuid || !fromParty?.partyUuid,
    },
  );

  const services = useMemo(() => {
    const uniqueResources = new Map<string, ServiceResource>();

    delegatedResources?.forEach((delegation) => {
      const resource = delegation.resource;
      if (!resource) {
        return;
      }

      if (!uniqueResources.has(resource.identifier)) {
        uniqueResources.set(resource.identifier, resource);
      }
    });

    return Array.from(uniqueResources.values());
  }, [delegatedResources]);

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

  return (
    <ResourceList
      isLoading={isLoading}
      resources={services}
      noResourcesText={t('poa_overview_page.services_tab.no_resources')}
      onSelect={(resource) =>
        navigate(
          `/${amUIPath.PoaServiceDetails.replace(':id', encodeURIComponent(resource.identifier))}`,
        )
      }
      showDetails={false}
      size='md'
      titleAs='h3'
    />
  );
};
