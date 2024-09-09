import { Heading } from '@digdir/designsystemet-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { FileIcon, MenuElipsisVerticalIcon } from '@navikt/aksel-icons';

import { useGetSingleRightsForRightholderQuery } from '@/rtk/features/singleRights/singleRightsApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { List } from '@/components/List/List';
import { ListItem } from '@/components/List/ListItem';

import classes from './SingleRightsSection.module.css';

export const SingleRightsSection = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  const {
    data: singleRights,
    isError,
    isLoading,
  } = useGetSingleRightsForRightholderQuery({
    party: getCookie('AltinnPartyId'),
    userId: id || '',
  });

  return (
    <div className={classes.singleRightsSectionContainer}>
      <Heading
        level={2}
        size='md'
        spacing={false}
        id='single_rights_title'
      >
        {t('user_rights_page.single_rights_title')}
      </Heading>

      {isError && <div>{t('user_rights_page.error')}</div>}
      {isLoading && <div>{t('user_rights_page.loading')}</div>}

      <List
        className={classes.singleRightsList}
        aria-labelledby='single_rights_title'
      >
        {singleRights?.map((singleRight) => (
          <ListItem
            key={singleRight.identifier}
            className={classes.singleRightItem}
          >
            <div className={classes.icon}>
              <FileIcon />
            </div>
            <div className={classes.title}>{singleRight.title}</div>
            <div className={classes.resourceType}>{t('user_rights_page.resource_type_text')}</div>
            <div className={classes.resourceOwnerName}>{singleRight.resourceOwnerName}</div>
            <div className={classes.action}>
              <MenuElipsisVerticalIcon />
            </div>
          </ListItem>
        ))}
      </List>
    </div>
  );
};
