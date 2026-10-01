import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsHeading, DsParagraph } from '@altinn/altinn-components';

import { RightsChipList } from '../DelegationModal/SingleRights/RightsChipList';
import type { ChipRight } from '../DelegationModal/utils/rightsUtils';
import { TechnicalErrorParagraphs } from '../TechnicalErrorParagraphs/TechnicalErrorParagraphs';

import classes from './RightsPicker.module.css';

export interface RightsPickerProps {
  /*** Section heading, already translated */
  heading: string;
  rights: ChipRight[];
  /*** RightChips edits the list in place, so it needs the setter itself */
  setRights: React.Dispatch<React.SetStateAction<ChipRight[]>>;
  /*** Already translated: the summary shown when every action is checked */
  accessToAllLabel: string;
  /*** Already translated: the paragraph above the chips */
  actionDescription: string;
  isLoading?: boolean;
  errorDetails?: { status: string; time: string; traceId?: string } | null;
  /*** Appended to the technical error, e.g. `resource: x - instance: y` */
  errorContext?: string;
}

/**
 * Picks which actions a recipient is about to be given.
 *
 * The copy that differs per flow arrives already translated; the keys resolved here are the ones
 * that only exist under delegation_modal.actions, which both flows already share.
 */
export const RightsPicker = ({
  heading,
  rights,
  setRights,
  accessToAllLabel,
  actionDescription,
  isLoading,
  errorDetails,
  errorContext,
}: RightsPickerProps) => {
  const { t } = useTranslation();

  const undelegableActions = rights.filter((r) => !r.delegable).map((r) => r.rightName);

  return (
    <div className={classes.rightsSection}>
      <DsHeading
        level={3}
        data-size='xs'
      >
        {heading}
      </DsHeading>

      {errorDetails ? (
        <DsAlert data-color='danger'>
          <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
          <TechnicalErrorParagraphs
            status={errorDetails.status}
            time={errorDetails.time}
            traceId={errorDetails.traceId}
            additionalContext={errorContext}
          />
        </DsAlert>
      ) : (
        <RightsChipList
          rights={rights}
          setRights={setRights}
          description={actionDescription}
          allAccessTitle={accessToAllLabel}
          undelegableActions={undelegableActions}
          editable
          isLoading={isLoading}
        />
      )}
    </div>
  );
};
