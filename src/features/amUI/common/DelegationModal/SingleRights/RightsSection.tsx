import { DeleteResourceButton } from '@/features/amUI/userRightsPage/SingleRightsSection/DeleteResourceButton';
import { PartyType } from '@/rtk/features/userInfoApi';
import {
  formatDisplayName,
  DsAlert,
  DsHeading,
  DsParagraph,
  ListItem,
  Button,
} from '@altinn/altinn-components';
import { CheckmarkCircleIcon } from '@navikt/aksel-icons';
import { t } from 'i18next';
import { Trans, useTranslation } from 'react-i18next';
import { ResourceAlert } from './ResourceAlert';
import { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { ChipRight } from './hooks/rightsUtils';
import { JSX, useState } from 'react';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

import classes from './ResourceInfo.module.css';

type RightsSectionProps = {
  resource: ServiceResource;
  isDelegationCheckError: boolean;
  delegationCheckError: FetchBaseQueryError | SerializedError | undefined;
  delegationError: string | null;
  missingAccess: string | null;
  hasAccess: boolean;
  hasUnsavedChanges: boolean;
  rights: ChipRight[];
  chips: () => JSX.Element[];
  saveEditedRights: () => void;
  delegateChosenRights: () => void;
  undelegableActions: string[];
};

export const RightsSection = ({
  resource,
  chips,
  saveEditedRights,
  delegateChosenRights,
  undelegableActions,
  rights,
  hasUnsavedChanges,
  hasAccess,
  isDelegationCheckError,
  delegationCheckError,
  delegationError,
  missingAccess,
}: RightsSectionProps) => {
  const [rightsExpanded, setRightsExpanded] = useState(false);

  const { t } = useTranslation();
  const { toParty } = usePartyRepresentation();

  const toName = formatDisplayName({
    fullName: toParty?.name ?? '',
    type: toParty?.partyTypeName === PartyType.Organization ? 'company' : 'person',
  });
  const displayResourceAlert =
    isDelegationCheckError ||
    resource?.delegable === false ||
    (rights.length > 0 && !rights.some((r) => r.delegable === true));

  const delegationCheckErrorDetails =
    isDelegationCheckError &&
    delegationCheckError &&
    'status' in delegationCheckError &&
    typeof (delegationCheckError as FetchBaseQueryError).status !== 'undefined'
      ? {
          status: String((delegationCheckError as FetchBaseQueryError).status),
          time: (delegationCheckError as FetchBaseQueryError).data as string,
        }
      : null;

  return (
    <>
      {displayResourceAlert ? (
        <ResourceAlert
          error={delegationCheckErrorDetails}
          rightReasons={rights.map((r) => r.delegationReason)}
          resource={resource}
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
                {t('delegation_modal.technical_error_message.message')} {delegationError}
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
              data-size='xs'
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
              icon={CheckmarkCircleIcon}
              collapsible={true}
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
                <div className={classes.rightChips}>{chips()}</div>
                {undelegableActions.length > 0 && (
                  <div className={classes.undelegableSection}>
                    <DsHeading
                      level={5}
                      data-size='2xs'
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
        <Button
          data-size='sm'
          disabled={
            displayResourceAlert || !rights.some((r) => r.checked === true) || !hasUnsavedChanges
          }
          onClick={hasAccess ? saveEditedRights : delegateChosenRights}
        >
          {hasAccess ? t('common.update_poa') : t('common.give_poa')}
        </Button>
        {hasAccess && toParty && (
          <DeleteResourceButton
            resource={resource}
            fullText
          />
        )}
      </div>
    </>
  );
};
