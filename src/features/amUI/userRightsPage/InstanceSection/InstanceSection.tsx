import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsHeading, DsParagraph } from '@altinn/altinn-components';

import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { InstanceList } from '@/features/amUI/common/InstanceList/InstanceList';
import { DelegationAction, EditModal } from '@/features/amUI/common/DelegationModal/EditModal';
import { type InstanceDelegation, useGetInstancesQuery } from '@/rtk/features/instanceApi';
import classes from './InstanceSection.module.css';

export const InstanceSection = () => {
  const { t } = useTranslation();
  const { toParty, actingParty, fromParty } = usePartyRepresentation();

  const modalRef = React.useRef<HTMLDialogElement>(null);
  const [selectedInstance, setSelectedInstance] = React.useState<InstanceDelegation | null>(null);

  const {
    data: instances = [],
    isLoading,
    isError,
  } = useGetInstancesQuery(
    {
      party: actingParty?.partyUuid || '',
      from: fromParty?.partyUuid,
      to: toParty?.partyUuid,
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
        <InstanceList
          instances={instances}
          isLoading={isLoading}
          onSelect={(instance) => {
            setSelectedInstance(instance);
            modalRef.current?.showModal();
          }}
        />
      )}
      <EditModal
        ref={modalRef}
        resource={selectedInstance?.resource}
        instance={
          selectedInstance
            ? {
                instanceUrn: selectedInstance.instance.refId,
                instanceName: selectedInstance.instance.type?.name,
              }
            : undefined
        }
        onClose={() => setSelectedInstance(null)}
        availableActions={[DelegationAction.REVOKE, DelegationAction.DELEGATE]}
      />
    </div>
  );
};
