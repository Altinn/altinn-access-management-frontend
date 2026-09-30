import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { DsAlert, DsHeading, DsParagraph } from '@altinn/altinn-components';

import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';

import { DelegationAction } from '../EditModal';
import { type ChipRight } from '../utils/rightsUtils';

import { RightsChipList } from './RightsChipList';
import classes from './ResourceInfo.module.css';

interface RightsSectionProps {
  rights: ChipRight[];
  setRights: React.Dispatch<React.SetStateAction<ChipRight[]>>;
  undelegableActions: string[];
  isDelegationCheckLoading: boolean;
  toName?: string;
  availableActions: DelegationAction[] | undefined;
  delegationError: 'delegate' | 'revoke' | 'edit' | null;
  missingAccess: string | null;
  hasAccessAndNoChanges?: boolean;
  allAccessTitle?: string;
  actionDescription?: string;
}

export const RightsSection = ({
  rights,
  setRights,
  undelegableActions,
  isDelegationCheckLoading,
  toName,
  availableActions,
  delegationError,
  missingAccess,
  hasAccessAndNoChanges,
  allAccessTitle,
  actionDescription,
}: RightsSectionProps) => {
  const { t } = useTranslation();
  const isSmall = useIsMobileOrSmaller();

  const isRequest = availableActions?.includes(DelegationAction.REQUEST);
  const isApprove = availableActions?.includes(DelegationAction.APPROVE);

  const rightsDescription = () => {
    if (isRequest) {
      return t('delegation_modal.actions.request_action_description');
    }
    if (isApprove) {
      return t('delegation_modal.actions.approve_action_description');
    }
    return actionDescription ?? t('delegation_modal.actions.action_description');
  };

  const getListItemHeading = (hasAccessAndNoChanges?: boolean, isSingleRightRequest?: boolean) => {
    if (hasAccessAndNoChanges) return 'delegation_modal.name_has_the_following';
    if (isSingleRightRequest) return 'delegation_modal.name_requests_access_to';
    return 'delegation_modal.name_will_receive';
  };

  return (
    <>
      {delegationError && (
        <DsAlert
          data-color='danger'
          data-size='sm'
        >
          <DsHeading
            level={3}
            data-size='xs'
          >
            {t('delegation_modal.technical_error_message.heading')}
          </DsHeading>
          <DsParagraph>
            {delegationError !== 'revoke' &&
              `${t('delegation_modal.technical_error_message.message')} ${t('delegation_modal.technical_error_message.all_failed', { name: toName })}`}
            {delegationError === 'revoke' &&
              t('delegation_modal.technical_error_message.revoke_failed')}
          </DsParagraph>
        </DsAlert>
      )}
      {missingAccess && (
        <DsAlert
          data-color='info'
          data-size='sm'
        >
          {missingAccess}
        </DsAlert>
      )}
      <div className={classes.rightsSection}>
        <DsHeading
          level={4}
          data-size={isSmall ? '2xs' : 'xs'}
        >
          <Trans
            i18nKey={getListItemHeading(hasAccessAndNoChanges, isRequest)}
            values={{ name: toName }}
            components={{ strong: <strong /> }}
          />
        </DsHeading>
        <RightsChipList
          rights={rights}
          setRights={setRights}
          description={rightsDescription()}
          allAccessTitle={allAccessTitle ?? t('delegation_modal.actions.access_to_all')}
          undelegableActions={undelegableActions}
          showUndelegable={availableActions?.includes(DelegationAction.DELEGATE)}
          editable={availableActions?.includes(DelegationAction.DELEGATE)}
          isLoading={isDelegationCheckLoading}
          undelegableHeadingLevel={5}
        />
      </div>
    </>
  );
};
