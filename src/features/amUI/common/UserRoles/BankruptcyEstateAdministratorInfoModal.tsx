import {
  DsDialog,
  DsHeading,
  DsListItem,
  DsListUnordered,
  DsParagraph,
} from '@altinn/altinn-components';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import type { PartyEntity } from '@/dataObjects/dtos/Party';
import { getChangeReporteeAndRedirectUrl } from '@/resources/utils/changeReporteeUtils';
import { formatEntityDisplayName } from '@/resources/utils/reporteeUtils';
import { amUIPath, GeneralPath } from '@/routes/paths';

import classes from './clientAccessInfoModal.module.css';

const PACKAGE_NAME_KEYS = [
  'user_roles.bankruptcy_estate_administrator_package_main_administrator',
  'user_roles.bankruptcy_estate_administrator_package_read',
  'user_roles.bankruptcy_estate_administrator_package_write',
];

interface BankruptcyEstateAdministratorInfoModalProps {
  open: boolean;
  onClose: () => void;
  /*** The trustee the role is given by */
  trustee?: PartyEntity;
  /*** True when the trustee is the selected actor. Otherwise the link has to switch actor first */
  isTrusteeSelectedActor: boolean;
}

/*** Explains the Konkursbo administrator role and links to where it is managed */
export const BankruptcyEstateAdministratorInfoModal = ({
  open,
  onClose,
  trustee,
  isTrusteeSelectedActor,
}: BankruptcyEstateAdministratorInfoModalProps) => {
  const { t } = useTranslation();
  const administrationPath = `/${amUIPath.BankruptcyEstateAdministration}`;

  const administrationLink = isTrusteeSelectedActor ? (
    <Link to={administrationPath} />
  ) : (
    <Link
      to={getChangeReporteeAndRedirectUrl(
        trustee?.id ?? '',
        `${window.location.origin}${GeneralPath.BasePath}${administrationPath}`,
      )}
      reloadDocument
    />
  );

  return (
    <DsDialog
      open={open}
      closedby='any'
      closeButton={t('common.close')}
      onClose={onClose}
    >
      <div className={classes.modalContent}>
        <DsHeading
          level={2}
          data-size='xs'
        >
          {t('user_roles.is_bankruptcy_estate_administrator')}
        </DsHeading>
        <DsParagraph data-size='sm'>
          {t('user_roles.bankruptcy_estate_administrator_intro', {
            trustee: formatEntityDisplayName(trustee),
          })}
        </DsParagraph>
        <DsParagraph data-size='sm'>
          {t('user_roles.bankruptcy_estate_administrator_packages')}
        </DsParagraph>
        <DsListUnordered data-size='sm'>
          {PACKAGE_NAME_KEYS.map((key) => (
            <DsListItem key={key}>{t(key)}</DsListItem>
          ))}
        </DsListUnordered>
        <DsParagraph data-size='sm'>
          {t('user_roles.bankruptcy_estate_administrator_can_delegate')}
        </DsParagraph>
        <DsParagraph data-size='sm'>
          <Trans
            i18nKey='user_roles.bankruptcy_estate_administrator_managed_at'
            components={{ a: administrationLink }}
          />
        </DsParagraph>
      </div>
    </DsDialog>
  );
};
