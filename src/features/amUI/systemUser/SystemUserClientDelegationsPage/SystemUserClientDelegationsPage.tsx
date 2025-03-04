import React, { useState } from 'react';
import {
  Alert,
  Spinner,
  Paragraph,
  Heading,
  Button,
  Search,
  Pagination,
  usePagination,
} from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { List } from '@altinn/altinn-components';
import { MinusCircleIcon, PlusCircleIcon, PlusIcon } from '@navikt/aksel-icons';

import { useGetSystemUserQuery } from '@/rtk/features/systemUserApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { PageWrapper } from '@/components';
import { SystemUserPath } from '@/routes/paths';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageContainer } from '@/features/amUI/common/PageContainer/PageContainer';
import { PageLayoutWrapper } from '@/features/amUI/common/PageLayoutWrapper';

import { SystemUserHeader } from '../components/SystemUserHeader/SystemUserHeader';

interface Customer {
  id: string;
  displayName: string;
  orgNo: string;
}

const generateCustomer = () => {
  return {
    id: new Date().getTime().toString() + Math.random(),
    displayName: Math.random().toString(36).slice(2),
    orgNo: Math.floor(Math.random() * 1000000000).toString(),
  };
};
const customers: Customer[] = [
  {
    id: '1',
    displayName: 'Svindel AS',
    orgNo: '236147254',
  },
  {
    id: '2',
    displayName: 'Frø og brød AS',
    orgNo: '971032081',
  },
  {
    id: '3',
    displayName: 'Kakespisere AS',
    orgNo: '974761076',
  },
  {
    id: '4',
    displayName: 'Stål og skruer AS',
    orgNo: '991825827',
  },
  {
    id: '5',
    displayName: 'Gjerrigknarkene AS',
    orgNo: '994598759',
  },
  ...Array.from({ length: 200 }).map(() => generateCustomer()),
  {
    id: '6',
    displayName: 'Siste AS',
    orgNo: '994598759',
  },
];

const filterCustomerList = (list: Customer[], searchString: string): Customer[] => {
  return list.filter((customer) => {
    const isOrgNoMatch = customer.orgNo.indexOf(searchString.replace(' ', '')) > -1;
    const isNameMatch = customer.displayName.toLowerCase().indexOf(searchString.toLowerCase()) > -1;
    return isOrgNoMatch || isNameMatch;
  });
};

export const SystemUserClientDelegationsPage = (): React.ReactNode => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  useDocumentTitle(t('systemuser_overviewpage.page_title'));
  const partyId = getCookie('AltinnPartyId');

  const [isAddCustomerMode, setIsAddCustomerMode] = useState<boolean>(false);
  const [delegatedIds, setDelegatedIds] = useState<string[]>(['1', '2', '3']);

  const {
    data: systemUser,
    isError: isLoadSystemUserError,
    isLoading: isLoadingSystemUser,
  } = useGetSystemUserQuery({ partyId, systemUserId: id || '' });

  const handleNavigateBack = (): void => {
    if (isAddCustomerMode) {
      setIsAddCustomerMode(false);
    } else {
      navigate(`/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`);
    }
  };

  const enableAddCustomers = (): void => {
    setIsAddCustomerMode(true);
  };

  const onAddCustomer = (customerId: string) => {
    setDelegatedIds((oldDelegatedIds) => [...oldDelegatedIds, customerId]);
  };

  const onRemoveCustomer = (customerId: string) => {
    setDelegatedIds((oldDelegatedIds) => oldDelegatedIds.filter((id) => id !== customerId));
  };

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <PageContainer onNavigateBack={handleNavigateBack}>
          {isLoadingSystemUser && (
            <Spinner
              aria-label={t('systemuser_detailpage.loading_systemuser')}
              title={''}
            />
          )}
          {isLoadSystemUserError && (
            <Alert data-color='danger'>{t('systemuser_detailpage.load_systemuser_error')}</Alert>
          )}
          {isAddCustomerMode && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Heading
                level={1}
                data-size='md'
              >
                {`Mine kunder`}
              </Heading>
              <Paragraph>{`Legg til flere kunder til systemtilgangen ${systemUser?.integrationTitle}.`}</Paragraph>
              <div>
                <CustomerList
                  list={customers}
                  assignedIds={delegatedIds}
                  onAddCustomer={onAddCustomer}
                  onRemoveCustomer={onRemoveCustomer}
                />
              </div>
            </div>
          )}
          {systemUser && !isAddCustomerMode && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <SystemUserHeader
                title={'systemuser_client_delegation_overview.banner_title'}
                integrationTitle={systemUser.integrationTitle}
              />
              <Heading
                level={1}
                data-size='md'
              >
                {`Administrere kunder`}
              </Heading>
              {delegatedIds.length === 0 ? (
                <>
                  <Paragraph>
                    Her kan du legge til kunder som skal være tilknyttet systemtilgangen. For at du
                    skal kunne legge til en kunde må du ha “ein eller anna rettighet i orden”
                  </Paragraph>
                  <Button
                    variant='secondary'
                    onClick={enableAddCustomers}
                  >
                    <PlusIcon />
                    Legg til kunder
                  </Button>
                </>
              ) : (
                <>
                  <Paragraph>Kunder som er lagt til systemtilgangen.</Paragraph>
                  <CustomerList
                    list={customers.filter((customer) => delegatedIds.indexOf(customer.id) > -1)}
                    assignedIds={delegatedIds}
                    onAddCustomer={onAddCustomer}
                    onRemoveCustomer={onRemoveCustomer}
                  >
                    <Button
                      variant='tertiary'
                      size='sm'
                      onClick={enableAddCustomers}
                      style={{ alignSelf: 'flex-end' }}
                    >
                      <PlusIcon />
                      Legg til flere kunder
                    </Button>
                  </CustomerList>
                </>
              )}
            </div>
          )}
        </PageContainer>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

