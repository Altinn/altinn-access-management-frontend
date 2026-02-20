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

  const onActionCLick = (right: ChipRight) => {
    if (right.inherited) {
      setPopoverOpen(right.rightKey);
    } else {
      toggle(right);
    }
  };

  const chips = (editable: boolean) =>
    rights
      .filter((right: ChipRight) => !editable || right.delegable)
      .map((right: ChipRight) => {
        const actionText = right.action;
        return (
          <div key={right.rightKey}>
            <DsChip.Checkbox
              className={chipClassname}
              data-size='sm'
              checked={right.checked}
              onClick={() => editable && onActionCLick(right)}
              popoverTarget={right.inherited ? `popover_${right.rightKey}` : undefined}
              aria-describedby={right.inherited ? `popover_${right.rightKey}` : undefined}
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
              {t('single_rights.inheritance.right_inherited')}
            </DsPopover>
          </div>
        );
      });
  return { chips };
};
