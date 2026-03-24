import { ElementType, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DialogListItem,
  DsParagraph,
  List,
  type DialogListItemProps,
} from '@altinn/altinn-components';

import { DebouncedSearchField } from '../DebouncedSearchField/DebouncedSearchField';
import { InstanceDelegation } from '@/rtk/features/instanceApi';
import { useProviderLogoUrl } from '@/resources/hooks';

import { InstanceListSkeleton } from './InstanceListSkeleton';
import { EnvelopeClosedIcon } from '@navikt/aksel-icons';
import { getAfUrl } from '@/resources/utils/pathUtils';

interface InstanceListProps {
  instances: InstanceDelegation[];
  isLoading?: boolean;
  getItemAs?: (item: InstanceDelegation) => ElementType | undefined;
  onSelect?: (instance: InstanceDelegation) => void;
  interactive?: boolean;
}

const toInstanceListItem = (
  instanceDelegation: InstanceDelegation,
  getProviderLogoUrl: (orgCode: string) => string | undefined,
): DialogListItemProps => {
  const { instance, resource } = instanceDelegation;
  const providerLogoUrl = resource.resourceOwnerOrgcode
    ? getProviderLogoUrl(resource.resourceOwnerOrgcode)
    : undefined;
  const dialogItemId = `${resource.identifier}-${instance.refId}`;
  const shortId = instance.refId.slice(-10);

  return {
    id: dialogItemId,
    title: resource.title ?? resource.identifier,
    description: `${instance.refId} ${resource.title}`,
    sender: {
      name: resource.resourceOwnerName ?? '',
      type: 'company',
      imageUrl: providerLogoUrl ?? resource.resourceOwnerLogoUrl ?? undefined,
      imageUrlAlt: resource.resourceOwnerName ?? '',
    },
    updatedAt: instance.refId,
    updatedAtLabel: shortId,
  };
};

export const InstanceList = ({
  instances,
  isLoading = false,
  getItemAs,
  onSelect,
  interactive,
}: InstanceListProps) => {
  const { t } = useTranslation();
  const [debouncedSearchString, setDebouncedSearchString] = useState('');
  const hasSearch = debouncedSearchString.trim().length > 0;

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

  return (
    <>
      <DebouncedSearchField
        placeholder={t('poa_overview_page.instances_tab.search_label')}
        setDebouncedSearchString={setDebouncedSearchString}
      />
      {isLoading ? (
        <InstanceListSkeleton />
      ) : filteredInstances.length > 0 ? (
        <List>
          {filteredInstances.map((instanceDelegation) => {
            const item = toInstanceListItem(instanceDelegation, getProviderLogoUrl);

            const Component = getItemAs?.(instanceDelegation);
            const isCorrespondenceInstance = instanceDelegation.instance.refId.startsWith(
              'urn:altinn:correspondence-id:',
            );
            const inboxUrl = `${getAfUrl()}redirect?instanceUrn=${encodeURIComponent(instanceDelegation.instance.refId)}`;

            return (
              <DialogListItem
                key={item.id}
                size='md'
                as={Component ?? (onSelect ? 'button' : undefined)}
                interactive={interactive || !!onSelect}
                onClick={onSelect ? () => onSelect(instanceDelegation) : undefined}
                {...item}
                controls={
                  !isCorrespondenceInstance && (
                    <Button
                      variant='tertiary'
                      rounded
                      size={'xs'}
                      as='a'
                      href={inboxUrl}
                    >
                      <EnvelopeClosedIcon aria-hidden='true' />{' '}
                      {t('instance_detail_page.see_in_inbox')}
                    </Button>
                  )
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
    </>
  );
};
