import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsHeading, DsParagraph, ListItem } from '@altinn/altinn-components';
import { CheckmarkCircleIcon } from '@navikt/aksel-icons';

import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';

import type { ChipRight } from '../utils/rightsUtils';

import { RightChips } from './RightChips';
import classes from './RightsChipList.module.css';

export interface RightsChipListProps {
  rights: ChipRight[];
  /*** RightChips edits the list in place, so it needs the setter itself */
  setRights: React.Dispatch<React.SetStateAction<ChipRight[]>>;
  /*** Already translated: the paragraph above the chips */
  description: string;
  /*** Already translated: the summary shown when every action is checked */
  allAccessTitle: string;
  /*** The actions that cannot be passed on, named so the user knows what is missing */
  undelegableActions: string[];
  /*** Only worth naming the undelegable actions when something is actually being given */
  showUndelegable?: boolean;
  editable?: boolean;
  isLoading?: boolean;
  /*** Sits under whatever heading the caller rendered above the list */
  undelegableHeadingLevel?: 4 | 5;
}

/**
 * The collapsible summary of a set of actions: how many are checked, and the chips to change them.
 *
 * Shared by the add flows (RightsPicker) and the edit flows (RightsSection), which differ in what
 * they put around it - headings, alerts - but not in the list itself.
 */
export const RightsChipList = ({
  rights,
  setRights,
  description,
  allAccessTitle,
  undelegableActions,
  showUndelegable = true,
  editable,
  isLoading,
  undelegableHeadingLevel = 4,
}: RightsChipListProps) => {
  const { t } = useTranslation();
  const isSmall = useIsMobileOrSmaller();
  const [isExpanded, setIsExpanded] = useState(false);

  const checkedCount = rights.filter((r) => r.checked).length;

  return (
    <ListItem
      loading={isLoading}
      icon={CheckmarkCircleIcon}
      collapsible
      size={isSmall ? 'sm' : 'md'}
      title={
        checkedCount === rights.length
          ? allAccessTitle
          : t('delegation_modal.actions.partial_access', {
              count: checkedCount,
              total: rights.length,
            })
      }
      onClick={() => setIsExpanded(!isExpanded)}
      expanded={isExpanded}
      as='button'
      containerAs='div'
      border='solid'
      shadow='none'
    >
      <div className={classes.rightExpandableContent}>
        <DsParagraph>{description}</DsParagraph>
        <div className={classes.rightChips}>
          <RightChips
            rights={rights}
            setRights={setRights}
            editable={editable}
          />
        </div>
        {showUndelegable && undelegableActions.length > 0 && (
          <div className={classes.undelegableSection}>
            <DsHeading
              level={undelegableHeadingLevel}
              data-size='2xs'
              className={classes.undelegableHeader}
            >
              {t('delegation_modal.actions.cannot_give_header')}
            </DsHeading>
            <div className={classes.undelegableActions}>{undelegableActions.join(', ')}</div>
          </div>
        )}
      </div>
    </ListItem>
  );
};
