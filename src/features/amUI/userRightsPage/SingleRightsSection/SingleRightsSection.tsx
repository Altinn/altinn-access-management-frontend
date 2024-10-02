import { Heading, ListItem, Pagination } from '@digdir/designsystemet-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useGetSingleRightsForRightholderQuery } from '@/rtk/features/singleRights/singleRightsApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { List } from '@/features/amUI/common/List/List';
import usePagination from '@/resources/hooks/usePagination';
import { Avatar } from '@/features/amUI/common/Avatar/Avatar';
import { useGetPartyByUUIDQuery } from '@/rtk/features/lookup/lookupApi';

import classes from './SingleRightsSection.module.css';
import { DelegationModal } from '../DelegationModal/DelegationModal';
import { FileIcon, MenuElipsisVerticalIcon } from '@navikt/aksel-icons';
import SingleRightItem from './SingleRightItem';

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

  const { data: party } = useGetPartyByUUIDQuery(id ?? '');
  const { paginatedData, totalPages, currentPage, goToPage } = usePagination(singleRights || [], 5);

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
        {paginatedData?.map((singleRight) => (
          <SingleRightItem
            key={singleRight.identifier}
            {...singleRight}
          />
          // <ListItem
          //   key={singleRight.identifier}
          //   className={classes.singleRightItem}
          // >
          //   <Avatar
          //     size='md'
          //     profile='serviceOwner'
          //     icon={<FileIcon />}
          //     className={classes.icon}
          //   />
          //   <div className={classes.title}>{singleRight.title}</div>
          //   <div className={classes.resourceType}>{t('user_rights_page.resource_type_text')}</div>
          //   <div className={classes.resourceOwnerName}>{singleRight.resourceOwnerName}</div>
          //   <div className={classes.action}>
          //     <MenuElipsisVerticalIcon />
          //   </div>
          // </ListItem>
        ))}
      </List>
      <div className={classes.tools}>
        {party && <DelegationModal toParty={party} />}
        {totalPages > 1 && (
          <Pagination
            className={classes.pagination}
            size='sm'
            compact
            hideLabels={true}
            currentPage={currentPage}
            totalPages={totalPages}
            onChange={(page) => goToPage(page)}
            nextLabel={t('common.next')}
            previousLabel={t('common.previous')}
          />
        )}
      </div>
    </div>
  );
};
