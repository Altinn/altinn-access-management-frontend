import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DialogListItem,
  DsAlert,
  DsParagraph,
  List,
  type DialogListItemProps,
} from '@altinn/altinn-components';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { DebouncedSearchField } from '../common/DebouncedSearchField/DebouncedSearchField';
import { InstanceDelegation, useGetInstancesQuery } from '@/rtk/features/instanceApi';
import { useProviderLogoUrl } from '@/resources/hooks';
import { displayInstanceDelegation } from '@/resources/utils/featureFlagUtils';
import { InstancePermissionsSkeleton } from './InstancePermissionsSkeleton';

const toInstanceListItem = (
  instanceDelegation: InstanceDelegation,
  getProviderLogoUrl: (orgCode: string) => string | undefined,
): DialogListItemProps => {
  const { instance, resource } = instanceDelegation;
  const providerLogoUrl = resource.resourceOwnerOrgcode
    ? getProviderLogoUrl(resource.resourceOwnerOrgcode)
    : undefined;
  const dialogItemId = `${resource.identifier}-${instance.urn}`;
  const shortId = instance.urn.slice(-10);

  return {
    id: dialogItemId,
    title: resource.title,
    description: `${instance.urn} ${resource.title}`,
    sender: {
      name: resource.resourceOwnerName,
      type: 'company',
      imageUrl: providerLogoUrl ?? resource.resourceOwnerLogoUrl,
      imageUrlAlt: resource.resourceOwnerName,
      colorKey: resource.resourceOwnerOrgcode,
    },
    updatedAt: instance.urn,
    updatedAtLabel: shortId,
  };
};

export const InstancePermissions = () => {
  const { t } = useTranslation();
  const { actingParty, fromParty } = usePartyRepresentation();
  const [debouncedSearchString, setDebouncedSearchString] = useState('');
  const hasSearch = debouncedSearchString.trim().length > 0;
  const showInstanceDelegation = displayInstanceDelegation();

  const {
    data: instances,
    isLoading,
    isError,
  } = useGetInstancesQuery(
    {
      party: actingParty?.partyUuid || '',
      from: fromParty?.partyUuid || '',
    },
    {
      skip: !showInstanceDelegation || !actingParty?.partyUuid || !fromParty?.partyUuid,
    },
  );

  const { getProviderLogoUrl } = useProviderLogoUrl();
  const filteredInstances = useMemo(() => {
    const instanceList = instances ?? [];

    if (!hasSearch) {
      return instanceList;
    }

    const normalizedSearch = debouncedSearchString.trim().toLowerCase();

    return instanceList.filter((instanceDelegation) =>
      [instanceDelegation.resource.title, instanceDelegation.resource.resourceOwnerName]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [debouncedSearchString, hasSearch, instances]);

  if (!showInstanceDelegation) {
    return null;
  }

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
    <>
      <DebouncedSearchField
        placeholder={t('poa_overview_page.instances_tab.search_label')}
        setDebouncedSearchString={setDebouncedSearchString}
      />
      {isLoading ? (
        <InstancePermissionsSkeleton />
      ) : filteredInstances.length > 0 ? (
        <List>
          {filteredInstances.map((instanceDelegation) => {
            const item = toInstanceListItem(instanceDelegation, getProviderLogoUrl);

            return (
              <DialogListItem
                key={item.id}
                size='lg'
                {...item}
              />
            );
          })}
        </List>
      ) : (
        <DsParagraph>
          {hasSearch
            ? t('poa_overview_page.instances_tab.no_search_results')
            : t('poa_overview_page.instances_tab.no_results')}
        </DsParagraph>
      )}
    </>
  );
};
