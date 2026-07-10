import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsParagraph, formatDisplayName } from '@altinn/altinn-components';

import { useGetMaskinportenSuppliersQuery } from '@/rtk/features/maskinportenApi';

import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { AddSupplierButton } from './AddSupplierButton';
import { MaskinportenUserSearch } from './MaskinportenUserSearch';
import { MaskinportenInfoPopover } from './MaskinportenInfoPopover';
import classes from './MaskinportenPage.module.css';
import { useNavigate } from 'react-router';

type SuppliersTabProps = {
  party: string;
  isActive: boolean;
  canFetch: boolean;
};

export const SuppliersTab = ({ party, isActive, canFetch }: SuppliersTabProps) => {
  const { t } = useTranslation();
  const {
    data: suppliers,
    isLoading,
    error,
  } = useGetMaskinportenSuppliersQuery({ party }, { skip: !isActive || !canFetch || !party });
  const { actingParty } = usePartyRepresentation();
  const navigate = useNavigate();

  return (
    <div className={classes.panelContent}>
      <div className={classes.description}>
        <DsParagraph>
          {t('maskinporten_page.suppliers_description', {
            name: formatDisplayName({ fullName: actingParty?.name ?? '', type: 'company' }) ?? '',
          })}
        </DsParagraph>
        <MaskinportenInfoPopover
          triggerAriaLabel={t('maskinporten_page.suppliers_info_icon_label')}
          paragraph1={t('maskinporten_page.suppliers_info_body1')}
          paragraph2={t('maskinporten_page.suppliers_info_body2')}
        />
      </div>
      <MaskinportenUserSearch
        connections={suppliers}
        isLoading={isLoading}
        error={error}
        emptyText={t('maskinporten_page.no_suppliers')}
        canDelegate={true}
        AddUserButton={
          <AddSupplierButton
            party={party}
            onComplete={(user) => {
              navigate(`/maskinporten/supplier/${user.organizationIdentifier}`);
            }}
          />
        }
        addUserButtonLabel={t('maskinporten_page.add_supplier_button')}
        getUserLink={(user) => {
          const orgNr = suppliers?.find((c) => c.party.id === user.id)?.party
            .organizationIdentifier;
          return orgNr ? `/maskinporten/supplier/${orgNr}` : '';
        }}
      />
    </div>
  );
};
