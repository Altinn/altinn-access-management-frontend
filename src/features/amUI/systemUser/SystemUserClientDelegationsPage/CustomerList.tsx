import React, { useState } from 'react';
import { Button, Search, Pagination, usePagination, Spinner } from '@digdir/designsystemet-react';
import { List } from '@altinn/altinn-components';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';

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
  assignedIds: string[];
  loadingIds: string[];
  onAddCustomer: (customerId: string) => void;
  onRemoveCustomer?: (customerId: string) => void;
  children?: React.ReactNode;
}

export const CustomerList = ({
  list,
  assignedIds,
  loadingIds,
  onAddCustomer,
  onRemoveCustomer,
  children,
}: CustomerListProps) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const filteredSearchList = filterCustomerList(list, searchValue);

  const totalPages = Math.ceil(filteredSearchList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = currentPage * itemsPerPage;

  const { pages, prevButtonProps, nextButtonProps, hasNext, hasPrev } = usePagination({
    currentPage,
    setCurrentPage,
    totalPages: totalPages,
    showPages: totalPages < showPages ? totalPages : showPages,
  });

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
            aria-label='Søk i kunder'
            value={searchValue}
            onChange={onSearch}
            placeholder='Søk i kunder'
          ></Search.Input>
          <Search.Clear></Search.Clear>
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
            description: `Org. nr. ${customer.orgNo.match(/.{1,3}/g)?.join(' ')}`,
            controls: (
              <ListControls
                customer={customer}
                isAssigned={assignedIds.some((x) => x === customer.id)}
                isLoading={loadingIds.some((x) => x === customer.id)}
                onRemoveCustomer={onRemoveCustomer}
                onAddCustomer={onAddCustomer}
              />
            ),
          };
        })}
      />
      <div className={classes.pagingContainer}>
        <Pagination aria-label='Sidenavigering'>
          <Pagination.List>
            <Pagination.Item>
              <Pagination.Button
                {...prevButtonProps}
                aria-label='Forrige side'
                disabled={!hasPrev}
              >
                {'Forrige'}
              </Pagination.Button>
            </Pagination.Item>
            {pages.map(({ page, itemKey, buttonProps }) => (
              <Pagination.Item key={itemKey}>
                {typeof page === 'number' && (
                  <Pagination.Button
                    {...buttonProps}
                    aria-label={`Side ${page}`}
                  >
                    {page}
                  </Pagination.Button>
                )}
              </Pagination.Item>
            ))}
            <Pagination.Item>
              <Pagination.Button
                {...nextButtonProps}
                disabled={!hasNext}
                aria-label='Neste side'
              >
                {'Neste'}
              </Pagination.Button>
            </Pagination.Item>
          </Pagination.List>
        </Pagination>
      </div>
    </div>
  );
};
interface ListControlsProps {
  customer: Customer;
  isAssigned: boolean;
  isLoading: boolean;
  onRemoveCustomer?: (customerId: string) => void;
  onAddCustomer: (customerId: string) => void;
}
const ListControls = ({
  customer,
  isAssigned,
  isLoading,
  onRemoveCustomer,
  onAddCustomer,
}: ListControlsProps): React.ReactNode => {
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
      {!isLoading && isAssigned && onRemoveCustomer && (
        <Button
          variant='tertiary'
          data-size='sm'
          data-color='danger'
          aria-label={`Fjern ${customer.name} fra systemtilgang`}
          onClick={() => onRemoveCustomer(customer.id)}
        >
          <MinusCircleIcon /> {'Fjern fra systemtilgang'}
        </Button>
      )}
      {!isLoading && !isAssigned && (
        <Button
          variant='tertiary'
          data-size='sm'
          aria-label={`Legg til ${customer.name} i systemtilgang`}
          onClick={() => onAddCustomer(customer.id)}
        >
          <PlusCircleIcon /> {'Legg til i systemtilgang'}
        </Button>
      )}
    </>
  );
};
