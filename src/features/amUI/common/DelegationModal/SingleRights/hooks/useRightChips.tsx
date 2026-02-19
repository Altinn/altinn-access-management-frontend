import React, { useState } from 'react';
import { DsChip, DsPopover } from '@altinn/altinn-components';
import { ChipRight } from './rightsUtils';

export const useRightChips = (
  rights: ChipRight[],
  setRights: React.Dispatch<React.SetStateAction<ChipRight[]>>,
  chipClassname: string,
) => {
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

  const chips = () =>
    rights
      .filter((right: ChipRight) => right.delegable)
      .map((right: ChipRight) => {
        const actionText = right.action;
        return (
          <div key={right.rightKey}>
            <DsChip.Checkbox
              className={chipClassname}
              data-size='sm'
              checked={right.checked}
              onClick={() => (right.inherited ? setPopoverOpen(right.rightKey) : toggle(right))}
              popoverTarget={right.inherited ? `popover_${right.rightKey}` : undefined}
              aria-describedby={right.inherited ? `popover_${right.rightKey}` : undefined}
            >
              {actionText}
            </DsChip.Checkbox>
            <DsPopover
              id={`popover_${right.rightKey}`}
              open={popoverOpen === right.rightKey}
              onClose={() => {
                setPopoverOpen('');
              }}
              aria-live='polite'
              role='tooltip'
            >
              This right is inherited and cannot be changed here.
            </DsPopover>
          </div>
        );
      });
  return { chips };
};
