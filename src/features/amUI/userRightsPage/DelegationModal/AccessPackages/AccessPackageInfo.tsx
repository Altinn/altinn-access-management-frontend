import * as React from 'react';
import { Button, Heading, Paragraph } from '@digdir/designsystemet-react';
import type { ListItemProps } from '@altinn/altinn-components';
import { Avatar, List } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { Party } from '@/rtk/features/lookupApi';
import type { IdNamePair } from '@/dataObjects/dtos/IdNamePair';
import {
  useGetRightHolderDelegationsQuery,
  type AccessPackage,
} from '@/rtk/features/accessPackageApi';
import { useDelegateAccessPackage } from '@/resources/hooks/useDelegateAccessPackage';
import { useSnackbar } from '@/features/amUI/common/Snackbar';
import { SnackbarDuration } from '@/features/amUI/common/Snackbar/SnackbarProvider';

import { DeletePackageButton } from '../../AccessPackageSection/DeletePackageButton';

import classes from './AccessPackageInfo.module.css';

export interface PackageInfoProps {
  accessPackage: AccessPackage;
  toParty: Party;
  onDelegate?: () => void;
}

export const AccessPackageInfo = ({ accessPackage, toParty, onDelegate }: PackageInfoProps) => {
  const { t } = useTranslation();

  const delegatePackage = useDelegateAccessPackage();
  const { openSnackbar } = useSnackbar();

  const { data: activeDelegations, isFetching } = useGetRightHolderDelegationsQuery(
    toParty.partyUuid,
  );
  const userHasPackage = React.useMemo(() => {
    if (activeDelegations && !isFetching) {
      return Object.values(activeDelegations)
        .flat()
        .some((delegation) => delegation.accessPackageId === accessPackage.id);
    }
    return false;
  }, [activeDelegations, isFetching, accessPackage.id]);

  const handleDelegate = async () => {
    delegatePackage(
      toParty,
      accessPackage,
      () => {
        openSnackbar({
          message: t('access_packages.package_delegation_success', {
            name: toParty.name,
            accessPackage: accessPackage.name,
          }),
        });
        if (onDelegate) {
          onDelegate();
        }
      },
      () => {
        openSnackbar({
          message: t('access_packages.package_delegation_error', {
            name: toParty.name,
            accessPackage: accessPackage.name,
          }),
          duration: SnackbarDuration.infinite,
        });
      },
    );
  };

  const { listItems } = useMinimizableResourceList(accessPackage.resources);
  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <Avatar
          imageUrl={accessPackage?.area?.iconUrl ?? undefined}
          name={accessPackage?.name}
          type='company'
          size='lg'
        />
        <Heading
          size='md'
          level={1}
        >
          {accessPackage?.name}
        </Heading>
      </div>
      <Paragraph variant='long'>{accessPackage?.description}</Paragraph>

      <Heading
        size='sm'
        level={2}
      >
        {t('delegation_modal.package_services', {
          count: accessPackage.resources.length,
          name: accessPackage?.name,
        })}
      </Heading>
      <div className={classes.service_list}>
        <List
          size='xs'
          items={listItems}
          spacing='none'
        />
      </div>
      <div className={classes.actions}>
        {userHasPackage ? (
          <DeletePackageButton
            accessPackage={accessPackage}
            toParty={toParty}
            fullText
          />
        ) : (
          <Button onClick={handleDelegate}>{t('common.give_poa')}</Button>
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
});

const useMinimizableResourceList = (list: IdNamePair[]) => {
  const { t } = useTranslation();
  const [showAll, setShowAll] = React.useState(false);
  if (list.length <= MINIMIZED_LIST_SIZE) {
    return { listItems: list.map(mapResourceToListItem) };
  }
  const toggleListItem: ListItemProps = {
    title: t(showAll ? 'common.show_less' : 'common.show_more'),
    description: '',
    onClick: () => setShowAll(!showAll),
    icon: 'menu-elipsis-horizontal',
    as: 'button' as React.ElementType,
  };
  const minimizedList = list.slice(0, showAll ? list.length : MINIMIZED_LIST_SIZE);
  return {
    listItems: [...minimizedList.map(mapResourceToListItem), toggleListItem],
  };
};
