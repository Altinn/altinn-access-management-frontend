import { useState } from 'react';
import { Button, List } from '@digdir/design-system-react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import * as React from 'react';

import type { OverviewOrg } from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgSlice';
import { softDelete, softRestore } from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgSlice';
import { useAppDispatch } from '@/rtk/app/hooks';
import { ReactComponent as MinusCircle } from '@/assets/MinusCircle.svg';
import { ReactComponent as Cancel } from '@/assets/Cancel.svg';
import { ReactComponent as AddCircle } from '@/assets/AddCircle.svg';
import { DeletableListItem, ActionBar } from '@/components';
import { useMediaQuery } from '@/resources/hooks';

import classes from './OrgDelegationActionBar.module.css';

export interface OrgDelegationActionBarProps {
  organization: OverviewOrg;
  isEditable: boolean;
  softRestoreAllCallback: () => void;
  softDeleteAllCallback: () => void;
  delegateToOrgCallback?: () => void;
}

export const OrgDelegationActionBar = ({
  organization,
  softRestoreAllCallback,
  softDeleteAllCallback,
  isEditable = false,
  delegateToOrgCallback,
}: OrgDelegationActionBarProps) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('common');
  const numberOfAccesses = organization.apiList.length.toString();
  const dispatch = useAppDispatch();
  const isSm = useMediaQuery('(max-width: 768px)');

  const handleSoftDeleteAll = () => {
    softDeleteAllCallback();
    setOpen(true);
  };

  const actions = (
    <>
      {delegateToOrgCallback && (
        <Button
          variant={'quiet'}
          color={'primary'}
          icon={<AddCircle />}
          size={'medium'}
          onClick={delegateToOrgCallback}
          aria-label={String(t('api_delegation.delegate_new_api'))}
        >
          {t('api_delegation.delegate_new_api')}
        </Button>
      )}
      {isEditable &&
        (organization.isAllSoftDeleted ? (
          <Button
            variant={'quiet'}
            color={'secondary'}
            size={'medium'}
            icon={<Cancel />}
            onClick={softRestoreAllCallback}
            aria-label={String(t('api_delegation.undo')) + ' ' + organization.orgName}
          >
            {!isSm && t('api_delegation.undo')}
          </Button>
        ) : (
          <div>
            <Button
              variant={'quiet'}
              color={'danger'}
              icon={<MinusCircle />}
              size={'medium'}
              onClick={handleSoftDeleteAll}
              aria-label={String(t('api_delegation.delete')) + ' ' + organization.orgName}
            >
              {!isSm && t('api_delegation.delete')}
            </Button>
          </div>
        ))}
    </>
  );

  const listItems = organization.apiList.map((item, i) => (
    <DeletableListItem
      key={i}
      softDeleteCallback={() => dispatch(softDelete([organization.id, item.id]))}
      softRestoreCallback={() => dispatch(softRestore([organization.id, item.id]))}
      item={item}
      isEditable={isEditable}
      scopes={item.scopes}
    ></DeletableListItem>
  ));

  return (
    <ActionBar
      onClick={() => {
        setOpen(!open);
      }}
      open={open}
      color={'neutral'}
      actions={actions}
      title={
        <div
          className={cn(classes.orgDelegationActionBarTitle, {
            [classes.actionBarText__softDelete]: organization.isAllSoftDeleted,
          })}
        >
          {organization.orgName}
        </div>
      }
      subtitle={
        <div
          className={cn({
            [classes.actionBarSubtitle__softDelete]: organization.isAllSoftDeleted,
          })}
        >
          {t('api_delegation.org_nr') + ' ' + organization.orgNr}
        </div>
      }
      additionalText={
        <div
          className={cn(classes.additionalText, {
            [classes.actionBarText__softDelete]: organization.isAllSoftDeleted,
          })}
        >
          {!isSm && (
            <span>
              {numberOfAccesses} {t('api_delegation.api_accesses')}
            </span>
          )}
        </div>
      }
    >
      <div className={classes.actionBarContent}>
        <List borderStyle={'solid'}>{listItems}</List>
      </div>
    </ActionBar>
  );
};
