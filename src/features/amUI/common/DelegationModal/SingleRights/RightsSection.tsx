import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { DsAlert, DsHeading, DsParagraph, ListItem } from '@altinn/altinn-components';
import classes from './ResourceInfo.module.css';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import { RightChips } from './RightChips';
import { DelegationAction } from '../EditModal';
import { CheckmarkCircleIcon } from '@navikt/aksel-icons';
import { ChipRight } from '../hooks/rightsUtils';

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

  const [rightsExpanded, setRightsExpanded] = useState(false);
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
        <ListItem
          loading={isDelegationCheckLoading}
          icon={CheckmarkCircleIcon}
          collapsible={true}
          size={isSmall ? 'sm' : 'md'}
          title={
            rights.filter((r) => r.checked).length !== rights.length
              ? t('delegation_modal.actions.partial_access', {
                  count: rights.filter((r) => r.checked).length,
                  total: rights.length,
                })
              : (allAccessTitle ?? t('delegation_modal.actions.access_to_all'))
          }
          onClick={() => setRightsExpanded(!rightsExpanded)}
          expanded={rightsExpanded}
          as='button'
          border='solid'
          shadow='none'
        >
          <div className={classes.rightExpandableContent}>
            <DsParagraph>{rightsDescription()}</DsParagraph>
            <div className={classes.rightChips}>
              <RightChips
                rights={rights}
                setRights={setRights}
                editable={availableActions?.includes(DelegationAction.DELEGATE)}
              />
            </div>
            {undelegableActions.length > 0 &&
              availableActions?.includes(DelegationAction.DELEGATE) && (
                <div className={classes.undelegableSection}>
                  <DsHeading
                    level={5}
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
      </div>
    </>
  );
};
