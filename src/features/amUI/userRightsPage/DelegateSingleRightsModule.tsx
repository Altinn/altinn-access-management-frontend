import * as React from 'react';
import {
  Alert,
  Button,
  Chip,
  Heading,
  Modal,
  Pagination,
  Paragraph,
  Search,
  Spinner,
} from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import { FilterIcon, PlusIcon, ArrowRightIcon, ArrowLeftIcon, FileIcon } from '@navikt/aksel-icons';
import { useEffect, useRef, useState } from 'react';

import type { Party } from '@/rtk/features/lookup/lookupApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import {
  useDelegationCheckMutation,
  useGetPaginatedSearchQuery,
  useDelegateRightsMutation,
} from '@/rtk/features/singleRights/singleRightsApi';
import { useGetResourceOwnersQuery } from '@/rtk/features/resourceApi';
import { arraysEqual, debounce } from '@/resources/utils';
import { Filter, List, ListItem } from '@/components';
import type { DelegationInputDto } from '@/dataObjects/dtos/resourceDelegation';
import {
  DelegationRequestDto,
  RightStatus,
  ServiceDto,
  type DelegationAccessResult,
  type ResourceReference,
} from '@/dataObjects/dtos/resourceDelegation';
import { IdValuePair } from '@/dataObjects/dtos/IdValuePair';
import { LocalizedAction } from '@/resources/utils/localizedActions';
import { PartyType } from '@/rtk/features/userInfo/userInfoApi';

import classes from './DelegateSingleRightsModal.module.css';

export interface DelegateSingleRightsModalProps {
  toParty: Party;
}

const searchResultsPerPage = 7;

export const DelegateSingleRightsModal = ({ toParty }: DelegateSingleRightsModalProps) => {
  const { t } = useTranslation();
  const [infoView, setInfoView] = useState(false);
  const [resourceToView, setResourceToView] = useState<ServiceResource | undefined>(undefined);
  const modalRef = useRef<HTMLDialogElement>(null);

  const onSelection = (resource: ServiceResource) => {
    setInfoView(true);
    setResourceToView(resource);
  };

  const closeModal = () => modalRef.current?.close();

  const onClose = () => {
    setInfoView(false);
  };

  return (
    <Modal.Root>
      <Modal.Trigger
        size='sm'
        variant='secondary'
      >
        {t('common.add')} <PlusIcon />
      </Modal.Trigger>
      <Modal.Dialog
        ref={modalRef}
        className={classes.modalDialog}
        onInteractOutside={closeModal}
        onClose={onClose}
      >
        <Modal.Header>
          {infoView ? (
            <Button
              variant='tertiary'
              onClick={() => setInfoView(false)}
              icon
            >
              <ArrowLeftIcon fontSize='1.5em' />
              Tilbake
            </Button>
          ) : (
            <Heading
              level={2}
              size='sm'
            >
              Gi <strong>{toParty.name}</strong> fullmakt til ny tjeneste
            </Heading>
          )}
        </Modal.Header>
        <Modal.Content>
          {infoView ? (
            <ResourceInfo
              resource={resourceToView}
              toParty={toParty}
              onDelegate={closeModal}
            />
          ) : (
            <SearchSection onSelection={onSelection} />
          )}
        </Modal.Content>
      </Modal.Dialog>
    </Modal.Root>
  );
};

const SearchSection = ({ onSelection }: { onSelection: (resource: ServiceResource) => void }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<string[]>([]);
  const [searchString, setSearchString] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: searchData,
    error,
    isFetching,
  } = useGetPaginatedSearchQuery({
    searchString,
    ROfilters: filters,
    page: currentPage,
    resultsPerPage: searchResultsPerPage,
  });

  const displayPopularResources =
    !searchString && filters.length === 0 && window.featureFlags.displayPopularSingleRightsServices;

  const resources = searchData?.pageList;
  const totalNumberOfResults = searchData?.numEntriesTotal;
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
            size='md'
            variant='interaction'
          />
        </div>
      );
    } else if (error) {
      return (
        <Alert
          role='alert'
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
                {displayPopularResources
                  ? t('single_rights.popular_services')
                  : String(totalNumberOfResults) + ' ' + t('single_rights.search_hits')}
              </Paragraph>
            )}
            {filterChips()}
          </div>
          <List className={classes.resourceList}> {listedResources}</List>
          {totalNumberOfResults !== undefined &&
            totalNumberOfResults > searchResultsPerPage &&
            !displayPopularResources && (
              <Pagination
                className={classes.pagination}
                currentPage={currentPage}
                totalPages={Math.ceil(totalNumberOfResults / searchResultsPerPage)}
                nextLabel={t('common.next')}
                previousLabel={t('common.previous')}
                itemLabel={(num: number) => `Side ${num}`}
                onChange={setCurrentPage}
                size='sm'
                compact={true}
                hideLabels={true}
              />
            )}
        </>
      );
    }
  };

  const listedResources = resources?.map((resource: ServiceResource, index: number) => {
    return (
      <ListItem
        key={resource.identifier ?? index}
        className={classes.resourceItem}
      >
        <span className={classes.resource}>
          <FileIcon
            fontSize='1.9em'
            className={classes.resourceIcon}
          />
          <span className={classes.resourceInfo}>
            <Paragraph>{resource.title}</Paragraph>
            <Paragraph
              size='xs'
              className={classes.resourceSubtitle}
            >
              {resource.resourceOwnerName}
            </Paragraph>
          </span>
        </span>
        <Button
          size='sm'
          variant='tertiary'
          onClick={() => onSelection(resource)}
          icon
        >
          <ArrowRightIcon fontSize='1.5em' />
        </Button>
      </ListItem>
    );
  });

  const debouncedSearch = debounce((searchString: string) => {
    setSearchString(searchString);
    setCurrentPage(1);
  }, 300);

  return (
    <search className={classes.searchSection}>
      <div className={classes.searchInputs}>
        <div className={classes.searchField}>
          <Search
            label={t('single_rights.search_label')}
            hideLabel={false}
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
          options={filterOptions}
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
      <div className={classes.searchResults}>{searchResults()}</div>
    </search>
  );
};

