import React from 'react';
import { useTranslation } from 'react-i18next';

import type { PartyEntity } from '@/dataObjects/dtos/Party';
import { formatEntityDisplayName } from '@/resources/utils/reporteeUtils';
import { useRemoveAdministratorMutation } from '@/rtk/features/bankruptcyEstateApi';

import { DeleteClientProviderModal } from '../common/DeleteClientProviderModal/DeleteClientProviderModal';
import { handleSelectAccount } from '../common/PageLayoutWrapper/useHeader';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';

import classes from './RemoveAdministratorButton.module.css';

interface RemoveAdministratorButtonProps {
  administrator: PartyEntity;
}

/*** "Slett fullmakt" for one administrator, with a confirmation before anything is removed */
export const RemoveAdministratorButton = ({ administrator }: RemoveAdministratorButtonProps) => {
  const { t } = useTranslation();
  const { actingParty, selfParty } = usePartyRepresentation();
  const [removeAdministrator] = useRemoveAdministratorMutation();

  const onConfirm = async () => {
    await removeAdministrator({ user: administrator.id }).unwrap();
    // Someone who removes themself can no longer act for the trustee, so they continue as themself.
    if (administrator.id === selfParty?.id) {
      handleSelectAccount(selfParty.id);
    }
  };

  return (
    <span
      data-color='company'
      className={classes.remove}
    >
      <DeleteClientProviderModal
        triggerLabel={t('common.delete_poa')}
        heading={t('common.confirm_delete_heading')}
        body={t('bankruptcy_estate_administration_page.remove_administrator_body', {
          name: formatEntityDisplayName(administrator),
          trustee: formatEntityDisplayName(actingParty),
        })}
        confirmLabel={t('common.yes_delete')}
        onConfirm={onConfirm}
      />
    </span>
  );
};
