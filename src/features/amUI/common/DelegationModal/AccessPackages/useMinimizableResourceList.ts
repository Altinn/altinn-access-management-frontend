import * as React from 'react';
import type { ListItemProps } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { MenuElipsisHorizontalIcon } from '@navikt/aksel-icons';

import type { PackageResource } from '@/rtk/features/accessPackageApi';
import { useGetOrgDataQuery } from '@/rtk/features/altinnCdnApi';

const MINIMIZED_LIST_SIZE = 5;

export const useMinimizableResourceList = (list: PackageResource[]) => {
  const { t } = useTranslation();
  const [showAll, setShowAll] = React.useState(false);
  const { data: orgData, isLoading: orgDataIsLoading } = useGetOrgDataQuery();

  const getProviderLogoUrl = (orgCode: string | null): string | undefined => {
    if (!orgData || orgDataIsLoading) {
      return undefined;
    }
    const org = orgCode ? orgData[orgCode] : undefined;
    return org?.emblem ?? org?.logo ?? undefined;
  };

  const mapResourceToListItem = (resource: PackageResource): ListItemProps => {
    const emblem = getProviderLogoUrl(resource.provider?.code ?? '');
    return {
      loading: orgDataIsLoading,
      title: resource.name,
      description: resource.provider.name,
      icon: { iconUrl: emblem ?? resource.provider.logoUrl },
      as: 'div' as React.ElementType,
      size: 'xs',
      interactive: false,
    };
  };

  if (list.length <= MINIMIZED_LIST_SIZE) {
    return {
      listItems: list.map(mapResourceToListItem),
    };
  }
  const showMoreListItem: ListItemProps = {
    title: t('common.show_more'),
    description: '',
    onClick: () => setShowAll(!showAll),
    icon: MenuElipsisHorizontalIcon,
    as: 'button' as React.ElementType,
    size: 'xs',
  };
  const minimizedList = list
    .slice(0, showAll ? list.length : MINIMIZED_LIST_SIZE)
    .map(mapResourceToListItem);
  return { listItems: showAll ? minimizedList : [...minimizedList, showMoreListItem] };
};
