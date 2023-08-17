import * as React from 'react';
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
} from '@/rtk/features/singleRights/singleRightsApi';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { ResourceIdentifierDto } from '@/dataObjects/dtos/singleRights/ResourceIdentifierDto';
import {
  type DelegationRequestDto,
  delegationAccessCheck,
  removeServiceResource,
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
  const dispatch = useAppDispatch();
  const chosenServices = useAppSelector((state) => state.singleRightsSlice.chosenServices);
  const delegableChosenServices = useAppSelector((state) =>
    state.singleRightsSlice.chosenServices.filter((s) => s.status !== 'NotDelegable'),
  );

  const { data, error, isFetching } = useGetPaginatedSearchQuery({
    searchString,
    ROfilters: filters,
    page: currentPage,
    resultsPerPage: searchResultsPerPage,
  });

  const resources = data?.pageList;
  const totalNumberOfResults = data?.numEntriesTotal;
  const { data: ROdata } = useGetResourceOwnersQuery();

  const filterOptions = ROdata
    ? ROdata.map((ro) => {
        return {
          label: ro.organisationName,
          value: ro.organisationNumber,
        };
      })
    : [];

  const unCheckFilter = (filter: string) => {
    setFilters((prevState: string[]) => prevState.filter((f) => f !== filter));
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
      {filters.map((filterValue: string) => (
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
                {totalNumberOfResults.toString() + ' ' + t('single_rights.search_hits')}
              </Paragraph>
            )}
            {filterChips()}
          </div>
          <div className={classes.serviceResouces}> {serviceResouces}</div>
          {totalNumberOfResults !== undefined && totalNumberOfResults > 0 && (
            <Pagination
              className={classes.pagination}
              currentPage={currentPage}
              totalPages={Math.ceil(totalNumberOfResults / searchResultsPerPage)}
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

  const onAdd = (identifier: string, serviceResource: ServiceResource) => {
    const dto: DelegationRequestDto = {
      serviceResource,
      delegationRequest: new ResourceIdentifierDto('urn:altinn:resource', identifier),
    };

    void dispatch(delegationAccessCheck(dto));
  };

  const onRemove = (identifier: string | undefined) => {
    void dispatch(removeServiceResource(identifier));
  };

  const getErrorCodeTextKey = (errorCode: string | undefined) => {
    if (errorCode === 'MissingRoleAccess') {
      return 'single_rights.missing_role_access';
    } else if (errorCode === 'MissingDelegationAccess') {
      return 'single_rights.missing_delegation_access';
    } else if (errorCode === 'Unknown') {
      return 'single_rights.unknown';
    } else if (errorCode === undefined) {
      return undefined;
    } else {
      return 'new_error';
    }
  };

  const serviceResouces = resources?.map((resource: ServiceResource, index: number) => {
    const status = chosenServices.find((selected) => selected.service?.title === resource.title)
      ?.status;
    const errorCode = chosenServices.find((selected) => selected.service?.title === resource.title)
      ?.errorCode;
    const errorCodeTextKey = getErrorCodeTextKey(errorCode);

    return (
      <ResourceActionBar
        key={resource.identifier ?? index}
        title={resource.title}
        subtitle={resource.resourceOwnerName}
        status={status ?? 'Unchecked'}
        onAddClick={() => {
          onAdd(resource.identifier, resource);
        }}
        onRemoveClick={() => {
          onRemove(resource.identifier);
        }}
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        errorText={t(`${errorCodeTextKey}_title`)}
        compact={isSm}
      >
        <div className={classes.serviceResourceContent}>
          {errorCodeTextKey && (
            <Alert
              severity='danger'
              elevated={false}
              className={classes.notDelegableAlert}
            >
              <Heading size='xsmall'>{t(`${errorCodeTextKey}_title`)}</Heading>
              <Paragraph>{t(`${errorCodeTextKey}`)}</Paragraph>
            </Alert>
          )}
          <Paragraph size='small'>{resource.description}</Paragraph>
          <Paragraph size='small'>{resource.rightDescription}</Paragraph>
        </div>
      </ResourceActionBar>
    );
  });

  const selectedResourcesActionBars = delegableChosenServices.map((resource, index) => (
    <ActionBar
      key={index}
      title={resource.service?.title}
      subtitle={resource.service?.resourceOwnerName}
      size='small'
      color='success'
      actions={
        <Button
          variant='quiet'
          size='small'
          onClick={() => {
            onRemove(resource.service?.identifier);
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
          <CollectionBar
            title='Valgte tjenester'
            color={selectedResourcesActionBars.length > 0 ? 'success' : 'neutral'}
            collection={selectedResourcesActionBars}
            compact={isSm}
          />
          <div className={classes.searchSection}>
            <div className={classes.searchInputs}>
              <div className={classes.searchField}>
                <SearchField
                  label={t('single_rights.search_label')}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setSearchString(event.target.value);
                    setCurrentPage(1);
                  }}
                ></SearchField>
              </div>
              <Filter
                icon={<FilterIcon />}
                label={t('single_rights.filter_label')}
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
