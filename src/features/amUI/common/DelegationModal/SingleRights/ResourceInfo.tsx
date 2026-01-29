import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useState } from 'react';
import {
  Avatar,
  Button,
  DsAlert,
  DsHeading,
  DsParagraph,
  formatDisplayName,
  ListItem,
} from '@altinn/altinn-components';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { PartyType } from '@/rtk/features/userInfoApi';
import { StatusMessageForScreenReader } from '@/components/StatusMessageForScreenReader/StatusMessageForScreenReader';
import { useProviderLogoUrl } from '@/resources/hooks/useProviderLogoUrl';

import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { DeleteResourceButton } from '../../../userRightsPage/SingleRightsSection/DeleteResourceButton';

import classes from './ResourceInfo.module.css';
import { ResourceAlert } from './ResourceAlert';
import { StatusSection } from '../../StatusSection/StatusSection';
import { CheckmarkCircleIcon } from '@navikt/aksel-icons';
import { useRightsSection } from './hooks/useRightsSection';

export interface ResourceInfoProps {
  resource: ServiceResource;
  onDelegate?: () => void;
}

export const ResourceInfo = ({ resource, onDelegate }: ResourceInfoProps) => {
  const { t } = useTranslation();
  const [rightsExpanded, setRightsExpanded] = useState(false);
  const { getProviderLogoUrl } = useProviderLogoUrl();

  const { toParty } = usePartyRepresentation();

  const {
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
  } = useRightsSection({ resource, onDelegate });

  const delegationCheckErrorDetails =
    isDelegationCheckError && delegationCheckError && 'status' in delegationCheckError
      ? {
          status: delegationCheckError.status.toString(),
          time: delegationCheckError.data as string,
        }
      : null;

  const displayResourceAlert =
    isDelegationCheckError ||
    resource?.delegable === false ||
    (rights.length > 0 && !rights.some((r) => r.delegable === true));

  const hasDelegableRights = rights.some((r) => r.delegable);
  const showMissingRightsStatus =
    !hasAccess && ((rights.length > 0 && !hasDelegableRights) || !!missingAccess);
  const cannotDelegateHere = resource?.delegable === false;
  const emblem = getProviderLogoUrl(resource.resourceOwnerOrgcode ?? '');
  const toName = formatDisplayName({
    fullName: toParty?.name ?? '',
    type: toParty?.partyTypeName === PartyType.Organization ? 'company' : 'person',
  });

  return (
    <>
      <StatusMessageForScreenReader politenessSetting='assertive'>
        {delegationError ?? missingAccess ?? ''}
      </StatusMessageForScreenReader>
      {!!resource && (
        <div className={classes.infoView}>
          <div className={classes.infoHeading}>
            <div className={classes.resourceIcon}>
              {emblem || resource.resourceOwnerLogoUrl ? (
                <img
                  src={emblem ?? resource.resourceOwnerLogoUrl}
                  alt={resource.resourceOwnerName ?? ''}
                  width={40}
                  height={40}
                />
              ) : (
                <Avatar
                  type='company'
                  imageUrl={resource.resourceOwnerLogoUrl}
                  name={resource.resourceOwnerName ?? ''}
                />
              )}
            </div>
            <div className={classes.resource}>
              <div className={classes.infoHeading}>
                <DsHeading
                  level={3}
                  data-size='sm'
                >
                  {resource.title}
                </DsHeading>
              </div>

              <DsParagraph>{resource.resourceOwnerName}</DsParagraph>
            </div>
          </div>
          <StatusSection
            userHasAccess={hasAccess}
            showDelegationCheckWarning={showMissingRightsStatus}
            cannotDelegateHere={cannotDelegateHere}
          />
          {resource.description && <DsParagraph>{resource.description}</DsParagraph>}
          {resource.rightDescription && <DsParagraph>{resource.rightDescription}</DsParagraph>}
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
                displayResourceAlert ||
                !rights.some((r) => r.checked === true) ||
                !hasUnsavedChanges
              }
              onClick={hasAccess ? delegateChosenRights : delegateChosenRights}
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
        </div>
      )}
    </>
  );
};
