import React, { useState } from 'react';
import { DsChip, DsPopover } from '@altinn/altinn-components';
import { ChipRight } from './rightsUtils';
import { useTranslation } from 'react-i18next';

export const useRightChips = (
  rights: ChipRight[],
  setRights: React.Dispatch<React.SetStateAction<ChipRight[]>>,
  chipClassname: string,
) => {
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

  const onActionClick = (right: ChipRight) => {
    if (right.inherited) {
      setPopoverOpen(right.rightKey);
    } else if (!right.delegable && right.checked) {
      setPopoverOpen(right.rightKey);
    } else {
      toggle(right);
    }
  };

  const chips = (editable: boolean) =>
    rights
      .filter((right: ChipRight) => !editable || right.delegable || right.checked)
      .map((right: ChipRight) => {
        const actionText = right.rightName;
        const isPopoverTarget = right.inherited || (!right.delegable && right.checked);
        const popoverText = isPopoverTarget
          ? right.inherited
            ? t('single_rights.action_popover.right_inherited')
            : t('single_rights.action_popover.right_not_delegable')
          : undefined;
        return (
          <div key={right.rightKey}>
            <DsChip.Checkbox
              className={chipClassname}
              data-size='sm'
              checked={right.checked}
              onClick={() => editable && onActionClick(right)}
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
      });
  return { chips };
};
