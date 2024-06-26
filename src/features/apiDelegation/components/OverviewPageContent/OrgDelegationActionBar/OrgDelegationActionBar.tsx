import { useState } from 'react';
import { Button } from '@digdir/designsystemet-react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { MinusCircleIcon, ArrowUndoIcon, PlusCircleIcon } from '@navikt/aksel-icons';

import type { OverviewOrg } from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgSlice';
import { softDelete, softRestore } from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgSlice';
import { useAppDispatch } from '@/rtk/app/hooks';
import { DeletableListItem, ActionBar, BorderedList } from '@/components';
import { useMediaQuery } from '@/resources/hooks';
import { getButtonIconSize } from '@/resources/utils';

import classes from './OrgDelegationActionBar.module.css';

export interface OrgDelegationActionBarProps {
  organization: OverviewOrg;
  isEditable: boolean;
  softRestoreAllCallback: () => void;
  softDeleteAllCallback: () => void;
  delegateToOrgCallback?: () => void;
  setScreenreaderMsg: () => void;
}

export const OrgDelegationActionBar = ({
  organization,
  softRestoreAllCallback,
  softDeleteAllCallback,
  isEditable = false,
  delegateToOrgCallback,
  setScreenreaderMsg,
}: OrgDelegationActionBarProps) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
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
          variant={'tertiary'}
          color={'first'}
          size={'medium'}
          onClick={delegateToOrgCallback}
          aria-label={String(t('api_delegation.delegate_new_api'))}
        >
          <PlusCircleIcon fontSize='1.5rem' /> {t('api_delegation.delegate_new_api')}
        </Button>
      )}
      {isEditable &&
        (organization.isAllSoftDeleted ? (
          <Button
            variant={'tertiary'}
            color={'second'}
            size={'medium'}
            onClick={softRestoreAllCallback}
            aria-label={`${t('common.undo')} ${t('api_delegation.delete')} ${organization.name}`}
            icon={isSm}
          >
            <ArrowUndoIcon fontSize={getButtonIconSize(!isSm)} />
            {!isSm && t('common.undo')}
          </Button>
        ) : (
          <div>
            <Button
              variant={'tertiary'}
              color={'danger'}
              size={'medium'}
              onClick={handleSoftDeleteAll}
              aria-label={String(t('api_delegation.delete')) + ' ' + organization.name}
              icon={isSm}
            >
              <MinusCircleIcon fontSize={getButtonIconSize(!isSm)} />
              {!isSm && t('api_delegation.delete')}
            </Button>
          </div>
        ))}
    </>
  );

  const listItems = organization.apiList.map((item, i) => (
    <DeletableListItem
      key={i}
      softDeleteCallback={() => {
        dispatch(softDelete([organization.id, item.id]));
        setScreenreaderMsg();
      }}
      softRestoreCallback={() => dispatch(softRestore([organization.id, item.id]))}
      item={item}
      isEditable={isEditable}
      scopes={item.scopes}
    ></DeletableListItem>
  ));

  return (
    <ActionBar
      headingLevel={3}
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
          {organization.name}
        </div>
      }
      subtitle={
        <div
          className={cn({
            [classes.actionBarSubtitle__softDelete]: organization.isAllSoftDeleted,
          })}
        >
          {t('common.org_nr') + ' ' + organization.name}
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
        <BorderedList borderStyle={'solid'}>{listItems}</BorderedList>
      </div>
    </ActionBar>
  );
};
