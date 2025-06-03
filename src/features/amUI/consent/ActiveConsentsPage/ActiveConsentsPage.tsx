import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { DsHeading, DsLink, ListBase, ListItem } from '@altinn/altinn-components';
import { FolderFileIcon, HandshakeIcon } from '@navikt/aksel-icons';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';

import { PageLayoutWrapper } from '../../common/PageLayoutWrapper';

import classes from './ActiveConsentsPage.module.css';

export const ActiveConsentsPage = () => {
  const { t } = useTranslation();

  useDocumentTitle(t('systemuser_request.page_title'));

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
          <ListBase>
            <ActiveConsentListItem title='Sparebanken Norge' />
            <ActiveConsentListItem title='sBanken fra DNB' />
          </ListBase>
        </div>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

interface ActiveConsentListItemProps {
  title: string;
}
const ActiveConsentListItem = ({ title }: ActiveConsentListItemProps): React.ReactNode => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  return (
    <ListItem
      title={title}
      icon={HandshakeIcon}
      collapsible
      expanded={isExpanded}
      badge={{
        label: '1',
      }}
      onClick={() => setIsExpanded((old) => !old)}
    >
      {isExpanded && (
        <div className={classes.expandedListItem}>
          <ListBase>
            <ListItem
              title='Lånekassen'
              linkIcon
            />
          </ListBase>
        </div>
      )}
    </ListItem>
  );
};
