import * as React from 'react';
import { Alert, Button, Chip, Heading, Paragraph } from '@digdir/designsystemet-react';
import { Trans, useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useGetReporteePartyQuery, type Party } from '@/rtk/features/lookup/lookupApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import {
  useDelegationCheckMutation,
  useGetSingleRightsForRightholderQuery,
} from '@/rtk/features/singleRights/singleRightsApi';
import {
  RightStatus,
  type DelegationAccessResult,
  type ResourceReference,
} from '@/dataObjects/dtos/resourceDelegation';
import type { IdValuePair } from '@/dataObjects/dtos/IdValuePair';
import { LocalizedAction } from '@/resources/utils/localizedActions';
import { Avatar } from '@/features/amUI/common/Avatar/Avatar';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { arraysEqualUnordered } from '@/resources/utils/arrayUtils';
import { useDelegateRights } from '@/resources/hooks/useDelegateRights';
import { useEditResource } from '@/resources/hooks/useEditResource';
import { useGetReporteeQuery } from '@/rtk/features/userInfo/userInfoApi';
import { ErrorCode } from '@/resources/utils/errorCodeUtils';

import { useSnackbar } from '../../../common/Snackbar';
import {
  SnackbarDuration,
  SnackbarMessageVariant,
} from '../../../common/Snackbar/SnackbarProvider';
import { DeleteResourceButton } from '../../SingleRightsSection/DeleteResourceButton';

import classes from './ResourceInfo.module.css';
import { ResourceAlert } from './ResourceAlert';

export type ChipRight = {
  action: string;
  rightKey: string;
  delegable: boolean;
  checked: boolean;
  resourceReference: IdValuePair[];
  delegationReason: string;
};

export interface ResourceInfoProps {
  resource: ServiceResource;
  toParty: Party;
  onDelegate?: () => void;
}

