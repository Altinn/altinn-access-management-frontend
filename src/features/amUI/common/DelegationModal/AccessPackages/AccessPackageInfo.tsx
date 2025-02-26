import * as React from 'react';
import { Heading, Paragraph } from '@digdir/designsystemet-react';
import type { ListItemProps } from '@altinn/altinn-components';
import { List, Button, Icon } from '@altinn/altinn-components';
import { Trans, useTranslation } from 'react-i18next';
import {
  InformationSquareFillIcon,
  MenuElipsisHorizontalIcon,
  PackageIcon,
} from '@navikt/aksel-icons';

import { DeletePackageButton } from '../../../userRightsPage/AccessPackageSection/DeletePackageButton';
import { DelegationAction } from '../EditModal';

import classes from './AccessPackageInfo.module.css';

import type { Party } from '@/rtk/features/lookupApi';
import type { IdNamePair } from '@/dataObjects/dtos/IdNamePair';
import { useGetUserDelegationsQuery, type AccessPackage } from '@/rtk/features/accessPackageApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useAccessPackageActions } from '@/features/amUI/common/AccessPackageList/useAccessPackageActions';

export interface PackageInfoProps {
  accessPackage: AccessPackage;
  toParty: Party;
  availableActions?: DelegationAction[];
}

export const AccessPackageInfo = ({
  accessPackage,
  toParty,
  availableActions = [],
}: PackageInfoProps) => {
  const { t } = useTranslation();

  const { onDelegate } = useAccessPackageActions({ toUuid: toParty.partyUuid });

  const { data: activeDelegations, isFetching } = useGetUserDelegationsQuery({
    to: toParty.partyUuid,
    from: getCookie('AltinnPartyUuid'),
  });
  const userHasPackage = React.useMemo(() => {
    if (activeDelegations && !isFetching) {
      return Object.values(activeDelegations)
        .flat()
        .some((delegation) => delegation.accessPackageId === accessPackage.id);
    }
    return false;
  }, [activeDelegations, isFetching, accessPackage.id]);

  const { listItems } = useMinimizableResourceList(accessPackage.resources);
  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <Icon
          size='xl'
          svgElement={PackageIcon}
          className={classes.headerIcon}
        />
        <Heading
          size='md'
          level={1}
        >
          {accessPackage?.name}
        </Heading>
      </div>
      <Paragraph variant='long'>{accessPackage?.description}</Paragraph>
      {accessPackage?.inherited && (
        <div className={classes.inherited}>
          <InformationSquareFillIcon
            fontSize='1.5rem'
            className={classes.inheritedInfoIcon}
          />
          <Paragraph size='xs'>
            <Trans
              i18nKey='delegation_modal.inherited_role_org_message'
              values={{ user_name: toParty.name, org_name: accessPackage.inheritedFrom?.name }}
              components={{ b: <strong /> }}
            />
          </Paragraph>
        </div>
      )}
      <div className={classes.services}>
        <Heading
          size='xs'
          level={2}
        >
          {t('delegation_modal.package_services', {
            count: accessPackage.resources.length,
            name: accessPackage?.name,
          })}
        </Heading>
        <div className={classes.service_list}>
          <List
            items={listItems}
            spacing='xs'
          />
        </div>
      </div>
      <div className={classes.actions}>
        {userHasPackage && availableActions.includes(DelegationAction.REVOKE) && (
          <DeletePackageButton
            accessPackage={accessPackage}
            toParty={toParty}
            fullText
            disabled={isFetching || accessPackage.inherited}
          />
        )}
        {!userHasPackage && availableActions.includes(DelegationAction.DELEGATE) && (
          <Button onClick={() => onDelegate(accessPackage)}>{t('common.give_poa')}</Button>
        )}
        {!userHasPackage && availableActions.includes(DelegationAction.REQUEST) && (
          // Todo: Implement request access package
          <Button disabled>{t('common.request_poa')}</Button>
        )}
      </div>
    </div>
  );
};

const MINIMIZED_LIST_SIZE = 5;

const mapResourceToListItem = (resource: IdNamePair): ListItemProps => ({
  title: resource.name,
  avatar: { type: 'company', name: resource.name },
  as: 'div' as React.ElementType,
  size: 'xs',
});

const useMinimizableResourceList = (list: IdNamePair[]) => {
  const { t } = useTranslation();
  const [showAll, setShowAll] = React.useState(false);
  if (list.length <= MINIMIZED_LIST_SIZE) {
    return { listItems: list.map(mapResourceToListItem) };
  }
  const showMoreListItem: ListItemProps = {
    title: t('common.show_more'),
    description: '',
    onClick: () => setShowAll(!showAll),
    icon: MenuElipsisHorizontalIcon,
    as: 'button' as React.ElementType,
    size: 'xs',
  };
  const minimizedList = list
    .slice(0, showAll ? list.length : MINIMIZED_LIST_SIZE)
    .map(mapResourceToListItem);
  return {
    listItems: showAll ? minimizedList : [...minimizedList, showMoreListItem],
  };
};
