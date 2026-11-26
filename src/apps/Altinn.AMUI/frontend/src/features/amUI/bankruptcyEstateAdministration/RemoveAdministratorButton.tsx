import React from 'react';
import { useTranslation } from 'react-i18next';
import { MinusCircleIcon } from '@navikt/aksel-icons';

import type { PartyEntity } from '@/dataObjects/dtos/Party';
import { formatEntityDisplayName } from '@/resources/utils/reporteeUtils';
import {
  useGetAdministratorsQuery,
  useRemoveAdministratorMutation,
} from '@/rtk/features/bankruptcyEstateApi';

import { DeleteClientProviderModal } from '../common/DeleteClientProviderModal/DeleteClientProviderModal';
import { handleSelectAccount } from '../common/PageLayoutWrapper/useHeader';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { useRestoreFocusOnDataChange } from '../common/RestoreFocus';

import { ADMINISTRATOR_SEARCH_ID } from './administratorSearchId';
import classes from './RemoveAdministratorButton.module.css';

interface RemoveAdministratorButtonProps {
  administrator: PartyEntity;
  /*** The row that gets focus when this one is gone. The search field when there is none */
  focusIdAfterRemoval?: string;
}

/*** "Slett fullmakt" for one administrator, with a confirmation before anything is removed */
export const RemoveAdministratorButton = ({
  administrator,
  focusIdAfterRemoval,
}: RemoveAdministratorButtonProps) => {
  const { t } = useTranslation();
  const { actingParty, selfParty } = usePartyRepresentation();
  const [removeAdministrator] = useRemoveAdministratorMutation();

  const { data: administrators } = useGetAdministratorsQuery();
  const requestFocusOnDataChange = useRestoreFocusOnDataChange(administrators);

  const onConfirm = async () => {
    await removeAdministrator({ user: administrator.id }).unwrap();
    // Someone who removes themself can no longer act for the trustee, so they continue as themself.
    if (administrator.id === selfParty?.id) {
      handleSelectAccount(selfParty.id);
      return;
    }
    // The row disappears when the list is fetched again, so focus moves to a neighbouring row,
    // or to the search field when no row is left.
    requestFocusOnDataChange(focusIdAfterRemoval ?? administrator.id, ADMINISTRATOR_SEARCH_ID);
  };

  return (
    <span
      data-color='accent'
      className={classes.remove}
    >
      <DeleteClientProviderModal
        triggerIcon={<MinusCircleIcon aria-hidden='true' />}
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
