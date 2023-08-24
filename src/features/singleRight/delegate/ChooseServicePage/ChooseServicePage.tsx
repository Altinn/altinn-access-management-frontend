import * as React from 'react';
import axios from 'axios';
import { PersonCheckmarkIcon, FilterIcon } from '@navikt/aksel-icons';
import { SearchField } from '@altinn/altinn-design-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Chip,
  Heading,
  Paragraph,
  Pagination,
  Spinner,
  Alert,
  Button,
} from '@digdir/design-system-react';

import { DelegationRequestDto } from '@/dataObjects/dtos/CheckDelegationAccessDto';
import {
  Page,
  PageHeader,
  PageContent,
  PageSize,
  PageContainer,
  Filter,
  ActionBar,
  CollectionBar,
} from '@/components';
import { useMediaQuery } from '@/resources/hooks';
import {
  useGetPaginatedSearchQuery,
  useGetResourceOwnersQuery,
  type ServiceResource,
} from '@/rtk/features/singleRights/singleRightsSlice';

import { ResourceActionBar } from './ResourceActionBar/ResourceActionBar';
import classes from './ChooseServicePage.module.css';

const searchResultsPerPage = 10;

export const ChooseServicePage = () => {
  const { t } = useTranslation('common');

  const isSm = useMediaQuery('(max-width: 768px)');
  const [filters, setFilters] = useState<string[]>([]);
  const [searchString, setSearchString] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedResources, setSelectedResources] = useState<ServiceResource[]>([]);

  const { data, error, isFetching } = useGetPaginatedSearchQuery({
    searchString,
    ROfilters: filters,
    page: currentPage,
    resultsPerPage: searchResultsPerPage,
  });

  const { data: ROdata } = useGetResourceOwnersQuery();

  const resources = data?.pageList;
  const totalNumberOfResults = data?.numEntriesTotal;
  const resultsPerPage = 10;

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

  const filterOptions = ROdata
    ? ROdata.map((ro) => {
        return {
          label: ro.organisationName,
          value: ro.organisationNumber,
        };
      })
    : [];

  const unCheckFilter = (filter: string) => {
    setFilters((prev) => prev.filter((f) => f !== filter));
    setCurrentPage(1);
  };

  const getFilterLabel = (value: string) => {
    const option = filterOptions.find((option) => option.value === value);
    return option ? option.label : '';
  };

  const filterChips = () => (
    <Chip.Group
      size='small'
      className={classes.filterChips}
    >
      {filters.map((filterValue) => (
        <Chip.Removable
          key={filterValue}
          aria-label={t('common.remove') + ' ' + String(getFilterLabel(filterValue))}
          onClick={() => {
            unCheckFilter(filterValue);
          }}
        >
          {getFilterLabel(filterValue)}
        </Chip.Removable>
      ))}
    </Chip.Group>
  );

  const searchResults = () => {
    if (isFetching) {
      return (
        <div className={classes.spinner}>
          <Spinner
            title={t('common.loading')}
            size='1xLarge'
          />
        </div>
      );
    } else if (error) {
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
                {String(totalNumberOfResults) + ' ' + t('single_rights_delegation.search_hits')}
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
              compact={isSm}
              hideLabels={isSm}
            />
          )}
        </>
      );
    }
  };

  const onAdd = (resource: ServiceResource) => {
    setSelectedResources([...selectedResources, resource]);
  };

  const onRemove = (resource: ServiceResource) => {
    setSelectedResources(selectedResources.filter((r) => r.title !== resource.title));
  };

  const serviceResouces = resources?.map((resource: ServiceResource, index: number) => {
    const isAdded = selectedResources.some((selected) => selected.title === resource.title);
    return (
      <ResourceActionBar
        key={resource.identifier ?? index}
        color={isAdded ? 'success' : 'neutral'}
        title={resource.title}
        subtitle={resource.resourceOwnerName}
        isAdded={isAdded}
        onAdd={() => {
          onAdd(resource);
        }}
        onRemove={() => {
          onRemove(resource);
        }}
      >
        <div className={classes.serviceResourceContent}>
          <Paragraph size='small'>{resource.description}</Paragraph>
          <Paragraph size='small'>{resource.rightDescription}</Paragraph>
        </div>
      </ResourceActionBar>
    );
  });

  const selectedResourcesActionBars = selectedResources.map((resource, index) => (
    <ActionBar
      key={index}
      title={resource.title}
      subtitle={resource.resourceOwnerName}
      size='small'
      color='success'
      actions={
        <Button
          variant='quiet'
          size='small'
          onClick={() => {
            onRemove(resource);
          }}
        >
          {t('common.remove')}
        </Button>
      }
    ></ActionBar>
  ));

  return (
    <PageContainer>
      <Page size={isSm ? PageSize.Small : PageSize.Medium}>
        <PageHeader icon={<PersonCheckmarkIcon />}>EnkeltRettigheter</PageHeader>
        <PageContent>
          {selectedResourcesActionBars.length > 0 && (
            <CollectionBar
              title='Valgte tjenester'
              color='success'
              collection={selectedResourcesActionBars}
              compact={isSm}
            />
          )}
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
