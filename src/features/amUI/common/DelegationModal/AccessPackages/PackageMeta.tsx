import { DsHeading, DsParagraph } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { ResourceList } from '@/features/amUI/common/ResourceList/ResourceList';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';

import classes from './AccessPackageInfo.module.css';

interface PackageMetaProps {
  // Accepts a plain AccessPackage so it can be reused outside the delegation flow
  // (e.g. the client-admin package modal). ExtendedAccessPackage is assignable here.
  accessPackage: AccessPackage;
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
