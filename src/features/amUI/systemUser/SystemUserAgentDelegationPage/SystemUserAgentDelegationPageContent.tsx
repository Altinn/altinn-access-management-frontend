import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { PencilIcon, PlusIcon } from '@navikt/aksel-icons';
import {
  DsAlert,
  DsButton,
  DsDialog,
  DsHeading,
  DsParagraph,
  Snackbar,
  useSnackbar,
} from '@altinn/altinn-components';

import {
  useAssignCustomerMutation,
  useGetSystemUserReporteeQuery,
  useRemoveCustomerMutation,
} from '@/rtk/features/systemUserApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { SystemUserHeader } from '../components/SystemUserHeader/SystemUserHeader';
import type { AgentDelegation, AgentDelegationCustomer, SystemUser } from '../types';
import { RightsList } from '../components/RightsList/RightsList';
import classes from './SystemUserAgentDelegationPage.module.css';
import { CustomerList } from './CustomerList';
import { useGetIsClientAdminQuery } from '@/rtk/features/userInfoApi';

const getAssignedCustomers = (
  customers: AgentDelegationCustomer[],
  existingAgentDelegations: AgentDelegation[],
): AgentDelegationCustomer[] => {
  const assignedCustomerIds = existingAgentDelegations.map((x) => x.customerId);
  return customers.filter((customer) => assignedCustomerIds.includes(customer.id));
};

