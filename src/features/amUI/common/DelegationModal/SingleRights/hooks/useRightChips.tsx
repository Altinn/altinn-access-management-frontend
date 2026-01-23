import React from 'react';
import { DsChip } from '@altinn/altinn-components';
import { ChipRight } from './rightsUtils';

export const useRightChips = (
  rights: ChipRight[],
  setRights: React.Dispatch<React.SetStateAction<ChipRight[]>>,
  chipClassname: string,
) => {
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
              onClick={() => {
                setRights(
                  rights.map((r) => {
                    if (r.rightKey === right.rightKey && r.delegable) {
                      return { ...r, checked: !r.checked };
                    }
                    return r;
                  }),
                );
              }}
            >
              {actionText}
            </DsChip.Checkbox>
          </div>
        );
      });
  return { chips };
};
