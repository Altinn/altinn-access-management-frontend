import * as React from 'react';
import { Button, DsDialog } from '@altinn/altinn-components';
import { ArrowLeftIcon, PlusIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import modalClasses from '../common/DelegationModal/DelegationModal.module.css';
import { MaskinportenScopeInfo } from './MaskinportenScopeInfo';
import { MaskinportenScopeSearch } from './MaskinportenScopeSearch';

export const MaskinportenScopeModal = () => {
  const { t } = useTranslation();
  const [selectedResource, setSelectedResource] = React.useState<ServiceResource | undefined>();
  const [searchString, setSearchString] = React.useState('');
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  const reset = () => {
    setSelectedResource(undefined);
    setSearchString('');
  };

  return (
    <DsDialog.TriggerContext>
      <DsDialog.Trigger
        data-size='sm'
        variant='primary'
        className={modalClasses.triggerButton}
      >
        {t('maskinporten_page.add_scope_button')}
        <PlusIcon />
      </DsDialog.Trigger>
      <DsDialog
        className={modalClasses.modalDialog}
        closedby='any'
        closeButton={t('common.close')}
        onClose={reset}
        ref={dialogRef}
      >
        {selectedResource && (
          <Button
            className={modalClasses.backButton}
            variant='tertiary'
            data-color='neutral'
            onClick={() => setSelectedResource(undefined)}
          >
            <ArrowLeftIcon />
            {t('common.back')}
          </Button>
        )}
        <div className={modalClasses.content}>
          {selectedResource ? (
            <MaskinportenScopeInfo resource={selectedResource} />
          ) : (
            <MaskinportenScopeSearch
              onSelect={setSelectedResource}
              searchString={searchString}
              setSearchString={setSearchString}
            />
          )}
        </div>
      </DsDialog>
    </DsDialog.TriggerContext>
  );
};
