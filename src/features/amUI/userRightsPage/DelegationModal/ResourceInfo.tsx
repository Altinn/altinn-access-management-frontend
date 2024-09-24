import * as React from 'react';
import { Button, Chip, Heading, Paragraph } from '@digdir/designsystemet-react';
import { Trans, useTranslation } from 'react-i18next';
import { FileIcon } from '@navikt/aksel-icons';
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
import { PartyType } from '@/rtk/features/userInfo/userInfoApi';
import { Avatar } from '@/components/Avatar/Avatar';

import classes from './ResourceInfo.module.css';

export type ChipRight = {
  action: string;
  rightKey: string;
  delegable: boolean;
  checked: boolean;
  resourceReference: IdValuePair[];
};

export interface ResourceInfoProps {
  resource?: ServiceResource;
  toParty: Party;
  onDelegate: () => void;
}

export const ResourceInfo = ({ resource, toParty, onDelegate }: ResourceInfoProps) => {
  const { t } = useTranslation();
  const [delegationCheck] = useDelegationCheckMutation();
  const [delegateRights] = useDelegateRightsMutation();
  const [rights, setRights] = useState<ChipRight[]>([]);
  const resourceRef: ResourceReference | null =
    resource !== undefined
      ? {
          resource: resource.authorizationReference,
        }
      : null;

  useEffect(() => {
    if (resourceRef) {
      delegationCheck(resourceRef)
        .unwrap()
        .then((response: DelegationAccessResult[]) => {
          const chipRights: ChipRight[] = response.map((right: DelegationAccessResult) => ({
            action: right.action,
            rightKey: right.rightKey,
            delegable: right.status === RightStatus.Delegable,
            checked: right.status === RightStatus.Delegable,
            resourceReference: right.resource,
          }));
          setRights(chipRights);
        });
    }
  }, []);

  const chips =
    resource?.resourceType === 'AltinnApp' ? (
      <Chip.Toggle
        size='small'
        checkmark
        selected={rights.some((r) => r.checked === true)}
        disabled={!rights.some((r) => r.delegable === true)}
        onClick={() => {
          setRights(rights.map((r) => ({ ...r, checked: r.delegable ? !r.checked : r.checked })));
        }}
      >
        {t('common.action_access')}
      </Chip.Toggle>
    ) : (
      rights.map((right: ChipRight) => {
        const actionText = Object.values(LocalizedAction).includes(right.action as LocalizedAction)
          ? t(`common.action_${right.action}`)
          : right.action;
        return (
          <div key={right.rightKey}>
            <Chip.Toggle
              size='sm'
              checkmark
              selected={right.checked}
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
            </Chip.Toggle>
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

      delegateRights(delegationInput).then(() => {
        onDelegate();
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
              icon={<FileIcon />}
            />
            <Heading
              level={3}
              size='md'
            >
              {resource.title}
            </Heading>
          </div>

          <Paragraph>{resource.rightDescription}</Paragraph>
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
          <Button
            className={classes.completeButton}
            fullWidth={false}
            disabled={!rights.some((r) => r.checked === true)}
            onClick={delegateChosenRights}
          >
            Gi fullmakt
          </Button>
        </div>
      )}
    </>
  );
};