interface SystemUserAgentDelegationPageContentProps {
  systemUser: SystemUser;
  customers: AgentDelegationCustomer[];
  existingAgentDelegations: AgentDelegation[];
}
export const SystemUserAgentDelegationPageContent = ({
  systemUser,
  customers,
  existingAgentDelegations,
}: SystemUserAgentDelegationPageContentProps): React.ReactNode => {
  const { t } = useTranslation();
  const partyId = getCookie('AltinnPartyId');
  const partyUuid = getCookie('AltinnPartyUuid');

  const { id } = useParams();
  const modalRef = useRef<HTMLDialogElement>(null);

  const [delegations, setDelegations] = useState<AgentDelegation[]>(existingAgentDelegations);
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const [errorIds, setErrorIds] = useState<string[]>([]);
  const [assignedCustomers, setAssignedCustomers] = useState<AgentDelegationCustomer[]>(
    getAssignedCustomers(customers, existingAgentDelegations),
  );
  const [addAllState, setAddAllState] = useState<{
    maxCount: number;
    progress: number;
    errors: AgentDelegationCustomer[];
  }>({ maxCount: -1, progress: 0, errors: [] });
  const { openSnackbar, dismissSnackbar } = useSnackbar();

  const { data: isClientAdmin } = useGetIsClientAdminQuery();
  const { data: reporteeData } = useGetSystemUserReporteeQuery(partyId);

  const [assignCustomer] = useAssignCustomerMutation();
  const [removeCustomer] = useRemoveCustomerMutation();

  const isAddingAllCustomers = addAllState.maxCount > -1;

  const resetLoadingId = (customerId: string): void => {
    setLoadingIds((oldLoadingIds) => oldLoadingIds.filter((id) => id !== customerId));
  };

  const setErrorId = (customerId: string): void => {
    setErrorIds((oldErrorIds) => [...oldErrorIds, customerId]);
  };

  const showConfirmationSnackbar = (message: string, color: 'success' | 'info'): void => {
    dismissSnackbar();
    openSnackbar({
      message: message,
      color: color,
      dismissable: false,
      className: classes.customerListSnackbar,
    });
  };

  const onAddAllCustomers = async (): Promise<void> => {
    // find all customers to add
    const unAssignedCustomers = customers.filter((customer) => {
      const isAssigned = delegations?.find((x) => x.customerId === customer.id);
      return !isAssigned;
    });

    // set add all state to initial values
    setAddAllState({
      maxCount: unAssignedCustomers.length,
      progress: 0,
      errors: [],
    });

    // add all customers
    for (const customer of unAssignedCustomers) {
      try {
        const delegation = await assignCustomer({
          partyId,
          systemUserId: id ?? '',
          customer: customer,
          partyUuid,
        }).unwrap();
        setAddAllState((oldState) => ({ ...oldState, progress: oldState.progress + 1 }));
        setDelegations((oldDelegations) => [...oldDelegations, delegation]);
      } catch {
        setAddAllState((oldState) => ({
          ...oldState,
          progress: oldState.progress + 1,
          errors: [...oldState.errors, customer],
        }));
      }
    }
  };

  const onRemoveAllCustomers = async (): Promise<void> => {
    // reset states
    setAddAllState({
      maxCount: delegations.length,
      progress: 0,
      errors: [],
    });

    // remove all customers
    for (const delegation of delegations) {
      try {
        await removeCustomer({
          partyId,
          systemUserId: id ?? '',
          delegationId: delegation.delegationId,
          partyUuid,
        }).unwrap();

        setAddAllState((oldState) => ({ ...oldState, progress: oldState.progress + 1 }));
        setDelegations((oldDelegations) =>
          oldDelegations.filter(
            (delegation) => delegation.delegationId !== delegation.delegationId,
          ),
        );
      } catch {
        setAddAllState((oldState) => ({
          ...oldState,
          progress: oldState.progress + 1,
          errors: [
            ...oldState.errors,
            { id: delegation.customerId, name: 'test' } as AgentDelegationCustomer,
          ],
        }));
      }
    }
  };

  const onAddCustomer = (customer: AgentDelegationCustomer): void => {
    setLoadingIds((oldLoadingIds) => [...oldLoadingIds, customer.id]);
    const onAddSuccess = (delegation: AgentDelegation) => {
      setDelegations((oldDelegations) => [...oldDelegations, delegation]);
      showConfirmationSnackbar(
        t('systemuser_agent_delegation.customer_added', {
          customerName: customer.name,
        }),
        'success',
      );
    };
    assignCustomer({ partyId, systemUserId: id ?? '', customer: customer, partyUuid })
      .unwrap()
      .then(onAddSuccess)
      .catch(() => setErrorId(customer.id))
      .finally(() => resetLoadingId(customer.id));
  };

  const onRemoveCustomer = (toRemove: AgentDelegation, customerName: string): void => {
    setLoadingIds((oldLoadingIds) => [...oldLoadingIds, toRemove.customerId]);
    const onRemoveSuccess = () => {
      setDelegations((oldDelegations) =>
        oldDelegations.filter((delegation) => delegation.delegationId !== toRemove.delegationId),
      );
      showConfirmationSnackbar(
        t('systemuser_agent_delegation.customer_removed', {
          customerName,
        }),
        'info',
      );
    };
    removeCustomer({
      partyId,
      systemUserId: id ?? '',
      delegationId: toRemove.delegationId,
      partyUuid,
    })
      .unwrap()
      .then(onRemoveSuccess)
      .catch(() => setErrorId(toRemove.customerId))
      .finally(() => resetLoadingId(toRemove.customerId));
  };

  const enableAddCustomers = (): void => {
    modalRef.current?.showModal();
  };

  // need to use useCallback to get updated assignedIds in onClose
  const onCloseModal = useCallback(() => {
    modalRef.current?.close();
    setAddAllState({
      maxCount: -1,
      progress: 0,
      errors: [],
    });
    setAssignedCustomers(getAssignedCustomers(customers, delegations));
  }, [customers, delegations]);

  return (
    <>
      <DsDialog
        ref={modalRef}
        className={classes.delegationModal}
        onClose={onCloseModal}
        closeButton={isAddingAllCustomers ? false : undefined}
        closedby={isAddingAllCustomers ? 'none' : 'any'}
      >
        <DsHeading
          level={1}
          data-size='sm'
          className={classes.dialogHeader}
        >
          {t('systemuser_agent_delegation.assign_customers', {
            integrationTitle: systemUser?.integrationTitle,
          })}
        </DsHeading>
        <div className={classes.flexContainer}>
          {isAddingAllCustomers ? (
            <AddAllCustomers
              addAllState={addAllState}
              onCloseModal={onCloseModal}
            />
          ) : (
            <>
              <CustomerList
                list={customers}
                delegations={delegations}
                loadingIds={loadingIds}
                errorIds={errorIds}
                onAddCustomer={onAddCustomer}
                onRemoveCustomer={onRemoveCustomer}
              />
              {customers.length === 0 && reporteeData?.name && (
                <DsAlert data-color='warning'>
                  {t('systemuser_agent_delegation.no_customers_warning', {
                    companyName: reporteeData?.name,
                  })}
                </DsAlert>
              )}
              <div>
                <div>
                  <DsButton onClick={onCloseModal}>
                    {t('systemuser_agent_delegation.confirm_close')}
                  </DsButton>
                  <DsButton
                    onClick={onAddAllCustomers}
                    variant='secondary'
                  >
                    {'Legg til alle kunder'}
                  </DsButton>
                  <DsButton
                    onClick={onRemoveAllCustomers}
                    variant='tertiary'
                  >
                    {'Fjern til alle kunder'}
                  </DsButton>
                  <Snackbar className={classes.customerListSnackbar} />
                </div>
              </div>
            </>
          )}
        </div>
      </DsDialog>
      <div className={classes.flexContainer}>
        <SystemUserHeader
          title={systemUser.integrationTitle}
          subTitle={reporteeData?.name}
        />
        <DsHeading
          level={2}
          data-size='xs'
        >
          {systemUser.accessPackages.length === 1
            ? t('systemuser_agent_delegation.access_package_single')
            : t('systemuser_agent_delegation.access_package_plural', {
                accessPackageCount: systemUser.accessPackages.length,
              })}
        </DsHeading>
        <RightsList
          resources={[]}
          accessPackages={systemUser.accessPackages}
          hideHeadings
        />
        <DsHeading
          level={2}
          data-size='xs'
          className={classes.customerHeading}
        >
          {t('systemuser_agent_delegation.assigned_customers_header')}
        </DsHeading>
        {assignedCustomers.length === 0 ? (
          <>
            <DsParagraph>{t('systemuser_agent_delegation.no_assigned_customers')}</DsParagraph>
            {isClientAdmin && (
              <div>
                <DsButton
                  variant='secondary'
                  onClick={enableAddCustomers}
                >
                  <PlusIcon />
                  {t('systemuser_agent_delegation.add_customers')}
                </DsButton>
              </div>
            )}
          </>
        ) : (
          <CustomerList list={assignedCustomers}>
            {isClientAdmin && (
              <DsButton
                variant='secondary'
                onClick={enableAddCustomers}
              >
                <PencilIcon />
                {t('systemuser_agent_delegation.edit_customers')}
              </DsButton>
            )}
          </CustomerList>
        )}
        <DsParagraph
          data-size='xs'
          className={classes.createdBy}
        >
          {t('systemuser_detailpage.created_by', {
            created: new Date(systemUser.created).toLocaleDateString('no-NB', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            }),
          })}
        </DsParagraph>
      </div>
    </>
  );
};

