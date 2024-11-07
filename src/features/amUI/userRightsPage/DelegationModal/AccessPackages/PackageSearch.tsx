import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Heading, Search } from '@digdir/designsystemet-react';
import { FilterIcon } from '@navikt/aksel-icons';

import { Filter } from '@/components';
import { arraysEqual, debounce } from '@/resources/utils';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookup/lookupApi';

import { useDelegationModalContext } from '../DelegationModalContext';

import classes from './PackageSearch.module.css';

export interface PackageSearchProps {
  onSelection: (pack: AccessPackage) => void;
  toParty: Party;
}

const searchResultsPerPage = 5;

export const PackageSearch = ({ onSelection, toParty }: PackageSearchProps) => {
  const { t } = useTranslation();
  const { id } = useParams();

  const { searchString, setSearchString, filters, setFilters, currentPage, setCurrentPage } =
    useDelegationModalContext();

  const debouncedSearch = debounce((searchString: string) => {
    setSearchString(searchString);
    setCurrentPage(1);
  }, 300);

  return (
    <>
      <Heading
        level={2}
        size='sm'
      >
        <Trans
          i18nKey='delegation_modal.give_to_name'
          values={{ name: toParty.name }}
          components={{ strong: <strong /> }}
        />
      </Heading>
      <search className={classes.searchSection}>
        <div className={classes.searchInputs}>
          <div className={classes.searchField}>
            <Search
              label={t('single_rights.search_label')}
              hideLabel={true}
              value={searchString}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                debouncedSearch(event.target.value);
              }}
              size='sm'
              onClear={() => {
                setSearchString('');
                setCurrentPage(1);
              }}
            />
          </div>
          <Filter
            className={classes.filter}
            icon={<FilterIcon />}
            label={t('single_rights.filter_label')}
            options={[]}
            applyButtonLabel={t('common.apply')}
            resetButtonLabel={t('common.reset_choices')}
            closeButtonAriaLabel={t('common.close')}
            searchable
            values={filters}
            onApply={(filtersToApply: string[]) => {
              if (!arraysEqual(filtersToApply, filters)) {
                setFilters(filtersToApply);
                setCurrentPage(1);
              }
            }}
          />
        </div>
        <div className={classes.searchResults}>test</div>
      </search>
    </>
  );
};
