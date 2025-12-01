import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { DsAlert, DsDialog, DsHeading, DsLink, DsParagraph, List } from '@altinn/altinn-components';
import { FolderFileIcon } from '@navikt/aksel-icons';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { useGetActiveConsentsQuery } from '@/rtk/features/consentApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import { PageLayoutWrapper } from '../../common/PageLayoutWrapper';
import type { ActiveConsentListItem } from '../types';
import { ConsentDetails } from '../components/ConsentDetails/ConsentDetails';

import classes from './ActiveConsentsPage.module.css';
import { ConsentPath } from '@/routes/paths';
import { useGetIsAdminQuery, useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { hasConsentPermission } from '@/resources/utils/permissionUtils';
import { ConsentListItem } from './ConsentListItem';
import { OldConsentAlert } from '../components/OldConsentAlert/OldConsentAlert';
import { Breadcrumbs } from '../../common/Breadcrumbs/Breadcrumbs';

export const ActiveConsentsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const modalRef = useRef<HTMLDialogElement>(null);
  const [selectedConsentId, setSelectedConsentId] = useState<string>('');

  useDocumentTitle(t('active_consents.page_title'));
  const partyUuid = getCookie('AltinnPartyUuid');

  const { data: reportee, isLoading: isLoadingReportee } = useGetReporteeQuery();
  const { data: isAdmin, isLoading: isLoadingIsAdmin } = useGetIsAdminQuery();
  const hasPermission = hasConsentPermission(reportee, isAdmin);

  const {
    data: activeConsents,
    isLoading: isLoadingActiveConsents,
    error: loadActiveConsentsError,
  } = useGetActiveConsentsQuery({ partyId: partyUuid }, { skip: !partyUuid || !hasPermission });

  const isLoading = isLoadingReportee || isLoadingIsAdmin || isLoadingActiveConsents;

  const groupedActiveConsents = useMemo(() => {
    const acceptedConsents = activeConsents?.filter((x) => !x.isPendingConsent);
    return groupConsents(acceptedConsents);
  }, [activeConsents]);

  const groupedPendingActiveConsents = useMemo(() => {
    const pendingConsents = activeConsents?.filter((x) => x.isPendingConsent);
    return groupConsents(pendingConsents);
  }, [activeConsents]);

  const showConsentDetails = (consentId: string): void => {
    setSelectedConsentId(consentId);
    modalRef.current?.showModal();
  };

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <Breadcrumbs items={['root', 'consent']} />
        <DsHeading
          level={1}
          data-size='sm'
          className={classes.consentsHeader}
        >
          {t('active_consents.heading')}
        </DsHeading>

        <OldConsentAlert
          heading='active_consents.altinn2_consent_alert_header'
          text='active_consents.altinn2_consent_alert_body'
        />
        {groupedPendingActiveConsents && Object.keys(groupedPendingActiveConsents).length > 0 && (
          <>
            <div className={classes.activeConsentsSubHeading}>
              <DsHeading
                level={2}
                data-size='xs'
              >
                {t('active_consents.pending_agreements')}
              </DsHeading>
            </div>
            <List>
              {Object.keys(groupedPendingActiveConsents).map((partyId) => (
                <ConsentListItem
                  key={partyId}
                  title={groupedPendingActiveConsents[partyId][0].toParty.name}
                  partyType={reportee?.type}
                  subItems={groupedPendingActiveConsents[partyId].map((item) => ({
                    id: item.id,
                    title: item.toParty.name,
                    badgeText: item.isPoa
                      ? t('active_consents.see_pending_poa')
                      : t('active_consents.see_pending_consent'),
                  }))}
                  onClick={(consentId: string) => {
                    navigate(
                      `/${ConsentPath.Consent}/${ConsentPath.Request}?id=${consentId}&skiplogout=true`,
                    );
                  }}
                />
              ))}
            </List>
          </>
        )}
        <div className={classes.activeConsentsSubHeading}>
          <DsHeading
            level={2}
            data-size='xs'
          >
            {t('active_consents.sub_heading')}
          </DsHeading>
          <DsLink
            asChild
            className={classes.consentLogLink}
          >
            <Link to={`/${ConsentPath.Consent}/${ConsentPath.Log}`}>
              <FolderFileIcon
                aria-hidden
                fontSize={24}
              />
              <span>{t('active_consents.consent_log')}</span>
            </Link>
          </DsLink>
        </div>
        <div>
          {!isLoading && !hasPermission && (
            <div>{t('active_consents.no_active_consents_permission')}</div>
          )}
          {isLoading && (
            <List>
              <LoadingListItem />
              <LoadingListItem />
            </List>
          )}
          {loadActiveConsentsError && (
            <DsAlert data-color='danger'>{t('active_consents.load_consents_error')}</DsAlert>
          )}
          {activeConsents && activeConsents.length === 0 && (
            <DsParagraph>{t('active_consents.no_active_consents')}</DsParagraph>
          )}
          {groupedActiveConsents && (
            <List>
              {Object.keys(groupedActiveConsents).map((partyId) => (
                <ConsentListItem
                  key={partyId}
                  title={groupedActiveConsents[partyId][0].toParty.name}
                  partyType={reportee?.type}
                  subItems={groupedActiveConsents[partyId].map((item) => ({
                    id: item.id,
                    title: item.toParty.name,
                    badgeText: item.isPoa
                      ? t('active_consents.see_poa')
                      : t('active_consents.see_consent'),
                  }))}
                  onClick={showConsentDetails}
                />
              ))}
            </List>
          )}
        </div>
        <DsDialog
          ref={modalRef}
          className={classes.consentDialog}
          closedby='any'
          onClose={() => setSelectedConsentId('')}
        >
          {selectedConsentId && <ConsentDetails consentId={selectedConsentId} />}
        </DsDialog>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

const LoadingListItem = () => {
  return (
    <ConsentListItem
      isLoading
      title={'xxxxxxxxxxx'}
      subItems={[
        { id: '1', title: 'xxxxxxxxxxx', badgeText: 'xxxxxxxxxxx' },
        { id: '2', title: 'xxxxxxxxxxx', badgeText: 'xxxxxxxxxxx' },
      ]}
    />
  );
};

const groupConsents = (consents: ActiveConsentListItem[] | undefined) => {
  if (!consents) {
    return undefined;
  }
  const acc: Record<string, ActiveConsentListItem[]> = {};
  for (const consent of consents) {
    const key = consent.toParty.id;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(consent);
  }
  return acc;
};
