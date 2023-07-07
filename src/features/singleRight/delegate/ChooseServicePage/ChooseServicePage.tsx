import * as React from 'react';
import { PersonCheckmarkIcon, FilterIcon } from '@navikt/aksel-icons';
import { SearchField } from '@altinn/altinn-design-system';
import { useState } from 'react';
import { Chip } from '@digdir/design-system-react';

import {
  Page,
  PageHeader,
  PageContent,
  PageSize,
  PageContainer,
  Filter,
  ActionBar,
} from '@/components';
import { useMediaQuery } from '@/resources/hooks';
import {
  useGetPaginatedSearchQuery,
  type ServiceResource,
} from '@/rtk/features/singleRights/singleRightsSlice';

import classes from './ChooseServicePage.module.css';

export const ChooseServicePage = () => {
  const isSm = useMediaQuery('(max-width: 768px)');
  const [filters, setFilters] = useState<string[]>([]);
  const [openActionBar, setOpenActionBar] = useState('');
  const [searchString, setSearchString] = useState('');

  const { data, error, isLoading } = useGetPaginatedSearchQuery({
    searchString,
    ROfilters: filters,
  });
  const resources = data?.pageList;

  const filterOptions = [
    { label: 'Påfunnsetaten', value: '130000000' },
    { label: 'Testdepartementet', value: '123456789' },
    { label: 'Narnia', value: '777777777' },
    { label: 'Brannvesenet', value: '110110110' },
    { label: 'Økern Portal', value: '904111111' },
  ];

  const unCheckFilter = (filter: string) => {
    setFilters((prev) => prev.filter((f) => f !== filter));
  };

  const getFilterLabel = (value: string) => {
    for (const option of filterOptions) {
      if (option.value === value) {
        return option.label;
      }
    }
    return '';
  };

  const filterChips = () => (
    <Chip.Group
      size='small'
      className={classes.filterChips}
    >
      {filters.map((filterValue) => (
        <Chip.Removable
          key={filterValue}
          aria-label={`Slett ${getFilterLabel(filterValue)}`}
          onClick={() => {
            unCheckFilter(filterValue);
          }}
        >
          {getFilterLabel(filterValue)}
        </Chip.Removable>
      ))}
    </Chip.Group>
  );

  const serviceResouces = resources?.map((r: ServiceResource) => (
    <>
      <ActionBar
        key={r.identifier}
        title={r.title}
        subtitle={r.resourceOwnerName}
        color='neutral'
        open={openActionBar === r.identifier}
        onClick={() => {
          setOpenActionBar(r.identifier);
        }}
      >
        <p>{r.description}</p>
        <p>{r.rightDescription}</p>
      </ActionBar>
      <div style={{ margin: '4px' }}></div>
    </>
  ));

  return (
    <PageContainer>
      <Page size={isSm ? PageSize.Small : PageSize.Medium}>
        <PageHeader icon={<PersonCheckmarkIcon />}>EnkeltRettigheter</PageHeader>
        <PageContent>
          <div className={classes.searchSection}>
            <div className={classes.searchInputs}>
              <div className={classes.searchField}>
                <SearchField
                  label='Søk etter skjema og tjeneste'
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setSearchString(event.target.value);
                  }}
                ></SearchField>
              </div>
              <Filter
                icon={<FilterIcon title='filter' />}
                label='Filtrer på tjenesteeier'
                options={filterOptions}
                applyButtonLabel='Bruk'
                resetButtonLabel='Nullstill'
                closeButtonAriaLabel='Lukk'
                searchable
                fullScreenModal={isSm}
                values={filters}
                onApply={setFilters}
              ></Filter>
            </div>
            {filterChips()}
            {!isLoading && serviceResouces}
          </div>
        </PageContent>
      </Page>
    </PageContainer>
  );
};
