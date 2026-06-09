import {
  Button,
  DsDialog,
  DsHeading,
  DsParagraph,
  DsSwitch,
  formatDisplayName,
} from '@altinn/altinn-components';
import { DownloadIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import { useRef, useState } from 'react';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import { PartyType, useGetIsAdminQuery } from '@/rtk/features/userInfoApi';

import classes from './DownloadFileButton.module.css';

export interface DownloadFileButtonProps {
  partyUuid?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
  className?: string;
}

export const DownloadFileButton = ({
  partyUuid,
  size = 'sm',
  iconOnly = false,
  className,
}: DownloadFileButtonProps) => {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [includeSubunits, setIncludeSubunits] = useState(false);

  const { data: isAdmin } = useGetIsAdminQuery();
  const { fromParty } = usePartyRepresentation();
  const reporteeName = formatDisplayName({ fullName: fromParty?.name || '', type: 'company' });

  const handleDownload = () => {
    if (partyUuid) {
      const url = `/accessmanagement/api/v1/delegationexport?partyUuid=${partyUuid}&includeSubunits=${includeSubunits}`;
      window.open(url, '_blank');
      dialogRef.current?.close();
    }
  };

  const openDialog = () => {
    setIsDialogOpen(true);
    requestAnimationFrame(() => dialogRef.current?.showModal());
  };

  const closeDialog = () => {
    dialogRef.current?.close();
    setIsDialogOpen(false);
  };

  if (fromParty?.partyTypeName !== PartyType.Organization || !isAdmin) {
    return null;
  }

  return (
    <div className={className}>
      <Button
        variant='tertiary'
        onClick={openDialog}
        size={size}
        className={classes.triggerButton}
      >
        <DownloadIcon aria-hidden />
        {!iconOnly && t('download_file.trigger_button')}
      </Button>

      {isDialogOpen && (
        <DsDialog
          ref={dialogRef}
          onClose={closeDialog}
          closedby={'any'}
          className={classes.dialog}
        >
          <div className={classes.modalContent}>
            <DsHeading level={2}>{t('download_file.title')}</DsHeading>
            <DsParagraph>
              {t('download_file.description_p1', { reportee: reporteeName })}
            </DsParagraph>
            <DsParagraph>{t('download_file.description_p2')}</DsParagraph>
            <DsSwitch
              checked={includeSubunits}
              onChange={(event) => setIncludeSubunits(event.target.checked)}
              label={t('download_file.include_subunits_label', { reportee: reporteeName })}
            />
            <div className={classes.buttons}>
              <Button
                variant='primary'
                onClick={handleDownload}
              >
                <DownloadIcon aria-hidden />
                {t('download_file.start_download')}
              </Button>
              <Button
                variant='secondary'
                onClick={closeDialog}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </DsDialog>
      )}
    </div>
  );
};
