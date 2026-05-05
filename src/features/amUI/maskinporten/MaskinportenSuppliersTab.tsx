import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDisplayName } from '@altinn/altinn-components';

import { useGetMaskinportenSuppliersQuery } from '@/rtk/features/maskinportenApi';

import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { MaskinportenAddSupplierButton } from './MaskinportenAddSupplierButton';
import { MaskinportenUserSearch } from './MaskinportenUserSearch';
import classes from './MaskinportenPage.module.css';
import { useNavigate } from 'react-router';
import { DsParagraph } from '@altinn/altinn-components';

type MaskinportenSuppliersTabProps = {
  party: string;
  isActive: boolean;
  canFetch: boolean;
};

export const MaskinportenSuppliersTab = ({
  party,
  isActive,
  canFetch,
}: MaskinportenSuppliersTabProps) => {
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
      <MaskinportenAddSupplierButton
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
      <DsParagraph>
        {t('maskinporten_page.suppliers_description', {
          name: formatDisplayName({ fullName: actingParty?.name ?? '', type: 'company' }) ?? '',
        })}
      </DsParagraph>
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
