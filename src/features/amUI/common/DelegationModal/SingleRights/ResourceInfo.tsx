import * as React from 'react';
import { Alert, Button, Chip, Heading, Paragraph } from '@digdir/designsystemet-react';
import { Trans, useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Avatar, Badge } from '@altinn/altinn-components';

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
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { ErrorCode } from '@/resources/utils/errorCodeUtils';
import { BFFDelegatedStatus } from '@/rtk/features/singleRights/singleRightsSlice';
import { StatusMessageForScreenReader } from '@/components/StatusMessageForScreenReader/StatusMessageForScreenReader';

import { useSnackbar } from '../../Snackbar';
import { SnackbarDuration, SnackbarMessageVariant } from '../../Snackbar/SnackbarProvider';
import { DeleteResourceButton } from '../../../userRightsPage/SingleRightsSection/DeleteResourceButton';

import classes from './ResourceInfo.module.css';
import { ResourceAlert } from './ResourceAlert';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';

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
  const { openSnackbar } = useSnackbar();
  const { id } = useParams();

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

  const mapRightsToChipRights = (
    rights: DelegationCheckedRight[],
    checked: (right: DelegationCheckedRight) => boolean,
  ): ChipRight[] => {
    return rights.map((right: DelegationCheckedRight) => ({
      action: right.action,
      rightKey: right.rightKey,
      delegable:
        right.status === RightStatus.Delegable || right.status === BFFDelegatedStatus.Delegated,
      checked: checked(right) || false,
      delegationReason: right.reasonCodes[0],
    }));
  };

  useEffect(() => {
    if (delegationCheckedRights) {
      setMissingAccessMessage(getMissingAccessMessage(delegationCheckedRights));

      if (hasAccess) {
        const chipRights: ChipRight[] = mapRightsToChipRights(delegationCheckedRights, (right) =>
          currentRights.some((key) => key === right.rightKey),
        );
        setRights(chipRights);
      } else {
        const chipRights: ChipRight[] = mapRightsToChipRights(
          delegationCheckedRights,
          (right) => right.status === RightStatus.Delegable,
        );
        setRights(chipRights);
      }
    }
  }, [delegationCheckedRights]);

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
            variant: SnackbarMessageVariant.Default,
            duration: SnackbarDuration.long,
          });
          onDelegate?.();
        },
        () =>
          openSnackbar({
            message: t('delegation_modal.error_message', { name: toParty?.name }),
            variant: SnackbarMessageVariant.Default,
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
          variant: SnackbarMessageVariant.Default,
          duration: SnackbarDuration.long,
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

  const chips = () =>
    resource?.resourceType === 'AltinnApp' ? (
      <Chip.Checkbox
        data-size='sm'
        checked={rights.some((r) => r.checked === true)}
        disabled={!rights.some((r) => r.delegable === true)}
        onClick={() => {
          setRights(rights.map((r) => ({ ...r, checked: r.delegable ? !r.checked : r.checked })));
        }}
      >
        {t('common.action_access')}
      </Chip.Checkbox>
    ) : (
      rights.map((right: ChipRight) => {
        const actionText = Object.values(LocalizedAction).includes(right.action as LocalizedAction)
          ? t(`common.action_${right.action}`)
          : right.action;
        return (
          <div key={right.rightKey}>
            <Chip.Checkbox
              data-size='sm'
              checked={right.checked}
              disabled={!right.delegable}
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
            </Chip.Checkbox>
          </div>
        );
      })
    );

  return (
    <>
      <StatusMessageForScreenReader politenessSetting='assertive'>
        {delegationErrorMessage ?? missingAccessMessage ?? ''}
      </StatusMessageForScreenReader>
      {!!resource && (
        <div className={classes.infoView}>
          <div className={classes.infoHeading}>
            <Avatar
              size='lg'
              type='company'
              imageUrl={resource.resourceOwnerLogoUrl}
              name={resource.resourceOwnerName ?? ''}
            />
            <div className={classes.resource}>
              <div className={classes.infoHeading}>
                <Heading
                  level={3}
                  data-size='sm'
                >
                  {resource.title}
                </Heading>
                {hasAccess && (
                  <Badge
                    label={t('common.has_poa')}
                    theme='base'
                    data-color='success'
                  />
                )}
              </div>

              <Paragraph>{resource.resourceOwnerName}</Paragraph>
            </div>
          </div>
          {resource.description && <Paragraph>{resource.description}</Paragraph>}
          {resource.rightDescription && <Paragraph>{resource.rightDescription}</Paragraph>}
          {displayResourceAlert ? (
            <ResourceAlert
              error={delegationCheckErrorDetails}
              rightReasons={rights.map((r) => r.delegationReason)}
              resource={resource}
            />
          ) : (
            <>
              {delegationErrorMessage && (
                <Alert
                  data-color='danger'
                  data-size='sm'
                >
                  <Heading
                    level={3}
                    data-size='xs'
                  >
                    {t('delegation_modal.technical_error_message.heading')}
                  </Heading>
                  <Paragraph>
                    {t('delegation_modal.technical_error_message.message')} {delegationErrorMessage}
                  </Paragraph>
                </Alert>
              )}
              {missingAccessMessage && (
                <Alert
                  data-color='info'
                  data-size='sm'
                >
                  {missingAccessMessage}
                </Alert>
              )}
              <div className={classes.rightsSection}>
                <Heading
                  data-size='xs'
                  level={4}
                >
                  {hasAccess && !hasUnsavedChanges ? (
                    <Trans
                      i18nKey='delegation_modal.name_has_the_following'
                      values={{ name: toParty?.name }}
                      components={{ strong: <strong /> }}
                    />
                  ) : (
                    <Trans
                      i18nKey='delegation_modal.name_will_receive'
                      values={{ name: toParty?.name }}
                      components={{ strong: <strong /> }}
                    />
                  )}
                </Heading>
                <div className={classes.rightChips}>{chips()}</div>
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
                toParty={toParty}
                fullText
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};
