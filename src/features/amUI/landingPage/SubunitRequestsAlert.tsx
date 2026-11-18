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
import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons';

import type { AuthorizedPartyEntity } from '@/dataObjects/dtos/Party';
import { useGetReceivedRequestsCountForSubunitsQuery } from '@/rtk/features/requestApi';
import { getChangeReporteeAndRedirectUrl } from '@/resources/utils/changeReporteeUtils';
import { formatEntityDisplayName, formatOrgNr } from '@/resources/utils/reporteeUtils';
import { useIsTabletOrSmaller } from '@/resources/utils/screensizeUtils';
import { amUIPath, GeneralPath } from '@/routes/paths';

import classes from './LandingPage.module.css';

interface SubunitRequestsAlertProps {
  reportee?: AuthorizedPartyEntity;
}

export const SubunitRequestsAlert = ({ reportee }: SubunitRequestsAlertProps) => {
  const { t } = useTranslation();
  const isSmallScreen = useIsTabletOrSmaller();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: subunitCounts = [] } = useGetReceivedRequestsCountForSubunitsQuery(
    { party: reportee?.id ?? '', status: ['Pending'] },
    { skip: !reportee?.id },
  );
  const subunitsWithRequests = subunitCounts.filter((subunit) => subunit.count > 0);
  const reporteeName = formatEntityDisplayName(reportee);

  if (subunitsWithRequests.length === 0) {
    return null;
  }

  return (
    <>
      <ListItem
        title={t('landing_page.subunit_requests_title', { reportee: reporteeName })}
        icon={ExclamationmarkTriangleIcon}
        linkIcon
        color='warning'
        variant='tinted'
        border='solid'
        interactive
        as='button'
        containerAs='div'
        badge={isSmallScreen ? undefined : <div>{t('landing_page.subunit_requests_action')}</div>}
        onClick={() => setIsModalOpen(true)}
      />
      <DsDialog
        open={isModalOpen}
        closedby='any'
        closeButton={t('common.close')}
        onClose={() => setIsModalOpen(false)}
      >
        <div className={classes.subunitRequestsModal}>
          <DsHeading
            level={2}
            data-size='xs'
          >
            {t('landing_page.subunit_requests_modal_heading', { reportee: reporteeName })}
          </DsHeading>
          <DsParagraph data-size='sm'>{t('landing_page.subunit_requests_modal_intro')}</DsParagraph>
          <ul className={classes.subunitRequestsList}>
            {subunitsWithRequests.map(({ party, count }) => (
              <li
                key={party.id}
                className={classes.subunitRequestsRow}
              >
                <UserListItem
                  id={party.id}
                  name={party.name}
                  description={`${t('common.org_nr')} ${formatOrgNr(party.organizationIdentifier)}`}
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
                    href={getChangeReporteeAndRedirectUrl(
                      party.id,
                      `${window.location.origin}${GeneralPath.BasePath}/${amUIPath.Requests}`,
                    )}
                  >
                    {t('landing_page.subunit_requests_switch')}
                  </DsLink>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </DsDialog>
    </>
  );
};
