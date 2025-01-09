import { Paragraph } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@altinn/altinn-components';
import { AccessPackageList } from '@altinn/altinn-components';

import { type AccessPackage, type AccessPackageDelegation } from '@/rtk/features/accessPackageApi';

import classes from './AccessPackageSection.module.css';

interface DelegatedPackagesListProps {
  /** The method to be called when clicking a package */
  onSelection: (item: AccessPackage) => void;
  /** The list of already delegated packages */
  packageDelegations: AccessPackageDelegation[];
  /** The complete list of packages that belong to the same area */
  accessPackages: AccessPackage[];
  /** The method to be called when delegating a package */
  onDelegate: (accessPackage: AccessPackage) => void;
  /** The method to be called when revoking a package */
  onRevoke: (accessPackage: AccessPackage) => void;
}

interface PackageGroups {
  delegatedPackages: AccessPackage[];
  notDelegatedPackages: AccessPackage[];
}

const groupPackages = (
  accessPackages: AccessPackage[],
  packageDelegations: AccessPackageDelegation[],
): PackageGroups => {
  return accessPackages.reduce<PackageGroups>(
    (acc, pkg) => {
      const delegation = packageDelegations.find((d) => d.accessPackageId === pkg.id);
      if (delegation) {
        acc.delegatedPackages.push({
          ...pkg,
          inherited: delegation.inherited,
          inheritedFrom: delegation.inheritedFrom,
        });
      } else {
        acc.notDelegatedPackages.push(pkg);
      }
      return acc;
    },
    { delegatedPackages: [], notDelegatedPackages: [] },
  );
};

export const DelegatedPackagesList: React.FC<DelegatedPackagesListProps> = ({
  onSelection,
  packageDelegations,
  accessPackages,
  onDelegate,
  onRevoke,
}: DelegatedPackagesListProps) => {
  const { t } = useTranslation();

  const { delegatedPackages, notDelegatedPackages } = groupPackages(
    accessPackages,

    packageDelegations,
  );

  return (
    <>
      {delegatedPackages.length > 0 && (
        <AccessPackageList
          items={delegatedPackages.map((item) => ({
            id: item.id,
            title: item.name,
            description: `${item.resources.length} tjenester`,
            onClick: () => onSelection(item),
            controls: (
              <div className={classes.controls}>
                <Button
                  icon='minus-circle'
                  variant='text'
                  size='sm'
                  onClick={() => onRevoke(item)}
                  disabled={item.inherited}
                >
                  {t('common.delete_poa')}
                </Button>
              </div>
            ),
          }))}
        />
      )}
      {notDelegatedPackages.length > 0 && (
        <>
          {delegatedPackages.length > 0 && (
            <Paragraph size='sm'>{t('access_packages.other_packages_in_area_title')}</Paragraph>
          )}
          <AccessPackageList
            items={notDelegatedPackages.map((item) => ({
              id: item.id,
              title: item.name,
              description: `${item.resources.length} tjenester`,
              onClick: () => onSelection(item),
              controls: (
                <div className={classes.controls}>
                  <Button
                    icon='plus-circle'
                    variant='text'
                    size='sm'
                    onClick={() => onDelegate(item)}
                  >
                    {t('common.give_poa')}
                  </Button>
                </div>
              ),
            }))}
          />
        </>
      )}
    </>
  );
};
