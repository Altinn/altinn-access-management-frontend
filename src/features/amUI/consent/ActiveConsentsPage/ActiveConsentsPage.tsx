import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import {
  DsAlert,
  DsDialog,
  DsHeading,
  DsLink,
  DsSpinner,
  ListBase,
  ListItem,
} from '@altinn/altinn-components';
import { FolderFileIcon, HandshakeIcon } from '@navikt/aksel-icons';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { useGetActiveConsentsQuery } from '@/rtk/features/consentApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import { PageLayoutWrapper } from '../../common/PageLayoutWrapper';
import type { ActiveConsentListItem } from '../types';
import { ActiveConsent } from '../components/ActiveConsent/ActiveConsent';

import classes from './ActiveConsentsPage.module.css';

export const ActiveConsentsPage = () => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [selectedConsentId, setSelectedConsentId] = useState<string>('');

  useDocumentTitle(t('systemuser_request.page_title'));
  const partyUuid = getCookie('AltinnPartyUuid');

  const {
    data: activeConsents,
    isLoading: isLoadingActiveConsents,
    error: loadActiveConsentsError,
  } = useGetActiveConsentsQuery({
    partyId: partyUuid,
  });

  const groupedActiveConsents = activeConsents?.reduce(
    (acc: { [key: string]: ActiveConsentListItem[] }, consent) => {
      const key = consent.toPartyName;
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
        <div>
          <DsHeading
            level={1}
            data-size='md'
          >
            {t('active_consents.heading')}
          </DsHeading>
        </div>
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
            <Link to={'/consent/log'}>
              <FolderFileIcon />
              {t('active_consents.consent_log')}
            </Link>
          </DsLink>
        </div>
        <div>
          {isLoadingActiveConsents && (
            <DsSpinner aria-label={t('active_consents.loading_consents')} />
          )}
          {loadActiveConsentsError && (
            <DsAlert data-color='danger'>{t('active_consents.load_consents_error')}</DsAlert>
          )}
          {activeConsents && activeConsents.length === 0 && (
            <DsAlert data-color='info'>{t('active_consents.no_active_consents')}</DsAlert>
          )}
          {groupedActiveConsents && (
            <ListBase>
              {Object.keys(groupedActiveConsents).map((partyId) => (
                <ActiveConsentListItem
                  key={partyId}
                  title={groupedActiveConsents[partyId][0].toPartyName}
                  subItems={groupedActiveConsents[partyId].map((item) => ({
                    id: item.id,
                    title: item.toPartyName,
                  }))}
                  onClick={showConsentDetails}
                />
              ))}
            </ListBase>
          )}
        </div>
        <DsDialog
          ref={modalRef}
          className={classes.consentDialog}
          closedby='any'
          onClose={() => setSelectedConsentId('')}
        >
          {selectedConsentId && <ActiveConsent consentId={selectedConsentId} />}
        </DsDialog>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

interface ActiveConsentListItemProps {
  title: string;
  subItems: { id: string; title: string }[];
  onClick: (consentId: string) => void;
}
const ActiveConsentListItem = ({
  title,
  subItems,
  onClick,
}: ActiveConsentListItemProps): React.ReactNode => {
  const { t } = useTranslation();

  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  return (
    <ListItem
      title={title}
      icon={{
        svgElement: HandshakeIcon,
        theme: 'surface',
      }}
      size='lg'
      collapsible
      expanded={isExpanded}
      badge={{
        label: subItems.length,
      }}
      onClick={() => setIsExpanded((old) => !old)}
    >
      {isExpanded && (
        <div className={classes.expandedListItem}>
          <ListBase>
            {subItems.map((item, index) => (
              <ListItem
                key={index}
                icon={HandshakeIcon}
                title={item.title}
                onClick={() => onClick(item.id)}
                badge={{
                  label: t('active_consents.see_consent'),
                  theme: 'transparent',
                  //@ts-expect-error size 'md' is not in type, but can be used
                  size: 'md',
                }}
                linkIcon
              />
            ))}
          </ListBase>
        </div>
      )}
    </ListItem>
  );
};
