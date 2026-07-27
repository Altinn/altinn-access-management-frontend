import { useTranslation } from 'react-i18next';
import { DsParagraph } from '@altinn/altinn-components';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookupApi';
import { AccessPackageList } from '@/features/amUI/common/AccessPackageList/AccessPackageList';

import { useDelegationModalContext } from '../DelegationModalContext';
import { DelegationAction } from '../EditModal';

import classes from './PackageSearch.module.css';
import { DebouncedSearchField } from '../../DebouncedSearchField/DebouncedSearchField';
import { AccessPackageInfoPopover } from '../../AccessPackageInfoPopover/AccessPackageInfoPopover';

export interface PackageSearchProps {
  onSelection: (pack: AccessPackage) => void;
  onActionError: (accessPackage: AccessPackage) => void;
  toParty?: Party;
  availableActions?: DelegationAction[];
}

export const PackageSearch = ({
  toParty,
  onSelection,
  onActionError,
  availableActions,
}: PackageSearchProps) => {
  const { t } = useTranslation();
  const { searchString, setSearchString, setActionError } = useDelegationModalContext();

  return (
    toParty && (
      <div className={classes.container}>
        <div className={classes.description}>
          <DsParagraph>{t('delegation_modal.package_delegation_description')}</DsParagraph>
          <AccessPackageInfoPopover />
        </div>
        <search>
          <div className={classes.searchInputs}>
            <DebouncedSearchField
              placeholder={t('access_packages.search_label')}
              setDebouncedSearchString={setSearchString}
              initialValue={searchString}
            />
          </div>
          <div className={classes.searchResults}>
            <AccessPackageList
              showAllAreas={true}
              showAllPackages={true}
              showPackagesCount={true}
              onSelect={onSelection}
              searchString={searchString}
              availableActions={availableActions}
              onDelegateError={(accessPackage, errorInfo) => {
                onActionError(accessPackage);
                setActionError(errorInfo);
              }}
              onRevokeError={(accessPackage, errorInfo) => {
                onActionError(accessPackage);
                setActionError(errorInfo);
              }}
            />
          </div>
        </search>
      </div>
    )
  );
};
