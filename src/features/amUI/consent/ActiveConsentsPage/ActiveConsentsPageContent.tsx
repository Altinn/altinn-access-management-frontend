import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import {
  DsAlert,
  DsHeading,
  DsLink,
  DsParagraph,
  formatDisplayName,
  List,
} from '@altinn/altinn-components';
import { FolderFileIcon } from '@navikt/aksel-icons';
import classes from './ActiveConsentsPage.module.css';
import { ConsentPath } from '@/routes/paths';
import { ReporteeInfo } from '@/rtk/features/userInfoApi';
import { ConsentListItem, LoadingListItem } from './ConsentListItem';
import { getConsentRequestUrl } from '@/routes/paths/consentPath';
import { toDateTimeString } from '../utils';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import { ActiveConsentListItem } from '../types';
import { IdPortenAuthorization } from '@/rtk/features/idPortenAuthorizationApi';

interface ActiveConsentsPageContentProps {
  activeConsents: ActiveConsentListItem[] | undefined;
  idPortenAuthorizations: IdPortenAuthorization[] | undefined;
  reportee: ReporteeInfo | undefined;
  isLoading: boolean;
  hasPermission: boolean;
  loadActiveConsentsError: FetchBaseQueryError | SerializedError | undefined;
  loadIdPortenAuthorizationsError: FetchBaseQueryError | SerializedError | undefined;
  newlyCreatedId: string | undefined;
  showConsentDetails: (consentId: string, consentType: 'altinn' | 'idporten') => void;
}

export const ActiveConsentsPageContent = ({
  activeConsents,
  idPortenAuthorizations,
  reportee,
  isLoading,
  hasPermission,
  loadActiveConsentsError,
  loadIdPortenAuthorizationsError,
  newlyCreatedId,
  showConsentDetails,
}: ActiveConsentsPageContentProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const groupedActiveConsents = useMemo(() => {
    const acceptedConsents = activeConsents?.filter((x) => !x.isPendingConsent);
    return groupConsents(acceptedConsents, idPortenAuthorizations);
  }, [activeConsents, idPortenAuthorizations]);

  const groupedPendingActiveConsents = useMemo(() => {
    const pendingConsents = activeConsents?.filter((x) => x.isPendingConsent);
    return groupConsents(pendingConsents, []);
  }, [activeConsents]);

  return (
    <>
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
                title={groupedPendingActiveConsents[partyId][0].ownerName}
                partyType={reportee?.type}
                subItems={groupedPendingActiveConsents[partyId].map((item) => ({
                  id: item.id,
                  title: item.title,
                  description: toDateTimeString(item.createdDate),
                  consentType: 'altinn',
                  badgeText: item.isPoa
                    ? t('active_consents.see_pending_poa')
                    : t('active_consents.see_pending_consent'),
                }))}
                onClick={(consentId: string) => {
                  const consentRequestUrl = getConsentRequestUrl(
                    consentId,
                    encodeURIComponent(`/${ConsentPath.Consent}/${ConsentPath.Active}`),
                  );
                  navigate(consentRequestUrl);
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
              aria-hidden='true'
              fontSize={24}
            />
            <span>{t('active_consents.consent_log')}</span>
          </Link>
        </DsLink>
      </div>
      <div>
        {isLoading ? (
          <List>
            <LoadingListItem />
            <LoadingListItem />
          </List>
        ) : (
          <>
            {!hasPermission && <div>{t('active_consents.no_active_consents_permission')}</div>}
            {loadActiveConsentsError && (
              <DsAlert data-color='danger'>{t('active_consents.load_consents_error')}</DsAlert>
            )}
            {loadIdPortenAuthorizationsError && (
              <DsAlert data-color='danger'>
                {t('active_consents.load_idporten_authorizations_error')}
              </DsAlert>
            )}
            {groupedActiveConsents && Object.keys(groupedActiveConsents).length === 0 && (
              <DsParagraph>{t('active_consents.no_active_consents')}</DsParagraph>
            )}
            {groupedActiveConsents && (
              <List>
                {Object.keys(groupedActiveConsents).map((partyId) => (
                  <ConsentListItem
                    key={partyId}
                    title={groupedActiveConsents[partyId][0].ownerName}
                    partyType={reportee?.type}
                    subItems={groupedActiveConsents[partyId].map((item) => ({
                      id: item.id,
                      title: item.title,
                      description: item.consentedDate ? toDateTimeString(item.consentedDate) : '',
                      isNew: newlyCreatedId === item.id,
                      consentType: item.consentType,
                      badgeText: item.isPoa
                        ? t('active_consents.see_poa')
                        : t('active_consents.see_consent'),
                    }))}
                    onClick={showConsentDetails}
                  />
                ))}
              </List>
            )}
          </>
        )}
      </div>
    </>
  );
};

interface ConsentListItemModel {
  id: string;
  ownerName: string;
  title: string;
  createdDate: string;
  consentedDate?: string;
  isNew?: boolean;
  isPoa?: boolean;
  consentType: 'altinn' | 'idporten';
}

const groupConsents = (
  consents: ActiveConsentListItem[] | undefined,
  idPortenAuthorizations: IdPortenAuthorization[] | undefined,
) => {
  const acc: Record<string, ConsentListItemModel[]> = {};
  for (const consent of consents || []) {
    const key = consent.toParty.id;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push({
      id: consent.id,
      title: consent.toParty.name,
      ownerName: consent.toParty.name,
      createdDate: consent.createdDate,
      consentedDate: consent.consentedDate,
      isPoa: consent.isPoa,
      consentType: 'altinn',
    });
  }

  for (const idPortenAuthorization of idPortenAuthorizations || []) {
    const key = idPortenAuthorization.consumerPartyUuid;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push({
      id: idPortenAuthorization.authorizationId,
      title: idPortenAuthorization.clientName,
      ownerName: formatDisplayName({
        fullName: idPortenAuthorization.consumerName,
        type: 'company',
      }),
      createdDate: '',
      consentedDate: idPortenAuthorization.authorizedAt
        ? new Date(idPortenAuthorization.authorizedAt * 1000).toISOString()
        : '',
      consentType: 'idporten',
    });
  }

  return acc;
};