interface AddAllCustomersProps {
  addAllState: {
    maxCount: number;
    progress: number;
    errors: AgentDelegationCustomer[];
  };
  onCloseModal: () => void;
}

const AddAllCustomers = ({ addAllState, onCloseModal }: AddAllCustomersProps) => {
  const { t } = useTranslation();

  return (
    <div>
      <div aria-live='polite'>
        {addAllState.maxCount === addAllState.progress && (
          <div>
            {addAllState.errors.length > 0 ? (
              <div>
                <div>
                  {addAllState.progress - addAllState.errors.length} av {addAllState.maxCount}{' '}
                  kunder ble lagt til
                </div>
                <div>Følgende kunder kunne ikke legges til:</div>
                <ul>
                  {addAllState.errors.map((customer) => (
                    <ul key={customer.id}>{customer.name}</ul>
                  ))}
                </ul>
              </div>
            ) : (
              <div>Alle kunder er lagt til.</div>
            )}
            <DsButton onClick={onCloseModal}>
              {t('systemuser_agent_delegation.confirm_close')}
            </DsButton>
          </div>
        )}
      </div>
      {addAllState.maxCount > addAllState.progress && (
        <div>
          <DsAlert
            data-color='info'
            data-size='sm'
          >
            Ikke lukk denne nettsiden før alle kundene er lagt til.
          </DsAlert>
          <div className={classes.progressContainer}>
            <progress
              className={classes.progressBar}
              max={100}
              value={(addAllState.progress / addAllState.maxCount) * 100}
            >{`${addAllState.progress} / ${addAllState.maxCount}`}</progress>
            <div>
              Legger til kunde {addAllState.progress} av {addAllState.maxCount}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
