import { useTranslation } from 'react-i18next';
import { DsHeading } from '@altinn/altinn-components';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import { ResourceList } from '../../ResourceList/ResourceList';

interface RoleResourcesSectionProps {
  roleResources?: ServiceResource[];
  isLoading: boolean;
}

export const RoleResourcesSection = ({ roleResources, isLoading }: RoleResourcesSectionProps) => {
  const { t } = useTranslation();

  return (
    <>
      <DsHeading
        level={3}
        data-size='xs'
      >
        {t('role.resources_title', {
          count: roleResources?.length ?? 0,
        })}
      </DsHeading>
      <ResourceList
        resources={roleResources ?? []}
        isLoading={isLoading}
        noResourcesText={t('role.resources_empty')}
        enableMaxHeight={true}
        interactive={false}
        showDetails={false}
        size='xs'
      />
    </>
  );
};
