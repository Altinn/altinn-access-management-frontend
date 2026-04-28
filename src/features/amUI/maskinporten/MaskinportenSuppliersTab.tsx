import { useTranslation } from 'react-i18next';
import { DsParagraph, formatDisplayName } from '@altinn/altinn-components';

import { useGetMaskinportenSuppliersQuery } from '@/rtk/features/maskinportenApi';

import type { UserSearchProps } from '../common/UserSearch/UserSearch';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { MaskinportenAddSupplierButton } from './MaskinportenAddSupplierButton';
import { MaskinportenUserSearch } from './MaskinportenUserSearch';
import classes from './MaskinportenPage.module.css';

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
  const AddSupplierButton: UserSearchProps['AddUserButton'] = (props) => (
    <MaskinportenAddSupplierButton
      party={party}
      {...props}
    />
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
        AddUserButton={AddSupplierButton}
        addUserButtonLabel={t('maskinporten_page.add_supplier_button')}
      />
    </div>
  );
};
