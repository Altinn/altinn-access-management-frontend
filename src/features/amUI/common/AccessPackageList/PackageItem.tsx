import { AccessPackageListItem, type AccessPackageListItemProps } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import { PartyType } from '@/rtk/features/userInfoApi';

import { useRestoreFocusTarget } from '../RestoreFocus';

// Distinct id set on the inline action button (the "Gi"/"Slett" button) by the action controls.
// Lets us restore focus to the button itself instead of the surrounding row after a delegate/revoke,
// since the row is itself focusable and would otherwise win as the first focusable for the package id.
export const packageActionControlId = (packageId: string) => `list-action-${packageId}`;

interface PackageItemProps {
  pkg: AccessPackage;
  onSelect?: (pkg: AccessPackage) => void;
  controls?: React.ReactNode;
  hasAccess?: boolean;
  badge?: React.ReactNode;
  as?: React.ElementType;
  partyType: PartyType;
  titleAs?: AccessPackageListItemProps['titleAs'];
}

export const PackageItem = ({
  pkg,
  onSelect,
  controls,
  hasAccess,
  badge,
  as,
  partyType,
  titleAs,
}: PackageItemProps) => {
  const { t } = useTranslation();
  const partyTypeColor = partyType === PartyType.Person ? 'person' : 'company';
  useRestoreFocusTarget(pkg.id);
  useRestoreFocusTarget(packageActionControlId(pkg.id));
  return (
    <AccessPackageListItem
      id={pkg.id}
      name={pkg.name}
      titleAs={titleAs || 'h4'}
      description={t('access_packages.package_number_of_resources', {
        count: pkg.resources.length,
      })}
      onClick={() => onSelect?.(pkg)}
      controls={controls}
      color={hasAccess ? partyTypeColor : 'neutral'}
      size='xs'
      badge={badge}
      as={as}
    />
  );
};
