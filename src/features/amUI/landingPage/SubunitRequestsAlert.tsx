import React, { useState } from 'react';
import {
  Badge,
  DsDialog,
  DsHeading,
  DsLink,
  DsParagraph,
  ListItem,
  UserListItem,
} from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ArrowRightIcon, BellFillIcon } from '@navikt/aksel-icons';

import type { AuthorizedPartyEntity } from '@/dataObjects/dtos/Party';
import { useGetReceivedRequestsCountForSubunitsQuery } from '@/rtk/features/requestApi';
import { getChangeReporteeAndRedirectUrl } from '@/resources/utils/changeReporteeUtils';
import { formatEntityDisplayName, formatOrgNr } from '@/resources/utils/reporteeUtils';
import { useIsTabletOrSmaller } from '@/resources/utils/screensizeUtils';
import { amUIPath, GeneralPath } from '@/routes/paths';

import classes from './SubunitRequestsAlert.module.css';

interface SubunitRequestsAlertProps {
  reportee?: AuthorizedPartyEntity;
  requestCount: number;
  isCurrentUserReportee?: boolean;
  includeSubunits?: boolean;
}

export const SubunitRequestsAlert = ({
  reportee,
  requestCount,
  isCurrentUserReportee = false,
  includeSubunits = false,
}: SubunitRequestsAlertProps) => {
  const { t } = useTranslation();
  const isSmallScreen = useIsTabletOrSmaller();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: subunitCounts = [], isLoading } = useGetReceivedRequestsCountForSubunitsQuery(
    { party: reportee?.id ?? '', status: ['Pending'] },
    { skip: !reportee?.id || !includeSubunits },
  );
  const subunitsWithRequests = subunitCounts.filter((subunit) => subunit.count > 0);
  const hasSubunitRequests = subunitsWithRequests.length > 0;
  const reporteeName = formatEntityDisplayName(reportee);
  const requestsPath = `/${amUIPath.Requests}`;

  if (isLoading || (requestCount === 0 && !hasSubunitRequests)) {
    return null;
  }

  return (
    <>
      <ListItem
        title={{
          size: 'md',
          children: isCurrentUserReportee
            ? t('landing_page.subunit_requests_title_self')
            : t('landing_page.subunit_requests_title', { reportee: reporteeName }),
        }}
        icon={BellFillIcon}
        linkIcon
        color='info'
        variant='tinted'
        border='solid'
        interactive
        as={
          hasSubunitRequests
            ? 'button'
            : (props) => (
                <Link
                  {...props}
                  to={requestsPath}
                />
              )
        }
        containerAs='div'
        description={
          isSmallScreen && hasSubunitRequests
            ? t('landing_page.subunit_requests_action')
            : undefined
        }
        badge={
          isSmallScreen ? undefined : (
            <div data-size='sm'>{t('landing_page.subunit_requests_action')}</div>
          )
        }
        onClick={hasSubunitRequests ? () => setIsModalOpen(true) : undefined}
      />
      <DsDialog
        aria-label={t('landing_page.subunit_requests_modal_heading', { reportee: reporteeName })}
        className={classes.subunitRequestsDialog}
        open={isModalOpen}
        closedby='any'
        closeButton={t('common.close')}
        onClose={() => setIsModalOpen(false)}
      >
        <DsDialog.Block>
          <DsHeading
            level={2}
            data-size='xs'
          >
            {t('landing_page.subunit_requests_modal_heading', { reportee: reporteeName })}
          </DsHeading>
        </DsDialog.Block>
        <DsDialog.Block className={classes.subunitRequestsModal}>
          <DsParagraph data-size='sm'>{t('landing_page.subunit_requests_modal_intro')}</DsParagraph>
          <ul className={classes.subunitRequestsList}>
            <li className={classes.mainunitRequestsRow}>
              <UserListItem
                id={reportee?.id ?? ''}
                name={reporteeName}
                description={`${t('common.org_nr')} ${formatOrgNr(reportee?.organizationIdentifier)}`}
                type='company'
                titleAs='h3'
                size='sm'
                interactive={false}
                shadow='none'
                containerAs='div'
                className={classes.subunitRequestsParty}
              />
              <div className={classes.subunitRequestsControls}>
                <Badge
                  label={t('landing_page.subunit_requests_count', { count: requestCount })}
                  color={requestCount > 0 ? 'info' : 'neutral'}
                />
                <DsLink
                  asChild
                  data-size='sm'
                >
                  <Link
                    to={requestsPath}
                    className={classes.subunitRequestsLink}
                  >
                    {t('landing_page.subunit_requests_handle')}
                    <ArrowRightIcon
                      aria-hidden='true'
                      fontSize='1.3rem'
                    />
                  </Link>
                </DsLink>
              </div>
            </li>
            {subunitsWithRequests.map(({ party, count }) => (
              <li
                key={party.id}
                className={classes.subunitRequestsRow}
              >
                <UserListItem
                  id={party.id}
                  name={formatEntityDisplayName(party)}
                  description={t('landing_page.subunit_requests_subunit_description', {
                    orgNumber: formatOrgNr(party.organizationIdentifier),
                  })}
                  type='company'
                  subUnit
                  titleAs='h3'
                  size='sm'
                  interactive={false}
                  shadow='none'
                  containerAs='div'
                  className={classes.subunitRequestsParty}
                />
                <div className={classes.subunitRequestsControls}>
                  <Badge
                    label={t('landing_page.subunit_requests_count', { count })}
                    color='info'
                  />
                  <DsLink
                    data-size='sm'
                    className={classes.subunitRequestsLink}
                    href={getChangeReporteeAndRedirectUrl(
                      party.id,
                      `${window.location.origin}${GeneralPath.BasePath}/${amUIPath.Requests}`,
                    )}
                  >
                    {t('landing_page.subunit_requests_switch')}
                    <ArrowRightIcon
                      aria-hidden='true'
                      fontSize='1.3rem'
                    />
                  </DsLink>
                </div>
              </li>
            ))}
          </ul>
        </DsDialog.Block>
      </DsDialog>
    </>
  );
};
