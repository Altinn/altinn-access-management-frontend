import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DsLink, DsParagraph, formatDisplayName } from '@altinn/altinn-components';

import { useGetMaskinportenSuppliersQuery } from '@/rtk/features/maskinportenApi';

import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { InfoPopover } from '../common/InfoPopover/InfoPopover';
import { AddSupplierButton } from './AddSupplierButton';
import { MaskinportenUserSearch } from './MaskinportenUserSearch';
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

  const addUserButton = useCallback(
    () => (
      <AddSupplierButton
        party={party}
        onComplete={(user) => {
          navigate(`/maskinporten/supplier/${user.organizationIdentifier}`);
        }}
      />
    ),
    [party, navigate],
  );

  return (
    <div className={classes.panelContent}>
      <div className={classes.description}>
        <DsParagraph>
          {t('maskinporten_page.suppliers_description', {
            name: formatDisplayName({ fullName: actingParty?.name ?? '', type: 'company' }) ?? '',
          })}
        </DsParagraph>
        <InfoPopover triggerAriaLabel={t('maskinporten_page.suppliers_info_icon_label')}>
          <DsParagraph>{t('maskinporten_page.suppliers_info_body1')}</DsParagraph>
          <DsLink
            href='https://samarbeid.digdir.no/maskinporten/maskinporten/25'
            target='_blank'
          >
            {t('maskinporten_page.info_box_link')}
          </DsLink>
          <DsParagraph>{t('maskinporten_page.suppliers_info_body2')}</DsParagraph>
        </InfoPopover>
      </div>
      <MaskinportenUserSearch
        connections={suppliers}
        isLoading={isLoading}
        error={error}
        emptyText={t('maskinporten_page.no_suppliers')}
        canDelegate={true}
        AddUserButton={addUserButton}
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
