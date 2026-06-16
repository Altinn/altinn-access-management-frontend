import {
  Button,
  DsAlert,
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
import {
  PartyType,
  useGetIsAdminQuery,
  useGetReporteeListForAuthorizedUserQuery,
} from '@/rtk/features/userInfoApi';

import classes from './DownloadFileButton.module.css';
import { isSubUnitByType } from '@/resources/utils/reporteeUtils';

const MAX_SUBUNITS_FOR_DOWNLOAD_OPTION = 500;

export interface DownloadFileButtonProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
  className?: string;
}

export const DownloadFileButton = ({
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
  const { data: accountList } = useGetReporteeListForAuthorizedUserQuery(undefined, {
    skip: !isAdmin || fromParty?.partyTypeName !== PartyType.Organization,
  });
  const fromAccountSubunitsNumber =
    accountList?.find((account) => account.partyUuid === fromParty?.partyUuid)?.subunits?.length ||
    0;
  const allowSubunitDownload =
    !isSubUnitByType(fromParty?.variant) &&
    fromAccountSubunitsNumber > 0 &&
    fromAccountSubunitsNumber <= MAX_SUBUNITS_FOR_DOWNLOAD_OPTION;

  const handleDownload = () => {
    if (!fromParty) return;

    const params = new URLSearchParams({
      partyUuid: fromParty.partyUuid,
      includeSubunits: String(includeSubunits),
    });

    const url = `/accessmanagement/api/v1/delegationexport?${params.toString()}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    dialogRef.current?.close();
    setIsDialogOpen(false);
  };

  const openDialog = () => {
    if (isDialogOpen) return;
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
        aria-label={iconOnly ? t('download_file.trigger_button') : undefined}
      >
        <DownloadIcon aria-hidden />
        {!iconOnly && t('download_file.trigger_button')}
      </Button>

      {isDialogOpen && (
        <DsDialog
          ref={dialogRef}
          onClose={() => setIsDialogOpen(false)}
          closedby={'any'}
          className={classes.dialog}
        >
          <div className={classes.modalContent}>
            <DsHeading level={2}>{t('download_file.title')}</DsHeading>
            <DsParagraph>
              {t('download_file.description_p1', { reportee: reporteeName })}
            </DsParagraph>
            <DsParagraph>{t('download_file.description_p2')}</DsParagraph>
            {allowSubunitDownload && (
              <DsSwitch
                checked={includeSubunits}
                onChange={(event) => setIncludeSubunits(event.target.checked)}
                label={t('download_file.include_subunits_label', { reportee: reporteeName })}
              />
            )}
            {fromAccountSubunitsNumber > MAX_SUBUNITS_FOR_DOWNLOAD_OPTION && (
              <DsAlert
                data-color='warning'
                data-size='sm'
                className={classes.warning}
              >
                <DsParagraph>{t('download_file.too_many_subunits_warning')}</DsParagraph>
              </DsAlert>
            )}
            <div className={classes.buttons}>
              <Button
                variant='primary'
                onClick={handleDownload}
              >
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
