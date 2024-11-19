import type { Key } from 'react';
import React from 'react';
import { CogIcon, Buildings3Icon } from '@navikt/aksel-icons';
import { t } from 'i18next';

import type { ListTextColor } from '@/components/CompactDeletableListItem/CompactDeletableListItem';
import type { ApiDelegationResult } from '@/dataObjects/dtos/resourceDelegation';
import { removeOrg } from '@/rtk/features/apiDelegation/apiDelegationSlice';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import type {
  DelegableApi,
  ApiDelegation,
} from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';
import { softRemoveApi } from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';
import type { Organization } from '@/rtk/features/lookupApi';
import { BorderedList, CompactDeletableListItem } from '@/components';

import classes from './ConfirmationPage.module.css';

interface DelegationReceiptListProps {
  items: ApiDelegationResult[];
  contentColor?: ListTextColor;
}

export const DelegationReceiptList = ({ items, contentColor }: DelegationReceiptListProps) => (
  <BorderedList className={classes.list}>
    {items?.map((item, index) => (
      <CompactDeletableListItem
        key={index}
        contentColor={contentColor}
        middleText={item.apiName}
        leftText={item.orgName}
      />
    ))}
  </BorderedList>
);

export const DelegableApiList = () => {
  const chosenApis = useAppSelector((state) => state.delegableApi.chosenApis);
  const dispatch = useAppDispatch();

  return (
    <div className={classes.listContainer}>
      <BorderedList>
        {chosenApis?.map((api: DelegableApi | ApiDelegation, index: Key) => (
          <CompactDeletableListItem
            key={index}
            startIcon={<CogIcon />}
            removeCallback={chosenApis.length > 1 ? () => dispatch(softRemoveApi(api)) : null}
            leftText={api.apiName}
            middleText={api.orgName}
          ></CompactDeletableListItem>
        ))}
      </BorderedList>
    </div>
  );
};

export const DelegableOrgList = () => {
  const chosenOrgs = useAppSelector((state) => state.apiDelegation.chosenOrgs);
  const dispatch = useAppDispatch();

  return (
    <div className={classes.listContainer}>
      <BorderedList>
        {chosenOrgs?.map((org: Organization, index: Key | null | undefined) => (
          <CompactDeletableListItem
            key={index}
            startIcon={<Buildings3Icon />}
            removeCallback={chosenOrgs.length > 1 ? () => dispatch(removeOrg(org)) : null}
            leftText={org.name}
            middleText={t('common.org_nr') + ' ' + org.orgNumber}
          ></CompactDeletableListItem>
        ))}
      </BorderedList>
    </div>
  );
};
