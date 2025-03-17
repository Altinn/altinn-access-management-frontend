import React, { useEffect, useState } from 'react';
import { Button, Search, Spinner, ValidationMessage } from '@digdir/designsystemet-react';
import { List } from '@altinn/altinn-components';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';

import { AmPagination } from '@/components/Paginering';

import type { Customer } from '../types';

import classes from './CustomerList.module.css';

const filterCustomerList = (list: Customer[], searchString: string): Customer[] => {
  return list.filter((customer) => {
    const isOrgNoMatch = customer.orgNo.indexOf(searchString.replace(' ', '')) > -1;
    const isNameMatch = customer.name.toLowerCase().indexOf(searchString.toLowerCase()) > -1;
    return isOrgNoMatch || isNameMatch;
  });
};

const itemsPerPage = 10;
const showPages = 7;

interface CustomerListProps {
  list: Customer[];
  assignedIds?: string[];
  loadingIds?: string[];
  errorIds?: string[];
  onAddCustomer?: (customerId: string) => void;
  onRemoveCustomer?: (customerId: string) => void;
  children?: React.ReactNode;
}

export const CustomerList = ({
  list,
  assignedIds,
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
        <Search
          className={classes.searchBar}
          data-size='sm'
        >
          <Search.Input
            aria-label={t('systemuser_agent_delegation.customer_search')}
            value={searchValue}
            onChange={onSearch}
            placeholder={t('systemuser_agent_delegation.customer_search')}
          />
          <Search.Clear />
        </Search>
        {children}
      </div>
      <List
        defaultItemSize='sm'
        items={filteredSearchList.slice(startIndex, endIndex)?.map((customer) => {
          return {
            title: customer.name,
            id: customer.id,
            disabled: true,
            as: 'div',
            avatar: { type: 'company', name: customer.name },
            description: `${t('common.org_nr')} ${customer.orgNo.match(/.{1,3}/g)?.join(' ')}`,
            controls: (
              <ListControls
                customer={customer}
                isAssigned={assignedIds?.some((x) => x === customer.id)}
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
  customer: Customer;
  isAssigned?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  onRemoveCustomer?: (customerId: string) => void;
  onAddCustomer?: (customerId: string) => void;
}
const ListControls = ({
  customer,
  isAssigned,
  isLoading,
  isError,
  onRemoveCustomer,
  onAddCustomer,
}: ListControlsProps): React.ReactNode => {
  const { t } = useTranslation();

  return (
    <>
      {isLoading && (
        <div className={classes.loadingSpinner}>
          <Spinner
            data-size='sm'
            aria-hidden
          />
        </div>
      )}
      {isError && isAssigned && (
        <ValidationMessage data-size='sm'>
          {t('systemuser_agent_delegation.remove_system_user_error')}
        </ValidationMessage>
      )}
      {isError && !isAssigned && (
        <ValidationMessage data-size='sm'>
          {t('systemuser_agent_delegation.add_system_user_error')}
        </ValidationMessage>
      )}
      {!isLoading && isAssigned && onRemoveCustomer && (
        <Button
          variant='tertiary'
          data-size='sm'
          data-color='danger'
          aria-label={t('systemuser_agent_delegation.remove_from_system_user_aria', {
            customerName: customer.name,
          })}
          onClick={() => onRemoveCustomer(customer.id)}
        >
          <MinusCircleIcon /> {t('systemuser_agent_delegation.remove_from_system_user')}
        </Button>
      )}
      {!isLoading && !isAssigned && onAddCustomer && (
        <Button
          variant='tertiary'
          data-size='sm'
          aria-label={t('systemuser_agent_delegation.add_to_system_user_aria', {
            customerName: customer.name,
          })}
          onClick={() => onAddCustomer(customer.id)}
        >
          <PlusCircleIcon /> {t('systemuser_agent_delegation.add_to_system_user')}
        </Button>
      )}
    </>
  );
};
