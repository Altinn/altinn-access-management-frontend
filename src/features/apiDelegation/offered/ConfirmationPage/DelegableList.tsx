import { BorderedList, CompactDeletableListItem } from '@/components';
import React, { Key } from 'react';
import classes from './ConfirmationPage.module.css';
import { ListTextColor } from '@/components/CompactDeletableListItem/CompactDeletableListItem';
import { ApiDelegationResult } from '@/dataObjects/dtos/resourceDelegation';
import { removeOrg } from '@/rtk/features/apiDelegation/apiDelegationSlice';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import {
  DelegableApi,
  ApiDelegation,
  softRemoveApi,
} from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';
import { Organization } from '@/rtk/features/lookup/lookupApi';
import { CogIcon, Buldings3Icon } from '@navikt/aksel-icons';
import { t } from 'i18next';

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
            startIcon={<Buldings3Icon />}
            removeCallback={chosenOrgs.length > 1 ? () => dispatch(removeOrg(org)) : null}
            leftText={org.name}
            middleText={t('common.org_nr') + ' ' + org.orgNumber}
          ></CompactDeletableListItem>
        ))}
      </BorderedList>
    </div>
  );
};