export type ChipRight = {
  action: string;
  rightKey: string;
  delegable: boolean;
  checked: boolean;
  resourceReference: IdValuePair[];
};

const ResourceInfo = ({
  resource,
  toParty,
  onDelegate,
}: {
  resource?: ServiceResource;
  toParty: Party;
  onDelegate: () => void;
}) => {
  const { t } = useTranslation();
  const [delegationCheck] = useDelegationCheckMutation();
  const [delegateRights] = useDelegateRightsMutation();
  const [rights, setRights] = useState<ChipRight[]>([]);
  const resourceRef: ResourceReference | null =
    resource !== undefined
      ? {
          resource: resource.authorizationReference,
        }
      : null;

  useEffect(() => {
    if (resourceRef) {
      delegationCheck(resourceRef)
        .unwrap()
        .then((response: DelegationAccessResult[]) => {
          const chipRights: ChipRight[] = response.map((right: DelegationAccessResult) => ({
            action: right.action,
            rightKey: right.rightKey,
            delegable: right.status === RightStatus.Delegable,
            checked: right.status === RightStatus.Delegable,
            resourceReference: right.resource,
          }));
          setRights(chipRights);
        });
    }
  }, []);

  const chips =
    resource?.resourceType === 'AltinnApp' ? (
      <Chip.Toggle
        size='small'
        checkmark
        selected={rights.some((r) => r.checked === true)}
        disabled={!rights.some((r) => r.delegable === true)}
        onClick={() => {
          setRights(rights.map((r) => ({ ...r, checked: r.delegable ? !r.checked : r.checked })));
        }}
      >
        {t('common.action_access')}
      </Chip.Toggle>
    ) : (
      rights.map((right: ChipRight) => {
        const actionText = Object.values(LocalizedAction).includes(right.action as LocalizedAction)
          ? t(`common.action_${right.action}`)
          : right.action;
        return (
          <div key={right.rightKey}>
            <Chip.Toggle
              size='sm'
              checkmark
              selected={right.checked}
              disabled={!right.delegable}
              onClick={() => {
                setRights(
                  rights.map((r) => {
                    if (r.rightKey == right.rightKey && r.delegable) {
                      return { ...r, checked: !r.checked };
                    } else {
                      return r;
                    }
                  }),
                );
              }}
            >
              {actionText}
            </Chip.Toggle>
          </div>
        );
      })
    );

  const delegateChosenRights = () => {
    let recipient: IdValuePair[];

    if (toParty.partyTypeName === PartyType.Person) {
      recipient = [new IdValuePair('urn:altinn:person:uuid', toParty.partyUuid)];
    } else if (toParty.partyTypeName === PartyType.Organization) {
      recipient = [new IdValuePair('urn:altinn:organization:uuid', toParty.partyUuid)];
    } else if (toParty.partyTypeName === PartyType.SelfIdentified) {
      recipient = [new IdValuePair('urn:altinn:enterpriseuser:uuid', toParty.partyUuid)];
    } else {
      throw new Error('Cannot delegate. User type not defined');
    }

    const rightsToDelegate = rights
      .filter((right: ChipRight) => right.checked)
      .map((right: ChipRight) => new DelegationRequestDto(right.resourceReference, right.action));

    if (resource && rightsToDelegate.length > 0) {
      const delegationInput: DelegationInputDto = {
        To: recipient,
        Rights: rightsToDelegate,
        serviceDto: new ServiceDto(
          resource.title,
          resource.resourceOwnerName,
          resource.resourceType,
        ),
      };

      delegateRights(delegationInput).then(() => {
        onDelegate();
      });
    }
  };

  return (
    <>
      {resource && (
        <div className={classes.infoView}>
          <Heading
            level={3}
            size='md'
            className={classes.infoHeading}
          >
            <FileIcon
              fontSize='1em'
              className={classes.resourceIcon}
              aria-hidden
            />
            {resource.title}
          </Heading>
          <Paragraph>{resource.rightDescription}</Paragraph>
          <div className={classes.rightsSection}>
            <Heading
              size='xs'
              level={4}
            >
              <strong>{toParty.name}</strong> vil få tilgang til:
            </Heading>
            <div className={classes.rightChips}>{chips}</div>
          </div>
          <Button
            className={classes.completeButton}
            fullWidth={false}
            disabled={!rights.some((r) => r.checked === true)}
            onClick={delegateChosenRights}
          >
            Gi fullmakt
          </Button>
        </div>
      )}
    </>
  );
};
