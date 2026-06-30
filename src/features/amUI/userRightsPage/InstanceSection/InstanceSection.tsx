import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsHeading, DsParagraph } from '@altinn/altinn-components';

import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { InstanceList } from '@/features/amUI/common/InstanceList/InstanceList';
import { instanceRowId } from '@/features/amUI/common/InstanceList/instanceListUtils';
import { DelegationAction, EditModal } from '@/features/amUI/common/DelegationModal/EditModal';
import { type InstanceDelegation, useGetInstancesQuery } from '@/rtk/features/instanceApi';
import {
  RestoreFocusFallback,
  RestoreFocusProvider,
  useRestoreFocus,
  useRestoreFocusContext,
} from '@/features/amUI/common/RestoreFocus';
import classes from './InstanceSection.module.css';
import { useCanGiveAccess } from '@/resources/hooks/useCanGiveAccess';
import { useParams } from 'react-router';

const INSTANCES_HEADING_ID = 'instances_title';

const InstanceSectionContent = ({ isReportee = false }: { isReportee?: boolean }) => {
  const { t, i18n } = useTranslation();
  const { toParty, actingParty, fromParty } = usePartyRepresentation();

  const modalRef = React.useRef<HTMLDialogElement>(null);
  const [selectedInstance, setSelectedInstance] = React.useState<InstanceDelegation | null>(null);
  const restoreFocusContext = useRestoreFocusContext();

  const { id } = useParams();
  const canGiveAccess = useCanGiveAccess(id ?? '', isReportee);

  const {
    data: instances = [],
    isLoading,
    isError,
  } = useGetInstancesQuery(
    {
      party: actingParty?.partyUuid || '',
      from: fromParty?.partyUuid,
      to: toParty?.partyUuid,
      language: i18n.language,
    },
    {
      skip: !actingParty?.partyUuid || !fromParty?.partyUuid || !toParty?.partyUuid,
    },
  );

  return (
    <div className={classes.instanceSectionContainer}>
      <DsHeading
        level={2}
        data-size='xs'
        id={INSTANCES_HEADING_ID}
      >
        {t('user_rights_page.instances_title')}
      </DsHeading>
      {isError && (
        <DsAlert
          role='alert'
          data-color='danger'
        >
          <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
        </DsAlert>
      )}
      {!isError && (
        <RestoreFocusFallback>
          <InstanceList
            instances={instances}
            isLoading={isLoading}
            onSelect={(instance) => {
              setSelectedInstance(instance);
              modalRef.current?.showModal();
            }}
          />
        </RestoreFocusFallback>
      )}
      <EditModal
        ref={modalRef}
        resource={selectedInstance?.resource}
        instance={
          selectedInstance
            ? {
                instanceUrn: selectedInstance.instance.refId,
                dialogLookup: selectedInstance.dialogLookup,
              }
            : undefined
        }
        onClose={() => {
          // Request focus synchronously before clearing state. If the instance was revoked inside
          // the modal its row is gone, so fall back to the section heading instead of <body>.
          if (selectedInstance) {
            restoreFocusContext?.requestFocus(
              instanceRowId(selectedInstance),
              INSTANCES_HEADING_ID,
            );
          }
          setSelectedInstance(null);
        }}
        availableActions={[
          ...(canGiveAccess ? [DelegationAction.DELEGATE] : []),
          DelegationAction.REVOKE,
        ]}
      />
    </div>
  );
};

export const InstanceSection = ({ isReportee = false }: { isReportee?: boolean }) => {
  const restoreFocus = useRestoreFocus();
  return (
    <RestoreFocusProvider restoreFocus={restoreFocus}>
      <InstanceSectionContent isReportee={isReportee} />
    </RestoreFocusProvider>
  );
};