export const ResourceInfo = ({ resource, toParty, onDelegate }: ResourceInfoProps) => {
  const { t } = useTranslation();
  const [delegationCheck, error] = useDelegationCheckMutation();
  const [hasAccess, setHasAccess] = useState(false);
  const delegateRights = useDelegateRights();
  const editResource = useEditResource();
  const [currentRights, setCurrentRights] = useState<string[]>([]);
  const [rights, setRights] = useState<ChipRight[]>([]);
  const { openSnackbar } = useSnackbar();
  const { id } = useParams();
  const { data: representingParty } = useGetReporteePartyQuery();
  const hasUnsavedChanges = !arraysEqualUnordered(
    rights.filter((r) => r.checked).map((r) => r.rightKey),
    currentRights,
  );
  const { data: reportee } = useGetReporteeQuery();

  const [missingAccessMessage, setMissingAccessMessage] = useState<string | null>(null);
  const displayResourceAlert =
    error.isError ||
    resource?.delegable === false ||
    (rights.length > 0 && !rights.some((r) => r.delegable === true));

  const resourceRef: ResourceReference | null =
    resource !== undefined
      ? {
          resource: resource.authorizationReference,
        }
      : null;

  const { data: delegatedResources, isFetching } = useGetSingleRightsForRightholderQuery({
    party: getCookie('AltinnPartyId'),
    userId: id || '',
  });

  const userHasResource =
    !!delegatedResources &&
    delegatedResources.some((delegation) => delegation.resource.identifier == resource.identifier);
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
  }, [delegatedResources, userHasResource, isFetching]);

  const getMissingAccessMessage = (response: DelegationAccessResult[]) => {
    const hasMissingRoleAccess = response.some((result) =>
      result.details?.some(
        (detail) =>
          detail.code === ErrorCode.MissingRoleAccess ||
          detail.code === ErrorCode.MissingRightAccess,
      ),
    );
    const hasMissingSrrRightAccess = response.some(
      (result) =>
        !hasMissingRoleAccess &&
        result.details?.some((detail) => detail.code === ErrorCode.MissingSrrRightAccess),
    );

    if (hasMissingRoleAccess) {
      return t('delegation_modal.specific_rights.missing_role_message');
    } else if (hasMissingSrrRightAccess) {
      return t('delegation_modal.specific_rights.missing_srr_right_message', {
        resourceOwner: resource?.resourceOwnerName,
        reportee: reportee?.name,
      });
    }
    return null;
  };

  useEffect(() => {
    if (resourceRef) {
      delegationCheck(resourceRef)
        .unwrap()
        .then((response: DelegationAccessResult[]) => {
          setMissingAccessMessage(getMissingAccessMessage(response));

          if (hasAccess) {
            const chipRights: ChipRight[] = response.map((right: DelegationAccessResult) => ({
              action: right.action,
              rightKey: right.rightKey,
              delegable: right.status === RightStatus.Delegable,
              checked: currentRights.some((key) => key === right.rightKey) ? true : false,
              resourceReference: right.resource,
              delegationReason: right.details[0].code,
            }));
            setRights(chipRights);
          } else {
            const chipRights: ChipRight[] = response.map((right: DelegationAccessResult) => ({
              action: right.action,
              rightKey: right.rightKey,
              delegable: right.status === RightStatus.Delegable,
              checked: right.status === RightStatus.Delegable,
              resourceReference: right.resource,
              delegationReason: right.details[0].code,
            }));
            setRights(chipRights);
          }
        });
    }
  }, [delegatedResources, currentRights]);

  const chips =
    resource?.resourceType === 'AltinnApp' ? (
      <Chip.Checkbox
        size='sm'
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
              size='sm'
              checked={right.checked}
              disabled={!right.delegable}
              onClick={() => {
                setRights(
                  rights.map((r) => {
                    if (r.rightKey == right.rightKey && r.delegable) {
                      return { ...r, checked: !r.checked };
                    } else {
                      return r;
                    }
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

  const saveEditedRights = () => {
    const newRights = rights.filter((r) => r.checked).map((r) => r.rightKey);
    if (representingParty) {
      editResource(
        resource.identifier,
        representingParty,
        toParty,
        currentRights,
        newRights,
        () => {
          openSnackbar({
            message: t('delegation_modal.edit_success', { name: toParty.name }),
            variant: SnackbarMessageVariant.Success,
            duration: SnackbarDuration.long,
          });
          onDelegate?.();
        },
        () =>
          openSnackbar({
            message: t('delegation_modal.error_message', { name: toParty.name }),
            variant: SnackbarMessageVariant.Error,
            duration: SnackbarDuration.infinite,
          }),
      );
    }
  };

  const delegateChosenRights = () => {
    const rightsToDelegate = rights.filter((right: ChipRight) => right.checked);

    delegateRights(
      rightsToDelegate,
      toParty,
      resource,
      () => {
        openSnackbar({
          message: t('delegation_modal.success_message', { name: toParty.name }),
          variant: SnackbarMessageVariant.Success,
          duration: SnackbarDuration.long,
        });
        onDelegate?.();
      },
      () =>
        openSnackbar({
          message: t('delegation_modal.error_message', { name: toParty.name }),
          variant: SnackbarMessageVariant.Error,
          duration: SnackbarDuration.infinite,
        }),
    );
  };

  return (
    <>
      {!!resource && (
        <div className={classes.infoView}>
          <div className={classes.infoHeading}>
            <Avatar
              size='lg'
              profile='serviceOwner'
              logoUrl={resource.resourceOwnerLogoUrl}
              name={resource.resourceOwnerName}
            />
            <div className={classes.resource}>
              <Heading
                level={3}
                size='sm'
              >
                {resource.title}
              </Heading>
              <Paragraph>{resource.resourceOwnerName}</Paragraph>
            </div>
          </div>
          <Paragraph>{resource.rightDescription}</Paragraph>
          {displayResourceAlert ? (
            <ResourceAlert
              error={
                error.isError
                  ? {
                      status: String(error?.error),
                      time: error.startedTimeStamp,
                    }
                  : null
              }
              rightReasons={rights.map((r) => r.delegationReason)}
              resource={resource}
            />
          ) : (
            <>
              {missingAccessMessage && (
                <Alert
                  color='info'
                  size='sm'
                >
                  {missingAccessMessage}
                </Alert>
              )}
              <div className={classes.rightsSection}>
                <Heading
                  size='xs'
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
                <div className={classes.rightChips}>{chips}</div>
              </div>
            </>
          )}
          <div className={classes.editButtons}>
            <Button
              size='sm'
              disabled={
                displayResourceAlert ||
                !rights.some((r) => r.checked === true) ||
                !hasUnsavedChanges
              }
              onClick={hasAccess ? saveEditedRights : delegateChosenRights}
            >
              {hasAccess ? t('common.update_poa') : t('common.give_poa')}
            </Button>
            {hasAccess && (
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
