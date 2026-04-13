import { ElementType, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DialogListItem,
  DsParagraph,
  List,
  type DialogListItemProps,
} from '@altinn/altinn-components';

import { DebouncedSearchField } from '../DebouncedSearchField/DebouncedSearchField';
import { InstanceDelegation } from '@/rtk/features/instanceApi';
import { useProviderLogoUrl } from '@/resources/hooks';

import { InstanceListSkeleton } from './InstanceListSkeleton';
import type { TFunction } from 'i18next';
import { InstanceInboxLink } from './InstanceInboxLink';
import {
  getInstanceShortId,
  resolveInstanceTitle,
  toInstancePresentationData,
} from './instancePresentation';
import classes from './InstanceList.module.css';

interface InstanceListProps {
  instances: InstanceDelegation[];
  isLoading?: boolean;
  getItemAs?: (item: InstanceDelegation) => ElementType | undefined;
  onSelect?: (instance: InstanceDelegation) => void;
  interactive?: boolean;
}

const getResolvedInstanceTitle = (
  instanceDelegation: InstanceDelegation,
  t: TFunction,
  language: string,
) =>
  resolveInstanceTitle(
    toInstancePresentationData(instanceDelegation),
    instanceDelegation.resource,
    t,
    language,
  );

const toInstanceListItem = (
  instanceDelegation: InstanceDelegation,
  getProviderLogoUrl: (orgCode: string) => string | undefined,
  t: TFunction,
  language: string,
): DialogListItemProps => {
  const { instance, resource } = instanceDelegation;
  const providerLogoUrl = resource.resourceOwnerOrgcode
    ? getProviderLogoUrl(resource.resourceOwnerOrgcode)
    : undefined;
  const dialogItemId = `${resource.identifier}-${instance.refId}`;
  const shortId = getInstanceShortId(instance.refId);
  const title = getResolvedInstanceTitle(instanceDelegation, t, language);

  return {
    id: dialogItemId,
    title,
    description: `${instance.refId} ${title}`,
    sender: {
      name: resource.resourceOwnerName ?? '',
      type: 'company',
      imageUrl: providerLogoUrl ?? resource.resourceOwnerLogoUrl ?? undefined,
      imageUrlAlt: resource.resourceOwnerName ?? '',
    },
    updatedAt: instance.refId,
    updatedAtLabel: `${t('instance_detail_page.instance_id_label')}: ${shortId}`,
    extendedStatusLabel: `${t('instance_detail_page.service_title_label')}: ${resource.title}`,
  };
};

export const InstanceList = ({
  instances,
  isLoading = false,
  getItemAs,
  onSelect,
  interactive,
}: InstanceListProps) => {
  const { t, i18n } = useTranslation();
  const [debouncedSearchString, setDebouncedSearchString] = useState('');
  const hasSearch = debouncedSearchString.trim().length > 0;

  const { getProviderLogoUrl } = useProviderLogoUrl();
  const filteredInstances = useMemo(() => {
    const instanceList = instances ?? [];

    if (!hasSearch) {
      return instanceList;
    }

    const normalizedSearch = debouncedSearchString.trim().toLowerCase();

    return instanceList.filter((instanceDelegation) => {
      const resolvedTitle = getResolvedInstanceTitle(instanceDelegation, t, i18n.language);

      return [
        resolvedTitle,
        instanceDelegation.resource.title,
        instanceDelegation.resource.resourceOwnerName,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [debouncedSearchString, hasSearch, i18n.language, instances, t]);

  return (
    <>
      <DebouncedSearchField
        placeholder={t('poa_overview_page.instances_tab.search_label')}
        setDebouncedSearchString={setDebouncedSearchString}
      />
      <div className={classes.container}>
        {isLoading ? (
          <InstanceListSkeleton />
        ) : filteredInstances.length > 0 ? (
          <List>
            {filteredInstances.map((instanceDelegation) => {
              const item = toInstanceListItem(
                instanceDelegation,
                getProviderLogoUrl,
                t,
                i18n.language,
              );

              const Component = getItemAs?.(instanceDelegation);
              const isSuccess = instanceDelegation.dialogLookup?.status === 'Success';

              return (
                <DialogListItem
                  key={item.id}
                  size='md'
                  as={Component ?? (onSelect ? 'button' : undefined)}
                  interactive={interactive || !!onSelect}
                  onClick={onSelect ? () => onSelect(instanceDelegation) : undefined}
                  className={!isSuccess ? classes.subtleTitle : undefined}
                  {...item}
                  controls={
                    <InstanceInboxLink
                      instanceUrn={instanceDelegation.instance.refId}
                      dialogLookup={instanceDelegation.dialogLookup}
                    />
                  }
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
      </div>
    </>
  );
};
