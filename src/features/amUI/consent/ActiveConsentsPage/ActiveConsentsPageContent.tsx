import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import {
  DsAlert,
  DsDialog,
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
import { toDateSortKey, toDateTimeString } from '../utils';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import { ActiveConsentListItem } from '../types';
import { IdPortenAuthorization } from '@/rtk/features/idPortenAuthorizationApi';
import { IdPortenAuthorizationDetails } from '../components/IdPortenAuthorizationDetails/IdPortenAuthorizationDetails';
import { ConsentDetails } from '../components/ConsentDetails/ConsentDetails';

interface ActiveConsentsPageContentProps {
  activeConsents: ActiveConsentListItem[] | undefined;
  idPortenAuthorizations: IdPortenAuthorization[] | undefined;
  reportee: ReporteeInfo | undefined;
  isLoading: boolean;
  hasPermission: boolean;
  loadActiveConsentsError: FetchBaseQueryError | SerializedError | undefined;
  loadIdPortenAuthorizationsError: FetchBaseQueryError | SerializedError | undefined;
  newlyCreatedId: string | undefined;
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
}: ActiveConsentsPageContentProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const consentModalRef = useRef<HTMLDialogElement>(null);
  const activeConsentsHeaderRef = useRef<HTMLHeadingElement>(null);

  const [selectedConsentId, setSelectedConsentId] = useState<string>('');
  const [selectedIdPortenAuthorization, setSelectedIdPortenAuthorization] =
    useState<IdPortenAuthorization | null>(null);

  const groupedActiveConsents = useMemo(() => {
    const acceptedConsents = activeConsents?.filter((x) => !x.isPendingConsent);
    const groups = groupConsents(acceptedConsents, idPortenAuthorizations);

    groups.forEach((group) => {
      group.items.sort((a, b) => toDateSortKey(b.consentedDate) - toDateSortKey(a.consentedDate));
    });

    return groups;
  }, [activeConsents, idPortenAuthorizations]);

  const groupedPendingActiveConsents = useMemo(() => {
    const pendingConsents = activeConsents?.filter((x) => x.isPendingConsent);
    const groups = groupConsents(pendingConsents, []);

    groups.forEach((group) => {
      group.items.sort((a, b) => toDateSortKey(b.createdDate) - toDateSortKey(a.createdDate));
    });

    return groups;
  }, [activeConsents]);

  const showConsentDetails = (consentId: string, consentType: 'altinn' | 'idporten'): void => {
    consentModalRef.current?.showModal();
    if (consentType === 'altinn') {
      setSelectedConsentId(consentId);
    } else {
      const idPortenAuthorization = idPortenAuthorizations?.find(
        (x) => x.authorizationId === consentId,
      );
      setSelectedIdPortenAuthorization(idPortenAuthorization || null);
    }
  };

  return (
    <>
      {groupedPendingActiveConsents.length > 0 && (
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
            {groupedPendingActiveConsents.map((group) => (
              <ConsentListItem
                key={group.partyId}
                title={group.ownerName}
                partyType={reportee?.type}
                subItems={group.items.map((item) => ({
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
      <div
        className={classes.activeConsentsSubHeading}
        tabIndex={-1}
        ref={activeConsentsHeaderRef}
      >
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
            {!hasPermission && (
              <div>
                {t('active_consents.no_active_consents_permission', {
                  name: formatDisplayName({
                    fullName: reportee?.name || '',
                    type: reportee?.type === 'Person' ? 'person' : 'company',
                  }),
                })}
              </div>
            )}
            {loadActiveConsentsError && (
              <DsAlert data-color='danger'>{t('active_consents.load_consents_error')}</DsAlert>
            )}
            {loadIdPortenAuthorizationsError && (
              <DsAlert data-color='danger'>
                {t('active_consents.load_idporten_authorizations_error')}
              </DsAlert>
            )}
            {!loadActiveConsentsError &&
              !loadIdPortenAuthorizationsError &&
              hasPermission &&
              groupedActiveConsents.length === 0 && (
                <DsParagraph>{t('active_consents.no_active_consents')}</DsParagraph>
              )}
            {groupedActiveConsents.length > 0 && (
              <List>
                {groupedActiveConsents.map((group) => (
                  <ConsentListItem
                    key={group.partyId}
                    title={group.ownerName}
                    partyType={reportee?.type}
                    subItems={group.items.map((item) => ({
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
      <DsDialog
        ref={consentModalRef}
        className={classes.consentDialog}
        closedby='any'
        onClose={() => {
          setSelectedConsentId('');
          setSelectedIdPortenAuthorization(null);
        }}
      >
        {selectedConsentId && <ConsentDetails consentId={selectedConsentId} />}
        {selectedIdPortenAuthorization && (
          <IdPortenAuthorizationDetails
            idPortenAuthorization={selectedIdPortenAuthorization}
            onRevoked={() => {
              consentModalRef.current?.close();
              activeConsentsHeaderRef.current?.focus();
            }}
          />
        )}
      </DsDialog>
    </>
  );
};

interface ConsentListItemGroupModel {
  partyId: string;
  ownerName: string;
  items: ConsentListItemModel[];
}

interface ConsentListItemModel {
  id: string;
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
): ConsentListItemGroupModel[] => {
  const acc: Record<string, ConsentListItemGroupModel> = {};
  for (const consent of consents || []) {
    const key = consent.toParty.id;
    if (!acc[key]) {
      acc[key] = {
        partyId: key,
        ownerName: consent.toParty.name,
        items: [],
      };
    }
    acc[key].items.push({
      id: consent.id,
      title: consent.toParty.name,
      createdDate: consent.createdDate,
      consentedDate: consent.consentedDate,
      isPoa: consent.isPoa,
      consentType: 'altinn',
    });
  }

  for (const idPortenAuthorization of idPortenAuthorizations || []) {
    const key = idPortenAuthorization.consumerPartyUuid;
    if (!acc[key]) {
      acc[key] = {
        partyId: key,
        ownerName: idPortenAuthorization.consumerName,
        items: [],
      };
    }
    acc[key].items.push({
      id: idPortenAuthorization.authorizationId,
      title: idPortenAuthorization.clientName,
      createdDate: '',
      consentedDate: idPortenAuthorization.authorizedAt
        ? new Date(idPortenAuthorization.authorizedAt * 1000).toISOString()
        : '',
      consentType: 'idporten',
    });
  }

  return orderGroupsAlphabetically(Object.values(acc));
};

const orderGroupsAlphabetically = (groups: ConsentListItemGroupModel[]) => {
  const ownerNameCollator = new Intl.Collator('no-NO', { sensitivity: 'base' });

  return groups.sort((a, b) => ownerNameCollator.compare(a.ownerName, b.ownerName));
};
