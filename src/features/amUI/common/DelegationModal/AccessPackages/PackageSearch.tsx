import { Trans, useTranslation } from 'react-i18next';
import { DsHeading, formatDisplayName } from '@altinn/altinn-components';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookupApi';
import { AccessPackageList } from '@/features/amUI/common/AccessPackageList/AccessPackageList';

import { useDelegationModalContext } from '../DelegationModalContext';
import type { DelegationAction } from '../EditModal';

import classes from './PackageSearch.module.css';
import { PartyType } from '@/rtk/features/userInfoApi';
import { DebouncedSearchField } from '../../DebouncedSearchField/DebouncedSearchField';

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
      <>
        <DsHeading
          level={2}
          data-size='sm'
        >
          <Trans
            i18nKey='delegation_modal.give_package_to_name'
            values={{
              name: formatDisplayName({
                fullName: toParty.name,
                type: toParty.partyTypeName === PartyType.Person ? 'person' : 'company',
              }),
            }}
            components={{ strong: <strong /> }}
          />
        </DsHeading>
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
      </>
    )
  );
};
