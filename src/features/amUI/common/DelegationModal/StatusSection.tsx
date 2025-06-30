import {
  CheckmarkCircleFillIcon,
  ExclamationmarkTriangleFillIcon,
  InformationSquareFillIcon,
} from '@navikt/aksel-icons';
import { Trans } from 'react-i18next';
import { t } from 'i18next';
import { DsParagraph } from '@altinn/altinn-components';

import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';

import classes from './StatusSection.module.css';

export const StatusSection = ({
  userHasAccess,
  showMissingRightsMessage,
  inheritedFrom,
  delegationCheckText,
}: {
  userHasAccess: boolean;
  showMissingRightsMessage: boolean;
  inheritedFrom?: string;
  delegationCheckText?: string;
}) => {
  const { fromParty, toParty } = usePartyRepresentation();

  if (!userHasAccess && !showMissingRightsMessage && !inheritedFrom) {
    return null;
  }

  return (
    <div
      className={classes.statusSection}
      aria-live='polite'
    >
      {userHasAccess && (
        <div className={classes.infoLine}>
          <CheckmarkCircleFillIcon
            fontSize='1.5rem'
            className={classes.hasPackageInfoIcon}
          />
          <DsParagraph data-size='xs'>
            <Trans
              i18nKey='delegation_modal.has_package_message'
              values={{
                user_name: toParty?.name,
              }}
            />
          </DsParagraph>
        </div>
      )}
      {inheritedFrom !== undefined && inheritedFrom.length > 0 && (
        <div className={classes.infoLine}>
          <InformationSquareFillIcon
            fontSize='1.5rem'
            className={classes.inheritedInfoIcon}
          />
          <DsParagraph data-size='xs'>
            <Trans
              i18nKey='delegation_modal.inherited_role_org_message'
              values={{
                user_name: toParty?.name,
                org_name: inheritedFrom ?? fromParty?.name,
              }}
            />
          </DsParagraph>
        </div>
      )}
      {showMissingRightsMessage && (
        <div className={classes.infoLine}>
          <ExclamationmarkTriangleFillIcon
            fontSize='1.5rem'
            className={classes.delegationCheckInfoIcon}
          />
          <DsParagraph data-size='xs'>
            <Trans
              i18nKey={delegationCheckText ?? 'delegation_modal.delegation_check_not_delegable'}
              components={{ b: <strong /> }}
              values={{
                you: t('common.you_uppercase'),
                reporteeorg: fromParty?.name,
              }}
            />
          </DsParagraph>
        </div>
      )}
    </div>
  );
};
