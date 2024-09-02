import { useState } from 'react';
import { Button } from '@digdir/designsystemet-react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { MinusCircleIcon, ArrowUndoIcon, PlusCircleIcon } from '@navikt/aksel-icons';

import type {
  DeletionDto,
  OverviewOrg,
} from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgApi';
import { DeletableListItem, ActionBar, BorderedList } from '@/components';
import { useMediaQuery } from '@/resources/hooks';
import { getButtonIconSize } from '@/resources/utils';

import classes from './OrgDelegationActionBar.module.css';

export interface OrgDelegationActionBarProps {
  organization: OverviewOrg;
  isEditable: boolean;
  softRestoreAllCallback: () => void;
  softDeleteAllCallback: () => void;
  softRestoreCallback: (value: DeletionDto) => void;
  softDeleteCallback: (value: DeletionDto) => void;
  delegateToOrgCallback?: () => void;
  setScreenreaderMsg: () => void;
  checkIfItemIsSoftDeleted: (value: DeletionDto) => boolean;
  checkIfAllItmesAreSoftDeleted: (orgNumber: string) => boolean;
}

export const OrgDelegationActionBar = ({
  organization,
  softRestoreAllCallback,
  softDeleteAllCallback,
  softRestoreCallback,
  softDeleteCallback,
  isEditable = false,
  delegateToOrgCallback,
  setScreenreaderMsg,
  checkIfItemIsSoftDeleted,
  checkIfAllItmesAreSoftDeleted,
}: OrgDelegationActionBarProps) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const numberOfAccesses = organization.apiList.length.toString();
  const isSm = useMediaQuery('(max-width: 768px)');
  const isAllSoftDeleted = checkIfAllItmesAreSoftDeleted(organization.orgNumber);
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
        (isAllSoftDeleted ? (
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

  const listItems = organization.apiList.map((item, i) => {
    return (
      <DeletableListItem
        key={i}
        softDeleteCallback={() => {
          softDeleteCallback({ orgNumber: organization.orgNumber, apiId: item.id });
          setScreenreaderMsg();
        }}
        softRestoreCallback={() =>
          softRestoreCallback({ orgNumber: organization.orgNumber, apiId: item.id })
        }
        item={item}
        isEditable={isEditable}
        scopes={item.scopes}
        checkIfItemOfOrgIsSoftDeleted={(itemId: string) =>
          checkIfItemIsSoftDeleted({ orgNumber: organization.orgNumber, apiId: itemId })
        }
      />
    );
  });

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
            [classes.actionBarText__softDelete]: isAllSoftDeleted,
          })}
        >
          {organization.name}
        </div>
      }
      subtitle={
        <div
          className={cn({
            [classes.actionBarSubtitle__softDelete]: isAllSoftDeleted,
          })}
        >
          {t('common.org_nr') + ' ' + organization.name}
        </div>
      }
      additionalText={
        <div
          className={cn(classes.additionalText, {
            [classes.actionBarText__softDelete]: isAllSoftDeleted,
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
