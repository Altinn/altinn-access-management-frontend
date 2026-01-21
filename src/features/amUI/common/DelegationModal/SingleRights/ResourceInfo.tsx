import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import {
  Avatar,
  Badge,
  Button,
  DsAlert,
  DsChip,
  DsHeading,
  DsParagraph,
  formatDisplayName,
  ListItem,
  SnackbarDuration,
  useSnackbar,
} from '@altinn/altinn-components';

import type {
  DelegationCheckedRight,
  ServiceResource,
} from '@/rtk/features/singleRights/singleRightsApi';
import {
  useDelegationCheckQuery,
  useGetSingleRightsForRightholderQuery,
} from '@/rtk/features/singleRights/singleRightsApi';
import type { DelegationResult } from '@/dataObjects/dtos/resourceDelegation';
import { RightStatus } from '@/dataObjects/dtos/resourceDelegation';
import { LocalizedAction } from '@/resources/utils/localizedActions';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { arraysEqualUnordered } from '@/resources/utils/arrayUtils';
import { useDelegateRights } from '@/resources/hooks/useDelegateRights';
import { useEditResource } from '@/resources/hooks/useEditResource';
import { PartyType, useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { ErrorCode } from '@/resources/utils/errorCodeUtils';
import { BFFDelegatedStatus } from '@/rtk/features/singleRights/singleRightsSlice';
import { StatusMessageForScreenReader } from '@/components/StatusMessageForScreenReader/StatusMessageForScreenReader';
import { useProviderLogoUrl } from '@/resources/hooks/useProviderLogoUrl';

import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { DeleteResourceButton } from '../../../userRightsPage/SingleRightsSection/DeleteResourceButton';

import classes from './ResourceInfo.module.css';
import { ResourceAlert } from './ResourceAlert';
import { StatusSection } from '../../StatusSection/StatusSection';
import { CheckmarkCircleIcon } from '@navikt/aksel-icons';
import { mapRightsToChipRights } from './ActionUtils';

export type ChipRight = {
  action: string;
  rightKey: string;
  delegable: boolean;
  checked: boolean;
  delegationReason: string;
};

export interface ResourceInfoProps {
  resource: ServiceResource;
  onDelegate?: () => void;
}

export const ResourceInfo = ({ resource, onDelegate }: ResourceInfoProps) => {
  const { t } = useTranslation();
  const [hasAccess, setHasAccess] = useState(false);
  const delegateRights = useDelegateRights();
  const editResource = useEditResource();
  const [currentRights, setCurrentRights] = useState<string[]>([]);
  const [rights, setRights] = useState<ChipRight[]>([]);
  const [rightsExpanded, setRightsExpanded] = useState(false);
  const { openSnackbar } = useSnackbar();
  const { id } = useParams();
  const { getProviderLogoUrl } = useProviderLogoUrl();

  const { toParty, fromParty } = usePartyRepresentation();
  const hasUnsavedChanges = !arraysEqualUnordered(
    rights.filter((r) => r.checked).map((r) => r.rightKey),
    currentRights,
  );
  const { data: reportee } = useGetReporteeQuery();

  const [delegationErrorMessage, setDelegationErrorMessage] = useState<string | null>(null);
  const [missingAccessMessage, setMissingAccessMessage] = useState<string | null>(null);

  const {
    data: delegationCheckedRights,
    isError: isDelegationCheckError,
    error: delegationCheckError,
  } = useDelegationCheckQuery(resource.identifier);

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

  const { data: delegatedResources, isFetching } = useGetSingleRightsForRightholderQuery({
    party: getCookie('AltinnPartyId'),
    userId: id || '',
  });

  useEffect(() => {
    if (delegatedResources && !isFetching) {
      const resourceDelegation =
        !!delegatedResources &&
        delegatedResources.find(
          (delegation) => delegation.resource.identifier === resource.identifier,
        );
      if (resourceDelegation) {
        setHasAccess(true);
        const rightKeys = resourceDelegation.delegation.rightDelegationResults.map(
          (r) => r.rightKey,
        );
        setCurrentRights(rightKeys);
      } else {
        setHasAccess(false);
        setCurrentRights([]);
      }
    }
  }, [delegatedResources, isFetching, resource.identifier]);

  const getMissingAccessMessage = (response: DelegationCheckedRight[]) => {
    const hasMissingRoleAccess = response.some((right) =>
      right.reasonCodes.some(
        (code) => code === ErrorCode.MissingRoleAccess || code === ErrorCode.MissingRightAccess,
      ),
    );
    const hasMissingSrrRightAccess = response.some(
      (right) =>
        !hasMissingRoleAccess &&
        right.reasonCodes.some(
          (code) =>
            code === ErrorCode.MissingSrrRightAccess || code === ErrorCode.AccessListValidationFail,
        ),
    );

    if (hasMissingRoleAccess) {
      return t('delegation_modal.specific_rights.missing_role_message');
    }
    if (hasMissingSrrRightAccess) {
      return t('delegation_modal.specific_rights.missing_srr_right_message', {
        resourceOwner: resource?.resourceOwnerName,
        reportee: reportee?.name,
      });
    }
    return null;
  };

  useEffect(() => {
    if (delegationCheckedRights) {
      setMissingAccessMessage(getMissingAccessMessage(delegationCheckedRights));

      if (hasAccess) {
        const chipRights: ChipRight[] = mapRightsToChipRights(
          delegationCheckedRights,
          (right) => currentRights.some((key) => key === right.rightKey),
          resource.resourceOwnerOrgcode,
        );
        setRights(chipRights);
      } else {
        const chipRights: ChipRight[] = mapRightsToChipRights(
          delegationCheckedRights,
          (right) => right.status === RightStatus.Delegable,
          resource.resourceOwnerOrgcode,
        );
        setRights(chipRights);
      }
    }
  }, [delegationCheckedRights, resource.identifier, hasAccess, currentRights]);

  const saveEditedRights = () => {
    const newRights = rights.filter((r) => r.checked).map((r) => r.rightKey);
    if (fromParty && toParty) {
      setDelegationErrorMessage(null);
      editResource(
        resource.identifier,
        fromParty?.partyUuid,
        toParty?.partyUuid,
        currentRights,
        newRights,
        () => {
          openSnackbar({
            message: t('delegation_modal.edit_success', { name: toParty?.name }),
            color: 'success',
          });
          onDelegate?.();
        },
        () =>
          openSnackbar({
            message: t('delegation_modal.error_message', { name: toParty?.name }),
            color: 'danger',
            duration: SnackbarDuration.infinite,
          }),
      );
    }
  };

  const delegateChosenRights = () => {
    const rightsToDelegate = rights.filter((right: ChipRight) => right.checked);

    delegateRights(
      rightsToDelegate,
      toParty?.partyUuid ?? '',
      resource,
      (response: DelegationResult) => {
        setDelegationErrorMessage(null);

        openSnackbar({
          message: t('delegation_modal.success_message', { name: toParty?.name }),
          color: 'success',
        });

        const notDelegatedActions = response.rightDelegationResults.filter(
          (result) =>
            rightsToDelegate.find((r) => r.rightKey === result.rightKey) &&
            result.status === BFFDelegatedStatus.NotDelegated,
        );

        if (notDelegatedActions.length > 0) {
          setDelegationErrorMessage(
            t('delegation_modal.technical_error_message.some_failed', {
              actions: notDelegatedActions.map((action) => action.action).join(', '),
            }),
          );
        } else {
          onDelegate?.();
        }
      },
      () => {
        setDelegationErrorMessage(
          t('delegation_modal.technical_error_message.all_failed', { name: toParty?.name }),
        );
      },
    );
  };

  const undelegableActions = rights.filter((r) => !r.delegable).map((r) => r.action);
  const chips = () =>
    rights
      .filter((right: ChipRight) => right.delegable)
      .map((right: ChipRight) => {
        const actionText = right.action;
        return (
          <div key={right.rightKey}>
            <DsChip.Checkbox
              className={classes.chip}
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

  const hasDelegableRights = rights.some((r) => r.delegable);
  const showMissingRightsStatus =
    !hasAccess && ((rights.length > 0 && !hasDelegableRights) || !!missingAccessMessage);
  const cannotDelegateHere = resource?.delegable === false;
  const emblem = getProviderLogoUrl(resource.resourceOwnerOrgcode ?? '');
  const toName = formatDisplayName({
    fullName: toParty?.name ?? '',
    type: toParty?.partyTypeName === PartyType.Organization ? 'company' : 'person',
  });

  return (
    <>
      <StatusMessageForScreenReader politenessSetting='assertive'>
        {delegationErrorMessage ?? missingAccessMessage ?? ''}
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
              {delegationErrorMessage && (
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
                    {t('delegation_modal.technical_error_message.message')} {delegationErrorMessage}
                  </DsParagraph>
                </DsAlert>
              )}
              {missingAccessMessage && (
                <DsAlert
                  data-color='info'
                  data-size='sm'
                >
                  {missingAccessMessage}
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
        </div>
      )}
    </>
  );
};