interface CustomerListProps {
  list: Customer[];
  assignedIds: string[];
  onAddCustomer: (customerId: string) => void;
  onRemoveCustomer: (customerId: string) => void;
  children?: React.ReactNode;
}
const itemsPerPage = 10;
const showPages = 7;
const CustomerList = ({
  list,
  assignedIds,
  onAddCustomer,
  onRemoveCustomer,
  children,
}: CustomerListProps) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const filteredSearchList = filterCustomerList(list, searchValue);

  const totalPages = Math.ceil(filteredSearchList.length / itemsPerPage);

  const { pages, prevButtonProps, nextButtonProps, hasNext, hasPrev } = usePagination({
    currentPage,
    setCurrentPage,
    totalPages: totalPages,
    showPages: totalPages < showPages ? totalPages : showPages,
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = currentPage * itemsPerPage;

  const onSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchValue(event.target.value);
    setCurrentPage(1);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Search
          style={{ maxWidth: '20rem' }}
          value={searchValue}
          size='sm'
          placeholder='Søk i kunder'
          onChange={onSearch}
          onClear={() => setSearchValue('')}
          hideLabel
          label='Søk i kunder'
        />
        {children}
      </div>
      <List
        items={filteredSearchList.slice(startIndex, endIndex)?.map((customer) => {
          return {
            title: customer.displayName,
            id: customer.id,
            disabled: true,
            as: 'div',
            avatar: { type: 'company', name: customer.displayName },
            description: `Org. nr. ${customer.orgNo.match(/.{1,3}/g)?.join(' ')}`,
            controls: (
              <>
                {assignedIds.some((x) => x === customer.id) ? (
                  <Button
                    variant='tertiary'
                    data-size='sm'
                    data-color='danger'
                    aria-label={`Fjern ${customer.displayName} fra systemtilgang`}
                    onClick={() => onRemoveCustomer(customer.id)}
                  >
                    <MinusCircleIcon /> Fjern fra systemtilgang
                  </Button>
                ) : (
                  <Button
                    variant='tertiary'
                    data-size='sm'
                    aria-label={`Legg til kunde ${customer.displayName}`}
                    onClick={() => onAddCustomer(customer.id)}
                  >
                    <PlusCircleIcon /> Legg til kunde
                  </Button>
                )}
              </>
            ),
          };
        })}
      />
      <div style={{ justifySelf: 'center' }}>
        <Pagination aria-label='Sidenavigering'>
          <Pagination.List>
            <Pagination.Item>
              <Pagination.Button
                {...prevButtonProps}
                aria-label='Forrige side'
                disabled={!hasPrev}
              >
                Forrige
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
                Neste
              </Pagination.Button>
            </Pagination.Item>
          </Pagination.List>
        </Pagination>
      </div>
    </div>
  );
};
