import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsButton, DsListItem, DsListUnordered } from '@altinn/altinn-components';
import type { AgentDelegationCustomer } from '../types';
import classes from './SystemUserAgentDelegationPage.module.css';

interface AddAllCustomersProps {
  addAllState: {
    maxCount: number;
    progress: number;
    errors: AgentDelegationCustomer[];
  };
  onCloseModal: () => void;
}

const CompletionState = ({ addAllState, onCloseModal }: AddAllCustomersProps) => {
  const { t } = useTranslation();

  const closeButton = (
    <div>
      <DsButton onClick={onCloseModal}>{t('systemuser_agent_delegation.confirm_close')}</DsButton>
    </div>
  );

  if (addAllState.errors.length > 0) {
    return (
      <div className={classes.addAllContainer}>
        <DsAlert data-color='warning'>
          Kun {addAllState.progress - addAllState.errors.length} av {addAllState.maxCount} kunder
          ble lagt til.
        </DsAlert>
        <div>Følgende kunder kunne ikke legges til:</div>
        <DsListUnordered>
          {addAllState.errors.map((customer) => (
            <DsListItem key={customer.id}>{customer.name}</DsListItem>
          ))}
        </DsListUnordered>
        {closeButton}
      </div>
    );
  }

  return (
    <div className={classes.addAllContainer}>
      <DsAlert
        data-color='success'
        data-size='sm'
      >
        Alle kunder er lagt til.
      </DsAlert>
      {closeButton}
    </div>
  );
};

const ProgressState = ({ addAllState }: Omit<AddAllCustomersProps, 'onCloseModal'>) => {
  return (
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
  );
};

export const AddAllCustomers = ({ addAllState, onCloseModal }: AddAllCustomersProps) => {
  const isComplete = addAllState.maxCount === addAllState.progress;
  const isInProgress = addAllState.maxCount > addAllState.progress;

  return (
    <div>
      {isComplete && (
        <CompletionState
          addAllState={addAllState}
          onCloseModal={onCloseModal}
        />
      )}
      <div aria-live='polite'>{isInProgress && <ProgressState addAllState={addAllState} />}</div>
    </div>
  );
};
