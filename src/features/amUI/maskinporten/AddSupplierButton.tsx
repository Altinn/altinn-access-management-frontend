import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsHeading, DsParagraph } from '@altinn/altinn-components';

import { useAddMaskinportenSupplierMutation } from '@/rtk/features/maskinportenApi';
import type { User } from '@/rtk/features/userInfoApi';

import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { AddUserDialog } from '../common/AddUserDialog/AddUserDialog';
import type { Recipient } from '../common/AddUserDialog/recipient';

interface AddSupplierButtonProps {
  party: string;
  onComplete: (user: User) => void;
}

export const AddSupplierButton = ({ party, onComplete }: AddSupplierButtonProps) => {
  const { t } = useTranslation();
  const { actingParty } = usePartyRepresentation();
  const [addSupplier] = useAddMaskinportenSupplierMutation();

  const handleAddSupplier = async (recipient: Recipient) => {
    if (recipient.kind !== 'org') {
      return;
    }
    await addSupplier({ party, supplier: recipient.organization.orgNumber }).unwrap();
    onComplete({
      name: recipient.organization.name,
      type: 'organisasjon',
      children: null,
      id: recipient.organization.partyUuid,
      organizationIdentifier: recipient.organization.orgNumber,
    });
  };

  return (
    <AddUserDialog
      recipientKinds={[
        {
          type: 'org',
          submitLabel: t('new_user_modal.add_org_button'),
          ownOrgNumber: actingParty?.orgNumber,
          ownOrgWarning: (
            <DsAlert
              data-size='sm'
              data-color='warning'
            >
              <DsHeading
                data-size='xs'
                level={3}
              >
                {t('maskinporten_page.own_org_number_warning')}
              </DsHeading>
              <DsParagraph data-size='sm'>
                {t('maskinporten_page.own_org_number_warning_body')}
              </DsParagraph>
            </DsAlert>
          ),
        },
      ]}
      triggerLabel={t('maskinporten_page.add_supplier_button')}
      heading={t('maskinporten_page.add_supplier_button')}
      onSubmit={handleAddSupplier}
    />
  );
};
