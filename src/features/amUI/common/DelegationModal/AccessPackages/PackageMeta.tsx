import { DsHeading, DsParagraph } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { ResourceList } from '@/features/amUI/common/ResourceList/ResourceList';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import type { ExtendedAccessPackage } from '../../AccessPackageList/useAreaPackageList';

import classes from './AccessPackageInfo.module.css';

interface PackageMetaProps {
  accessPackage: ExtendedAccessPackage;
}

export const PackageMeta = ({ accessPackage }: PackageMetaProps) => {
  const { t } = useTranslation();
  const isSmall = useIsMobileOrSmaller();

  return (
    <>
      <DsParagraph
        data-size={isSmall ? 'sm' : 'md'}
        variant='long'
      >
        {accessPackage?.description}
      </DsParagraph>
      <div className={classes.services}>
        <DsHeading
          level={2}
          data-size={isSmall ? 'xs' : 'sm'}
        >
          {t('delegation_modal.package_services', {
            count: accessPackage.resources.length,
            name: accessPackage?.name,
          })}
        </DsHeading>
        <div className={classes.service_list}>
          <ResourceList
            resources={accessPackage.resources}
            noResourcesText={t('delegation_modal.no_resources_in_package')}
            enableMaxHeight={true}
            showDetails={false}
            interactive={false}
            size='xs'
            as='div'
          />
        </div>
      </div>
    </>
  );
};
