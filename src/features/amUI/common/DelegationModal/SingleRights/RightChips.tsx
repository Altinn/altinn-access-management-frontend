import React, { useState } from 'react';
import { DsChip, DsPopover } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { ChipRight } from '../utils/rightsUtils';
import { InheritedStatusType } from '../../useInheritedStatus';

import classes from './ResourceInfo.module.css';

const STATUS_TRANSLATION_KEYS: Record<InheritedStatusType, string> = {
  [InheritedStatusType.ViaRole]: 'single_rights.action_popover.right_inherited_via_role',
  [InheritedStatusType.ViaConnection]:
    'single_rights.action_popover.right_inherited_via_connection',
  [InheritedStatusType.ViaKeyRole]: 'single_rights.action_popover.right_inherited_via_keyrole',
  [InheritedStatusType.ViaER]: 'single_rights.action_popover.right_inherited_via_er',
};

interface RightChipsProps {
  rights: ChipRight[];
  setRights: React.Dispatch<React.SetStateAction<ChipRight[]>>;
  editable?: boolean;
}

export const RightChips = ({ rights, setRights, editable }: RightChipsProps) => {
  const { t } = useTranslation();
  const [popoverOpen, setPopoverOpen] = useState('');

  const toggle = (right: ChipRight) =>
    setRights(
      rights.map((r) => {
        if (r.rightKey === right.rightKey && r.delegable) {
          return { ...r, checked: !r.checked };
        }
        return r;
      }),
    );

  const onActionClick = (right: ChipRight, editable: boolean | undefined) => {
    if (right.inherited) {
      setPopoverOpen(right.rightKey);
    } else if (!editable) {
      setPopoverOpen(right.rightKey);
    } else if (!right.delegable && right.checked) {
      setPopoverOpen(right.rightKey);
    } else {
      toggle(right);
    }
  };

  const getPopoverText = (right: ChipRight, editable: boolean | undefined): string => {
    if (right.inherited) {
      const textKey = STATUS_TRANSLATION_KEYS[right.inheritedReason?.reason as InheritedStatusType];

      if (!textKey) {
        return t('single_rights.action_popover.right_inherited');
      }
      return t(textKey, {
        user_name: right.inheritedReason?.toParty,
        via_name: right.inheritedReason?.viaParty,
      });
    } else if (!editable) {
      return t('single_rights.action_popover.right_not_editable');
    }
    return t('single_rights.action_popover.right_not_delegable');
  };

  return (
    <>
      {rights
        .filter((right: ChipRight) => !editable || right.delegable || right.checked)
        .map((right: ChipRight) => {
          const actionText = right.rightName;
          const isPopoverTarget =
            right.inherited || !editable || (!right.delegable && right.checked);
          const popoverText = isPopoverTarget ? getPopoverText(right, editable) : undefined;
          return (
            <div key={right.rightKey}>
              <DsChip.Checkbox
                className={classes.chip}
                data-size='sm'
                checked={right.checked}
                onClick={() => onActionClick(right, editable)}
                popoverTarget={isPopoverTarget ? `popover_${right.rightKey}` : undefined}
                aria-describedby={isPopoverTarget ? `popover_${right.rightKey}` : undefined}
              >
                {actionText}
              </DsChip.Checkbox>
              <DsPopover
                id={`popover_${right.rightKey}`}
                open={popoverOpen === right.rightKey}
                placement='top'
                onClose={() => {
                  setPopoverOpen('');
                }}
                aria-live='polite'
                role='tooltip'
              >
                <div style={{ padding: '2px 2px' }}>{popoverText}</div>
              </DsPopover>
            </div>
          );
        })}
    </>
  );
};
