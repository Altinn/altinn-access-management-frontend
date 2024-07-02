import { Button } from '@digdir/designsystemet-react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { MinusCircleIcon, ArrowUndoIcon } from '@navikt/aksel-icons';

import type { ApiListItem } from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgSlice';
import { useMediaQuery } from '@/resources/hooks';
import { getButtonIconSize } from '@/resources/utils';

import { BorderedList } from '../BorderedList';
import ScopeList from '../ScopeList/ScopeList';

import classes from './DeletableListItem.module.css';

export interface DeletableListItemProps {
  softDeleteCallback: () => void;
  softRestoreCallback: () => void;
  item: ApiListItem;
  isEditable: boolean;
  scopes?: string[];
}

export const DeletableListItem = ({
  softDeleteCallback,
  softRestoreCallback,
  item,
  isEditable,
  scopes,
}: DeletableListItemProps) => {
  const { t } = useTranslation();
  const isSm = useMediaQuery('(max-width: 768px)');

  const isEditableActions = (
    <div className={cn(classes.deleteSection)}>
      {item.isSoftDelete ? (
        <Button
          variant={'tertiary'}
          color='second'
          onClick={softRestoreCallback}
          icon={isSm}
          size='medium'
          aria-label={`${t('common.undo')} ${t('api_delegation.delete')} ${item.apiName}`}
        >
          <ArrowUndoIcon fontSize={getButtonIconSize(!isSm)} /> {!isSm && t('common.undo')}
        </Button>
      ) : (
        <Button
          variant='tertiary'
          color='danger'
          icon={isSm}
          size='medium'
          onClick={softDeleteCallback}
          aria-label={String(t('api_delegation.delete') + ' ' + item.apiName)}
        >
          <MinusCircleIcon fontSize={getButtonIconSize(!isSm)} />{' '}
          {!isSm && t('api_delegation.delete')}
        </Button>
      )}
    </div>
  );

  return (
    <BorderedList.Item borderStyle='solid'>
      <div className={classes.listItem}>
        <div
          data-testid='list-item-texts'
          className={cn(classes.itemText, {
            [classes.itemText__softDelete]: item.isSoftDelete,
          })}
        >
          <div className={classes.listItemTexts}>
            <h4 className={classes.apiListItem}>{item.apiName}</h4>
            <div className={classes.ownerListItem}>{item.owner}</div>
            {scopes && (
              <div className={classes.scopeListContainer}>
                <p className={classes.scopeText}>{t('api_delegation.scopes')}:</p>
                <ScopeList scopeList={scopes} />
              </div>
            )}
            <div>{item.description}</div>
          </div>
        </div>
        {isEditable && isEditableActions}
      </div>
    </BorderedList.Item>
  );
};
