import React, { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsButton, DsDialog, DsHeading } from '@altinn/altinn-components';
import { PlusIcon } from '@navikt/aksel-icons';

import type { Organization } from '@/rtk/features/lookupApi';
import { useAddMaskinportenSupplierMutation } from '@/rtk/features/maskinportenApi';
import type { User } from '@/rtk/features/userInfoApi';

import { createErrorDetails } from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { NewOrgContent } from '../users/NewUserModal/NewOrgContent';
import classes from '../users/NewUserModal/NewUserModal.module.css';

interface MaskinportenAddSupplierButtonProps {
  party: string;
  isLarge?: boolean;
  onComplete?: (user: User) => void;
}

export const MaskinportenAddSupplierButton = ({
  party,
  isLarge,
  onComplete,
}: MaskinportenAddSupplierButtonProps) => {
  const { t } = useTranslation();
  const { actingParty } = usePartyRepresentation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const modalHeadingId = useId();
  const [errorDetail, setErrorDetail] = useState<{ status: string; time: string } | null>(null);
  const [addSupplier, { isLoading, error }] = useAddMaskinportenSupplierMutation();

  useEffect(() => {
    if (error) {
      setErrorDetail(createErrorDetails(error));
    }
  }, [error]);

  const handleAddSupplier = async (orgData: Organization) => {
    setErrorDetail(null);

    try {
      await addSupplier({ party, supplier: orgData.orgNumber }).unwrap();
      onComplete?.({
        id: orgData.partyUuid,
        name: orgData.name,
        type: 'organisasjon',
        children: null,
        organizationIdentifier: orgData.orgNumber,
      });
      modalRef.current?.close();
    } catch {
      // Error details are set from the RTK mutation error.
    }
  };

  return (
    <>
      <DsButton
        variant={isLarge ? 'primary' : 'secondary'}
        onClick={() => modalRef.current?.showModal()}
        className={isLarge ? classes.largeButton : undefined}
      >
        <PlusIcon aria-label={t('common.add')} />
        {t('maskinporten_page.add_supplier_button')}
      </DsButton>
      <DsDialog
        ref={modalRef}
        closedby='any'
        aria-labelledby={modalHeadingId}
        onClose={() => setErrorDetail(null)}
      >
        <DsHeading
          data-size='xs'
          level={2}
          className={classes.modalHeading}
          id={modalHeadingId}
        >
          {t('maskinporten_page.add_supplier_button')}
        </DsHeading>
        <NewOrgContent
          isLoading={isLoading}
          addOrg={handleAddSupplier}
          errorDetails={errorDetail}
          ownOrgNumber={actingParty?.orgNumber}
        />
      </DsDialog>
    </>
  );
};
