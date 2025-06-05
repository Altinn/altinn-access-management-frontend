import React, { useEffect, useState } from 'react';
import {
  DsButton,
  DsSearch,
  DsSpinner,
  List,
  DsValidationMessage,
} from '@altinn/altinn-components';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';

import { AmPagination } from '@/components/Paginering';

import type { AgentDelegation, AgentDelegationCustomer } from '../types';

import classes from './CustomerList.module.css';

const filterCustomerList = (
  list: AgentDelegationCustomer[],
  searchString: string,
): AgentDelegationCustomer[] => {
  return list.filter((customer) => {
    const isOrgNoMatch = customer.orgNo.indexOf(searchString.replace(' ', '')) > -1;
    const isNameMatch = customer.name.toLowerCase().indexOf(searchString.toLowerCase()) > -1;
    return isOrgNoMatch || isNameMatch;
  });
};

const itemsPerPage = 5;
const showPages = 7;

interface CustomerListProps {
  list: AgentDelegationCustomer[];
  delegations?: AgentDelegation[];
  loadingIds?: string[];
  errorIds?: string[];
  onAddCustomer?: (customer: AgentDelegationCustomer) => void;
  onRemoveCustomer?: (delegationToRemove: AgentDelegation, customerName: string) => void;
  children?: React.ReactNode;
}

export const CustomerList = ({
  list,
  delegations,
  loadingIds,
  errorIds,
  onAddCustomer,
  onRemoveCustomer,
  children,
}: CustomerListProps) => {
  const { t } = useTranslation();

  const [searchValue, setSearchValue] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const filteredSearchList = filterCustomerList(list, searchValue);

  const totalPages = Math.ceil(filteredSearchList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = currentPage * itemsPerPage;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage, itemsPerPage]);

  const onSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchValue(event.target.value);
    setCurrentPage(1);
  };

  return (
    <div>
      <div className={classes.listHeader}>
        <DsSearch
          className={classes.searchBar}
          data-size='sm'
        >
          <DsSearch.Input
            aria-label={t('systemuser_agent_delegation.customer_search')}
            value={searchValue}
            onChange={onSearch}
            placeholder={t('systemuser_agent_delegation.customer_search')}
          />
          <DsSearch.Clear />
        </DsSearch>
        {children}
      </div>
      <List
        defaultItemSize='sm'
        className={classes.customerList}
        items={filteredSearchList.slice(startIndex, endIndex)?.map((customer) => {
          return {
            title: customer.name,
            interactive: false,
            id: customer.id,
            titleAs: 'h3',
            as: 'div',
            avatar: { type: 'company', name: customer.name },
            description: `${t('common.org_nr')} ${customer.orgNo.match(/.{1,3}/g)?.join(' ')}`,
            controls: (
              <ListControls
                customer={customer}
                delegation={delegations?.find((x) => x.customerId === customer.id)}
                isLoading={loadingIds?.some((x) => x === customer.id)}
                isError={errorIds?.some((x) => x === customer.id)}
                onRemoveCustomer={onRemoveCustomer}
                onAddCustomer={onAddCustomer}
              />
            ),
          };
        })}
      />
      <AmPagination
        totalPages={totalPages}
        showPages={showPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        className={classes.pagingContainer}
      />
    </div>
  );
};
interface ListControlsProps {
  customer: AgentDelegationCustomer;
  delegation?: AgentDelegation;
  isLoading?: boolean;
  isError?: boolean;
  onRemoveCustomer?: (delegationToRemove: AgentDelegation, customerName: string) => void;
  onAddCustomer?: (customer: AgentDelegationCustomer) => void;
}
const ListControls = ({
  customer,
  delegation,
  isLoading,
  isError,
  onRemoveCustomer,
  onAddCustomer,
}: ListControlsProps): React.ReactNode => {
  const { t } = useTranslation();

  return (
    <div className={classes.listControls}>
      {isLoading && (
        <div className={classes.loadingSpinner}>
          <DsSpinner
            data-size='sm'
            aria-hidden
          />
        </div>
      )}
      {isError && delegation && (
        <DsValidationMessage data-size='sm'>
          {t('systemuser_agent_delegation.remove_system_user_error')}
        </DsValidationMessage>
      )}
      {isError && !delegation && (
        <DsValidationMessage data-size='sm'>
          {t('systemuser_agent_delegation.add_system_user_error')}
        </DsValidationMessage>
      )}
      {!isLoading && delegation && onRemoveCustomer && (
        <DsButton
          variant='tertiary'
          data-size='sm'
          data-color='danger'
          aria-label={t('systemuser_agent_delegation.remove_from_system_user_aria', {
            customerName: customer.name,
          })}
          onClick={() => onRemoveCustomer(delegation, customer.name)}
        >
          <MinusCircleIcon /> {t('systemuser_agent_delegation.remove_from_system_user')}
        </DsButton>
      )}
      {!isLoading && !delegation && onAddCustomer && (
        <DsButton
          variant='tertiary'
          data-size='sm'
          aria-label={t('systemuser_agent_delegation.add_to_system_user_aria', {
            customerName: customer.name,
          })}
          onClick={() => onAddCustomer(customer)}
        >
          <PlusCircleIcon /> {t('systemuser_agent_delegation.add_to_system_user')}
        </DsButton>
      )}
    </div>
  );
};
