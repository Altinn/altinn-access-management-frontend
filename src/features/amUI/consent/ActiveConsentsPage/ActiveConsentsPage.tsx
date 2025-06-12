import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import {
  DsAlert,
  DsDialog,
  DsHeading,
  DsLink,
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

import classes from './ActiveConsentsPage.module.css';
import { ActiveConsent } from './ActiveConsent';

export const ActiveConsentsPage = () => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDialogElement>(null);

  useDocumentTitle(t('systemuser_request.page_title'));
  const partyUuid = getCookie('AltinnPartyUuid');

  const { data: activeConsents } = useGetActiveConsentsQuery({
    partyId: partyUuid, // Replace with actual party ID or fetch dynamically
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

  const showConsentDetails = (): void => {
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
            Samtykker og fullmakter
          </DsHeading>
        </div>
        <div className={classes.activeConsentsHeading}>
          <DsHeading
            level={2}
            data-size='sm'
          >
            Aktive avtaler
          </DsHeading>
          <DsLink
            asChild
            data-size='lg'
          >
            <Link to={'/consent/log'}>
              <FolderFileIcon />
              Se avtalelogg
            </Link>
          </DsLink>
        </div>
        <div>
          {activeConsents && activeConsents.length === 0 && (
            <DsAlert data-color='info'>Ingen aktive avtaler</DsAlert>
          )}
          {groupedActiveConsents && (
            <ListBase>
              {Object.keys(groupedActiveConsents).map((partyId) => (
                <ActiveConsentListItem
                  key={partyId}
                  title={groupedActiveConsents[partyId][0].toPartyName}
                  subItems={groupedActiveConsents[partyId].map((item) => ({
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
        >
          <div className={classes.consentContainer}>
            <ActiveConsent
              consent={{
                id: '7e540335-d82f-41e9-8b8f-619336d792b4',
                isPoa: true,
                serviceIntroAccepted: {
                  nb: 'Fullmakten gir DISKRET NÆR TIGER AS tilgang til følgende tjenester på dine vegne',
                  nn: 'Fullmakta gjer DISKRET NÆR TIGER AS tilgang til følgjande tenester på dine vegne',
                  en: 'The power of attorney gives DISKRET NÆR TIGER AS access to the following services on your behalf',
                },
                consentMessage: {
                  nb: 'Dette er en melding fra banken',
                  nn: 'Dette er ei melding fra banken',
                  en: 'This is a message from the bank',
                },
                expiration: {
                  nb: 'Fullmakten gjelder én gangs bruk av tjenestene',
                  nn: 'Fullmakta gjeld bruk av tenestene éin gong',
                  en: 'The power of attorney applies for one-time access to the service.',
                },
                handledBy: undefined,
                toPartyName: 'LEPSØY OG TONSTAD',
                rights: [
                  {
                    identifier: 'consent-test-resource-poa',
                    title: {
                      en: 'Power of attorney to perform a service',
                      nb: 'Fullmakt til å utføre en tjeneste',
                      nn: 'Fullmakt til å utføre ei teneste',
                    },
                    consentTextHtml: {
                      en: '<p>Power of attorney to perform a great service.</p>\n',
                      nb: '<p>Fullmakt til å utføre en bra tjeneste</p>\n',
                      nn: '<p>Fullmakt til å utføre ei bra teneste</p>\n',
                    },
                  },
                ],
              }}
            />
          </div>
        </DsDialog>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

interface ActiveConsentListItemProps {
  title: string;
  subItems: { title: string }[];
  onClick: () => void;
}
const ActiveConsentListItem = ({
  title,
  subItems,
  onClick,
}: ActiveConsentListItemProps): React.ReactNode => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  return (
    <ListItem
      title={title}
      icon={HandshakeIcon}
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
                onClick={onClick}
                linkIcon
              />
            ))}
          </ListBase>
        </div>
      )}
    </ListItem>
  );
};
