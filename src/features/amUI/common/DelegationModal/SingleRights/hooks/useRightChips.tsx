import React, { useState } from 'react';
import { DsChip, DsPopover, formatDisplayName } from '@altinn/altinn-components';
import { ChipRight } from './rightsUtils';
import { Trans } from 'react-i18next';
import { InheritedStatusType } from '../../../useInheritedStatus';
import { PartyType } from '@/rtk/features/userInfoApi';

const STATUS_TRANSLATION_KEYS: Record<InheritedStatusType, string> = {
  [InheritedStatusType.ViaRole]: 'single_rights.inheritance.right_inherited_via_role',
  [InheritedStatusType.ViaConnection]: 'single_rights.inheritance.right_inherited_via_connection',
  [InheritedStatusType.ViaKeyRole]: 'single_rights.inheritance.right_inherited_via_keyrole',
};

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

  const onActionClick = (right: ChipRight) => {
    const isInherited = right.inheritedStatus && right.inheritedStatus.length > 0;
    if (isInherited) {
      setPopoverOpen(right.rightKey);
    } else {
      toggle(right);
    }
  };

  const getInheritedStatusMessage = (right: ChipRight): React.ReactNode => {
    // if there are more than one inheritedStatus, only show the first one
    const inheritedRight = right.inheritedStatus?.[0];
    // Intelligent Albatross har denne handlingen gjennom rollen de har i Rakrygget Ung Tiger AS.
    if (inheritedRight) {
      const textKey = STATUS_TRANSLATION_KEYS[inheritedRight.type];
      const formattedViaName = formatDisplayName({
        fullName: inheritedRight.via?.name || '',
        type: inheritedRight.via?.type === 'person' ? 'person' : 'company',
        reverseNameOrder: false,
      });

      const formattedUserName = formatDisplayName({
        fullName: right.toParty?.name || '',
        type: right.toParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
        reverseNameOrder: false,
      });
      return (
        <Trans
          i18nKey={textKey}
          values={{
            user_name: formattedUserName,
            via_name: formattedViaName,
          }}
        />
      );
    }

    return <></>;
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
              onClick={() => editable && onActionClick(right)}
              popoverTarget={
                right.inheritedStatus?.length ? `popover_${right.rightKey}` : undefined
              }
              aria-describedby={
                right.inheritedStatus?.length ? `popover_${right.rightKey}` : undefined
              }
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
              {getInheritedStatusMessage(right)}
            </DsPopover>
          </div>
        );
      });
  return { chips };
};
