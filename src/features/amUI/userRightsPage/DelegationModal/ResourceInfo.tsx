import * as React from 'react';
import { Alert, Button, Chip, Heading, Paragraph } from '@digdir/designsystemet-react';
import { Trans, useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

import type { Party } from '@/rtk/features/lookup/lookupApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import {
  useDelegationCheckMutation,
  useDelegateRightsMutation,
} from '@/rtk/features/singleRights/singleRightsApi';
import type { DelegationInputDto } from '@/dataObjects/dtos/resourceDelegation';
import {
  DelegationRequestDto,
  RightStatus,
  ServiceDto,
  type DelegationAccessResult,
  type ResourceReference,
} from '@/dataObjects/dtos/resourceDelegation';
import { IdValuePair } from '@/dataObjects/dtos/IdValuePair';
import { LocalizedAction } from '@/resources/utils/localizedActions';
import { PartyType, useGetReporteeQuery } from '@/rtk/features/userInfo/userInfoApi';
import { Avatar } from '@/features/amUI/common/Avatar/Avatar';
import { ErrorCode } from '@/resources/utils/errorCodeUtils';

import { useSnackbar } from '../../common/Snackbar';
import { SnackbarDuration, SnackbarMessageVariant } from '../../common/Snackbar/SnackbarProvider';

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
  resource?: ServiceResource;
  toParty: Party;
  onDelegate: () => void;
}

export const ResourceInfo = ({ resource, toParty, onDelegate }: ResourceInfoProps) => {
  const { t } = useTranslation();
  const [delegationCheck, error] = useDelegationCheckMutation();
  const [delegateRights] = useDelegateRightsMutation();
  const [rights, setRights] = useState<ChipRight[]>([]);
  const { openSnackbar } = useSnackbar();
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

          const chipRights: ChipRight[] = response.map((right: DelegationAccessResult) => ({
            action: right.action,
            rightKey: right.rightKey,
            delegable: right.status === RightStatus.Delegable,
            checked: right.status === RightStatus.Delegable,
            resourceReference: right.resource,
            delegationReason: right.details[0].code,
          }));
          setRights(chipRights);
        });
    }
  }, []);

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

  const delegateChosenRights = () => {
    let recipient: IdValuePair[];

    if (toParty.partyTypeName === PartyType.Person) {
      recipient = [new IdValuePair('urn:altinn:person:uuid', toParty.partyUuid)];
    } else if (toParty.partyTypeName === PartyType.Organization) {
      recipient = [new IdValuePair('urn:altinn:organization:uuid', toParty.partyUuid)];
    } else if (toParty.partyTypeName === PartyType.SelfIdentified) {
      recipient = [new IdValuePair('urn:altinn:enterpriseuser:uuid', toParty.partyUuid)];
    } else {
      throw new Error('Cannot delegate. User type not defined');
    }

    const rightsToDelegate = rights
      .filter((right: ChipRight) => right.checked)
      .map((right: ChipRight) => new DelegationRequestDto(right.resourceReference, right.action));

    if (resource && rightsToDelegate.length > 0) {
      const delegationInput: DelegationInputDto = {
        To: recipient,
        Rights: rightsToDelegate,
        serviceDto: new ServiceDto(
          resource.title,
          resource.resourceOwnerName,
          resource.resourceType,
        ),
      };

      delegateRights(delegationInput)
        .then(() => {
          openSnackbar({
            message: t('delegation_modal.success_message', { name: toParty.name }),
            variant: SnackbarMessageVariant.Success,
            duration: SnackbarDuration.long,
          });
          onDelegate();
        })
        .catch(() => {
          openSnackbar({
            message: t('delegation_modal.error_message', { name: toParty.name }),
            variant: SnackbarMessageVariant.Error,
            duration: SnackbarDuration.infinite,
          });
        });
    }
  };

  return (
    <>
      {resource && (
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
          {missingAccessMessage && <Alert color='info'>{missingAccessMessage}</Alert>}
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
              <div className={classes.rightsSection}>
                <Heading
                  size='xs'
                  level={4}
                >
                  <Trans
                    i18nKey='delegation_modal.name_will_receive'
                    values={{ name: toParty.name }}
                    components={{ strong: <strong /> }}
                  />
                </Heading>
                <div className={classes.rightChips}>{chips}</div>
              </div>
            </>
          )}
          <Button
            className={classes.completeButton}
            disabled={displayResourceAlert || !rights.some((r) => r.checked === true)}
            onClick={delegateChosenRights}
          >
            Gi fullmakt
          </Button>
        </div>
      )}
    </>
  );
};
