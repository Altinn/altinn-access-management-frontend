import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@altinn/altinn-components';

import type { Party } from '@/rtk/features/lookupApi';
import { useGetReporteePartyQuery } from '@/rtk/features/lookupApi';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';

import { useAccessPackageActions } from '../../common/AccessPackageList/useAccessPackageActions';

interface DeletePackageButtonProps {
  accessPackage: AccessPackage;
  toParty?: Party;
  fullText?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export const DeletePackageButton = ({
  accessPackage,
  toParty,
  fullText = false,
  onClick,
  ...props
}: DeletePackageButtonProps) => {
  const { t } = useTranslation();
  const { data: representingParty } = useGetReporteePartyQuery();
  const { onRevoke } = useAccessPackageActions({ toUuid: toParty?.partyUuid || '' });

  const onClick = () => {
    onRevoke(accessPackage);
  };

  return (
    representingParty && (
      <Button
        {...props}
        variant={'outline'}
        size='md'
        onClick={onClick}
      >
        {fullText ? t('common.delete_poa') : t('common.delete')}
      </Button>
    )
  );
};
