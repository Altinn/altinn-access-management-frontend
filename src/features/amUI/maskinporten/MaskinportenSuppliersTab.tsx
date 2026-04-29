import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DsButton,
  DsDialog,
  DsHeading,
  DsParagraph,
  formatDisplayName,
} from '@altinn/altinn-components';

import {
  useGetMaskinportenSuppliersQuery,
  useRemoveMaskinportenSupplierMutation,
} from '@/rtk/features/maskinportenApi';

import type { UserActionTarget } from '../common/UserSearch/types';
import type { UserSearchProps } from '../common/UserSearch/UserSearch';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { MaskinportenAddSupplierButton } from './MaskinportenAddSupplierButton';
import { MaskinportenUserSearch } from './MaskinportenUserSearch';
import classes from './MaskinportenPage.module.css';
import { useNavigate } from 'react-router';

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
  const [removeSupplier, { isLoading: isRemoving }] = useRemoveMaskinportenSupplierMutation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pendingDelete, setPendingDelete] = useState<{ orgNumber: string; name: string } | null>(
    null,
  );

  const handleRevoke = (user: UserActionTarget) => {
    const connection = suppliers?.find((c) => c.party.id === user.id);
    if (connection?.party.organizationIdentifier) {
      setPendingDelete({ orgNumber: connection.party.organizationIdentifier, name: user.name });
      dialogRef.current?.showModal();
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    await removeSupplier({ party, supplier: pendingDelete.orgNumber, cascade: true }).unwrap();
    dialogRef.current?.close();
    setPendingDelete(null);
  };

  const AddSupplierButton: UserSearchProps['AddUserButton'] = (props) => (
    <MaskinportenAddSupplierButton
      party={party}
      onComplete={(user) => navigate(`/maskinporten/supplier/${user.organizationIdentifier}`)}
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
        onRevoke={handleRevoke}
        revokeLabel={t('common.delete')}
        getUserLink={(user) => {
          const orgNr = suppliers?.find((c) => c.party.id === user.id)?.party
            .organizationIdentifier;
          return orgNr ? `/maskinporten/supplier/${orgNr}` : '';
        }}
      />
      <DsDialog
        ref={dialogRef}
        closedby='any'
        onClose={() => setPendingDelete(null)}
      >
        <DsHeading data-size='sm'>{t('maskinporten_page.remove_supplier_heading')}</DsHeading>
        <DsParagraph>
          {t('maskinporten_page.remove_supplier_body', { name: pendingDelete?.name ?? '' })}
        </DsParagraph>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <DsButton
            data-color='danger'
            onClick={handleConfirmDelete}
            loading={isRemoving}
          >
            {t('maskinporten_page.remove_supplier_confirm')}
          </DsButton>
          <DsButton
            variant='secondary'
            onClick={() => dialogRef.current?.close()}
            disabled={isRemoving}
          >
            {t('common.cancel')}
          </DsButton>
        </div>
      </DsDialog>
    </div>
  );
};
