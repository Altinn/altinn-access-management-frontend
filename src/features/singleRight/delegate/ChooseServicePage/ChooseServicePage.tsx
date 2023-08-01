import * as React from 'react';
import axios from 'axios';
import { PersonCheckmarkIcon, FilterIcon } from '@navikt/aksel-icons';
import { SearchField } from '@altinn/altinn-design-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, Paragraph } from '@digdir/design-system-react';

import { DelegationRequestDto } from '@/dataObjects/dtos/CheckDelegationAccessDto';
import { Page, PageHeader, PageContent, PageSize, PageContainer, Filter } from '@/components';
import { useMediaQuery } from '@/resources/hooks';
import {
  useGetPaginatedSearchQuery,
  type ServiceResource,
} from '@/rtk/features/singleRights/singleRightsSlice';

import { ResourceActionBar } from './ResourceActionBar/ResourceActionBar';
import classes from './ChooseServicePage.module.css';

export const ChooseServicePage = () => {
  const { t } = useTranslation('common');

  const isSm = useMediaQuery('(max-width: 768px)');
  const [filters, setFilters] = useState<string[]>([]);
  const [searchString, setSearchString] = useState('');

  const { data, error, isLoading } = useGetPaginatedSearchQuery({
    searchString,
    ROfilters: filters,
  });
  const resources = data?.pageList;
  const totalNumberOfResults = data?.numEntriesTotal;

  const checkDelegationAccess = () => {
    const dto = new DelegationRequestDto('urn:altinn:resource', 'testapi');

    axios
      .post(`/accessmanagement/api/v1/singleright/checkdelegationaccesses/${1232131234}`, dto)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        throw error;
      });
  };

  checkDelegationAccess();

  // Temporary hardcoding of filter options
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
          aria-label={t('common.remove') + ' ' + getFilterLabel(filterValue)}
          onClick={() => {
            unCheckFilter(filterValue);
          }}
        >
          {getFilterLabel(filterValue)}
        </Chip.Removable>
      ))}
    </Chip.Group>
  );

  const serviceResouces = resources?.map((r: ServiceResource, index: any) => (
    <ResourceActionBar
      key={r.identifier ?? index}
      title={r.title}
      subtitle={r.resourceOwnerName}
    >
      <p>{r.description}</p>
      <p>{r.rightDescription}</p>
    </ResourceActionBar>
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
                  label={t('single_rights_delegation.search_label')}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setSearchString(event.target.value);
                  }}
                ></SearchField>
              </div>
              <Filter
                icon={<FilterIcon />}
                label={t('single_rights_delegation.filter_label')}
                options={filterOptions}
                applyButtonLabel={t('common.apply')}
                resetButtonLabel={t('common.reset_choices')}
                closeButtonAriaLabel={t('common.close')}
                searchable
                fullScreenModal={isSm}
                values={filters}
                onApply={setFilters}
              ></Filter>
            </div>
            <div className={classes.resultCountAndChips}>
              {totalNumberOfResults !== undefined && (
                <Paragraph>
                  {totalNumberOfResults.toString() +
                    ' ' +
                    t('single_rights_delegation.search_hits')}
                </Paragraph>
              )}
              {filterChips()}
            </div>
            {!isLoading && <div className={classes.serviceResouces}> {serviceResouces} </div>}
          </div>
        </PageContent>
      </Page>
    </PageContainer>
  );
};
