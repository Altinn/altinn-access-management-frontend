import { PartyType } from '@/rtk/features/userInfoApi';
import {
  formatDisplayName,
  DsAlert,
  DsHeading,
  DsParagraph,
  ListItem,
  Button,
  DsButton,
} from '@altinn/altinn-components';
import { CheckmarkCircleIcon, MinusCircleIcon } from '@navikt/aksel-icons';
import { Trans, useTranslation } from 'react-i18next';
import { ResourceAlert } from './ResourceAlert';
import { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { ChipRight } from './hooks/rightsUtils';
import { JSX, useState } from 'react';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import { DelegationAction } from '../EditModal';
import { createErrorDetails } from '@/features/amUI/common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';

import classes from './ResourceInfo.module.css';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';

type RightsSectionProps = {
  resource: ServiceResource;
  isDelegationCheckError: boolean;
  isDelegationCheckLoading: boolean;
  delegationCheckError: FetchBaseQueryError | SerializedError | undefined;
  delegationError: string | null;
  missingAccess: string | null;
  hasAccess: boolean;
  hasUnsavedChanges: boolean;
  rights: ChipRight[];
  chips: (editable: boolean) => JSX.Element[];
  saveEditedRights: () => void;
  delegateChosenRights: () => void;
  revokeResource: () => void;
  undelegableActions: string[];
  availableActions?: DelegationAction[];
  rightsMetaTechnicalErrorDetails: { status: string; time: string } | null;
  hasRequestedSingleRight?: boolean;
  isLoadingRequest?: boolean;
  sendRequest: () => void;
  deleteRequest: () => void;
};

export const RightsSection = ({
  resource,
  chips,
  saveEditedRights,
  delegateChosenRights,
  revokeResource,
  undelegableActions,
  rights,
  hasUnsavedChanges,
  hasAccess,
  isDelegationCheckLoading,
  isDelegationCheckError,
  delegationCheckError,
  delegationError,
  missingAccess,
  availableActions,
  rightsMetaTechnicalErrorDetails,
  hasRequestedSingleRight,
  isLoadingRequest,
  sendRequest,
  deleteRequest,
}: RightsSectionProps) => {
  const [rightsExpanded, setRightsExpanded] = useState(false);
  const isSmall = useIsMobileOrSmaller();

  const { t } = useTranslation();
  const { toParty } = usePartyRepresentation();

  const toName = formatDisplayName({
    fullName: toParty?.name ?? '',
    type: toParty?.partyTypeName === PartyType.Organization ? 'company' : 'person',
  });
  const displayResourceAlert =
    !!rightsMetaTechnicalErrorDetails ||
    (availableActions?.includes(DelegationAction.DELEGATE) &&
      !hasAccess &&
      (isDelegationCheckError ||
        resource?.delegable === false ||
        (rights.length > 0 && !rights.some((r) => r.delegable === true))));

  const delegationCheckErrorDetails = isDelegationCheckError
    ? createErrorDetails(delegationCheckError)
    : null;

  const technicalErrorDetails = rightsMetaTechnicalErrorDetails ?? delegationCheckErrorDetails;

  return (
    <>
      {displayResourceAlert ? (
        <ResourceAlert
          error={technicalErrorDetails}
          rightReasons={rights.map((r) => r.delegationReason)}
          resource={resource}
          className={classes.resourceAlert}
        />
      ) : (
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
          {missingAccess && availableActions?.includes(DelegationAction.DELEGATE) && (
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
              {hasAccess && !hasUnsavedChanges ? (
                <Trans
                  i18nKey='delegation_modal.name_has_the_following'
                  values={{ name: toName }}
                  components={{ strong: <strong /> }}
                />
              ) : (
                <Trans
                  i18nKey='delegation_modal.name_will_receive'
                  values={{ name: toName }}
                  components={{ strong: <strong /> }}
                />
              )}
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
                  : t('delegation_modal.actions.access_to_all')
              }
              onClick={() => setRightsExpanded(!rightsExpanded)}
              expanded={rightsExpanded}
              as='button'
              border='solid'
              shadow='none'
            >
              <div className={classes.rightExpandableContent}>
                <DsParagraph>{t('delegation_modal.actions.action_description')}</DsParagraph>
                <div className={classes.rightChips}>
                  {chips(availableActions?.includes(DelegationAction.DELEGATE) ?? false)}
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
                      <div className={classes.undelegableActions}>
                        {undelegableActions.map((action) => action).join(', ')}
                      </div>
                    </div>
                  )}
              </div>
            </ListItem>
          </div>
        </>
      )}
      <div className={classes.editButtons}>
        {availableActions?.includes(DelegationAction.DELEGATE) && (
          <Button
            data-size='sm'
            disabled={
              displayResourceAlert || !rights.some((r) => r.checked === true) || !hasUnsavedChanges
            }
            onClick={hasAccess ? saveEditedRights : delegateChosenRights}
          >
            {hasAccess ? t('common.update_poa') : t('common.give_poa')}
          </Button>
        )}
        {hasAccess && toParty && (
          <Button
            variant={availableActions?.includes(DelegationAction.DELEGATE) ? 'tertiary' : 'primary'}
            className={classes.deleteButton}
            onClick={revokeResource}
            disabled={rights.length === 0 || rights.some((r) => r.inherited === true)}
            color='danger'
          >
            <MinusCircleIcon aria-hidden='true' />
            {t('common.delete_poa')}
          </Button>
        )}
        {!hasAccess &&
          !hasRequestedSingleRight &&
          availableActions?.includes(DelegationAction.REQUEST) && (
            <DsButton
              data-size='sm'
              disabled={!resource.delegable || isLoadingRequest}
              loading={isLoadingRequest}
              onClick={sendRequest}
            >
              {t('common.request_poa')}
            </DsButton>
          )}
        {hasRequestedSingleRight && availableActions?.includes(DelegationAction.REQUEST) && (
          <DsButton
            data-size='sm'
            disabled={!resource.delegable || isLoadingRequest}
            data-color='danger'
            loading={isLoadingRequest}
            onClick={deleteRequest}
          >
            {t('delegation_modal.request.delete_request')}
          </DsButton>
        )}
      </div>
    </>
  );
};
