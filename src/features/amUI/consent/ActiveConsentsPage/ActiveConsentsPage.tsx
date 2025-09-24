import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import {
  DsAlert,
  DsDialog,
  DsHeading,
  DsLink,
  DsParagraph,
  List,
  ListItem,
} from '@altinn/altinn-components';
import { FolderFileIcon, HandshakeIcon } from '@navikt/aksel-icons';

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
import { hasConsentPermission } from '../utils';

export const ActiveConsentsPage = () => {
  const { t } = useTranslation();
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

  const groupedActiveConsents = activeConsents?.reduce(
    (acc: { [key: string]: ActiveConsentListItem[] }, consent) => {
      const key = consent.toPartyId;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key] = [...acc[key], consent];
      return acc;
    },
    {},
  );

  const showConsentDetails = (consentId: string): void => {
    setSelectedConsentId(consentId);
    modalRef.current?.showModal();
  };

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <DsHeading
          level={1}
          data-size='md'
        >
          {t('active_consents.heading')}
        </DsHeading>
        <div className={classes.activeConsentsHeading}>
          <DsHeading
            level={2}
            data-size='sm'
          >
            {t('active_consents.sub_heading')}
          </DsHeading>
          <DsLink
            asChild
            data-size='lg'
          >
            <Link to={`/${ConsentPath.Consent}/${ConsentPath.Log}`}>
              <FolderFileIcon
                fontSize={28}
                aria-hidden
              />
              {t('active_consents.consent_log')}
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
                  title={groupedActiveConsents[partyId][0].toPartyName}
                  subItems={groupedActiveConsents[partyId].map((item) => ({
                    id: item.id,
                    title: item.toPartyName,
                    isPoa: item.isPoa,
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

interface ConsentListItemProps {
  title: string;
  subItems: { id: string; title: string; isPoa: boolean }[];
  isLoading?: boolean;
  onClick: (consentId: string) => void;
}
const ConsentListItem = ({
  title,
  subItems,
  isLoading,
  onClick,
}: ConsentListItemProps): React.ReactNode => {
  const { t } = useTranslation();

  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  return (
    <ListItem
      title={{ as: 'h3', children: title }}
      icon={{ svgElement: HandshakeIcon, theme: 'surface' }}
      as='button'
      size='md'
      loading={isLoading}
      collapsible
      expanded={isExpanded}
      badge={{ label: subItems.length }}
      onClick={() => setIsExpanded((old) => !old)}
    >
      <List className={classes.expandedListItem}>
        {subItems.map((item) => (
          <ListItem
            key={item.id}
            icon={HandshakeIcon}
            title={{ as: 'h4', children: item.title }}
            as='button'
            loading={isLoading}
            onClick={() => onClick(item.id)}
            badge={
              <div className={classes.consentBadge}>
                {item.isPoa ? t('active_consents.see_poa') : t('active_consents.see_consent')}
              </div>
            }
            linkIcon
          />
        ))}
      </List>
    </ListItem>
  );
};

const LoadingListItem = () => {
  return (
    <ConsentListItem
      isLoading
      title={'xxxxxxxxxxx'}
      subItems={[
        { id: '1', title: 'xxxxxxxxxxx', isPoa: false },
        { id: '2', title: 'xxxxxxxxxxx', isPoa: false },
      ]}
      onClick={() => {}}
    />
  );
};
