import * as React from 'react';
import { PersonCheckmarkIcon, FilterIcon } from '@navikt/aksel-icons';
import { SearchField } from '@altinn/altinn-design-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, Heading, Paragraph, Pagination, Spinner, Alert } from '@digdir/design-system-react';

import { DelegationRequestDto } from '@/dataObjects/dtos/CheckDelegationAccessDto';
import { Page, PageHeader, PageContent, PageSize, PageContainer, Filter } from '@/components';
import { useMediaQuery } from '@/resources/hooks';
import {
  useGetPaginatedSearchQuery,
  type ServiceResource,
  useGetDelegationAccessCheckMutation,
} from '@/rtk/features/singleRights/singleRightsSlice';

import { ResourceActionBar } from './ResourceActionBar/ResourceActionBar';
import classes from './ChooseServicePage.module.css';

export const ChooseServicePage = () => {
  const { t } = useTranslation('common');

  const isSm = useMediaQuery('(max-width: 768px)');
  const [filters, setFilters] = useState<string[]>([]);
  const [searchString, setSearchString] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;
  const [abColor, setAbColor] = useState<'neutral' | 'success' | 'danger'>('neutral');

  const {
    data: pagingData,
    error: pagingError,
    isFetching: pagingIsFetching,
  } = useGetPaginatedSearchQuery({
    searchString,
    ROfilters: filters,
    page: currentPage,
  });
  const resources = pagingData?.pageList;
  const totalNumberOfResults = pagingData?.numEntriesTotal;
  const [getDacr, { data: delegationCheckResponse }] = useGetDelegationAccessCheckMutation();

  // Temporary hardcoding of filter options
  const filterOptions = [
    { label: 'Påfunnsetaten', value: '130000000' },
    { label: 'Testdepartementet', value: '123456789' },
    { label: 'Narnia', value: '777777777' },
    { label: 'Brannvesenet', value: '110110110' },
    { label: 'Økern Portal', value: '904111111' },
    { label: 'Digitaliseringsdirektoratet', value: '991825827' },
    { label: 'Brønnøysundregistrene', value: '974760673' },
  ];

  const unCheckFilter = (filter: string) => {
    setFilters((prev) => prev.filter((f) => f !== filter));
    setCurrentPage(1);
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

  const handleSuccess = () => {
    setAbColor('success');
  };

  const handleFailed = () => {
    setAbColor('danger');
  };

  const actionButtonClick = (identifier: string) => {
    void getDacr(new DelegationRequestDto('urn:altinn:resource', identifier));

    const hasDelegableResponse = delegationCheckResponse?.some(
      (response) => response.status === 'Delegable',
    );
    hasDelegableResponse ? handleSuccess() : handleFailed();
  };

  const serviceResouces = resources?.map((r: ServiceResource, index: number) => (
    <ResourceActionBar
      key={r.identifier ?? index}
      title={r.title}
      subtitle={r.resourceOwnerName}
      actionButtonClick={() => {
        actionButtonClick(r.identifier);
      }}
      color={abColor}
    >
      <p>{r.description}</p>
      <p>{r.rightDescription}</p>
    </ResourceActionBar>
  ));

  const searchResults = () => {
    if (pagingIsFetching) {
      return (
        <div className={classes.spinner}>
          <Spinner
            title='loading'
            size='1xLarge'
          />
        </div>
      );
    } else if (pagingError) {
      return (
        <Alert
          className={classes.searchError}
          severity='danger'
          iconTitle={t('common.error')}
        >
          <Heading
            level={2}
            size='xsmall'
            spacing
          >
            {t('common.general_error_title')}
          </Heading>
          <Paragraph>{t('common.general_error_paragraph')}</Paragraph>
        </Alert>
      );
    } else {
      return (
        <>
          <div className={classes.resultCountAndChips}>
            {totalNumberOfResults !== undefined && (
              <Paragraph>
                {totalNumberOfResults.toString() + ' ' + t('single_rights_delegation.search_hits')}
              </Paragraph>
            )}
            {filterChips()}
          </div>
          <div className={classes.serviceResouces}> {serviceResouces}</div>
          {totalNumberOfResults !== undefined && totalNumberOfResults > 0 && (
            <Pagination
              className={classes.pagination}
              currentPage={currentPage}
              totalPages={Math.ceil(totalNumberOfResults / resultsPerPage)}
              nextLabel={t('common.next')}
              previousLabel={t('common.previous')}
              itemLabel={(num: number) => `Side ${num}`}
              onChange={setCurrentPage}
              size='small'
            />
          )}
        </>
      );
    }
  };

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
                    setCurrentPage(1);
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
                onApply={(filters) => {
                  setFilters(filters);
                  setCurrentPage(1);
                }}
              ></Filter>
            </div>
            {searchResults()}
          </div>
        </PageContent>
      </Page>
    </PageContainer>
  );
};
