import React, { useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsButton, DsDialog, DsHeading } from '@altinn/altinn-components';
import { PlusIcon } from '@navikt/aksel-icons';

import type { Organization } from '@/rtk/features/lookupApi';
import { useAddMaskinportenSupplierMutation } from '@/rtk/features/maskinportenApi';
import type { User } from '@/rtk/features/userInfoApi';

import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import { createErrorDetails } from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { NewOrgContent } from '../users/NewUserModal/NewOrgContent';
import classes from '../users/NewUserModal/NewUserModal.module.css';

interface MaskinportenAddSupplierButtonProps {
  party: string;
  isLarge?: boolean;
  onComplete: (user: User) => void;
}

export const MaskinportenAddSupplierButton = ({
  party,
  isLarge = false,
  onComplete,
}: MaskinportenAddSupplierButtonProps) => {
  const { t } = useTranslation();
  const { actingParty } = usePartyRepresentation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const modalHeadingId = useId();
  const [errorDetail, setErrorDetail] = useState<{ status: string; time: string } | null>(null);
  const [addSupplier, { isLoading }] = useAddMaskinportenSupplierMutation();

  const handleAddSupplier = async (orgData: Organization) => {
    setErrorDetail(null);

    try {
      await addSupplier({ party, supplier: orgData.orgNumber }).unwrap();
      onComplete({
        name: orgData.name,
        type: 'organisasjon',
        children: null,
        id: orgData.partyUuid,
        organizationIdentifier: orgData.orgNumber,
      });
    } catch (err) {
      setErrorDetail(createErrorDetails(err as FetchBaseQueryError | SerializedError));
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
