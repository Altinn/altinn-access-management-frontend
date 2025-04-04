import { Paragraph } from '@digdir/designsystemet-react';
import {
  CheckmarkCircleFillIcon,
  ExclamationmarkTriangleFillIcon,
  InformationSquareFillIcon,
} from '@navikt/aksel-icons';
import { Trans } from 'react-i18next';
import { t } from 'i18next';

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

  return (
    <>
      {userHasAccess && (
        <div className={classes.infoLine}>
          <CheckmarkCircleFillIcon
            fontSize='1.5rem'
            className={classes.hasPackageInfoIcon}
          />
          <Paragraph data-size='xs'>
            <Trans
              i18nKey='delegation_modal.has_package_message'
              values={{
                user_name: toParty?.name,
              }}
            />
          </Paragraph>
        </div>
      )}
      {inheritedFrom !== undefined && inheritedFrom.length > 0 && (
        <div className={classes.inherited}>
          <InformationSquareFillIcon
            fontSize='1.5rem'
            className={classes.inheritedInfoIcon}
          />
          <Paragraph data-size='xs'>
            <Trans
              i18nKey='delegation_modal.inherited_role_org_message'
              values={{
                user_name: toParty?.name,
                org_name: inheritedFrom ?? fromParty?.name,
              }}
            />
          </Paragraph>
        </div>
      )}
      {showMissingRightsMessage && (
        <div className={classes.infoLine}>
          <ExclamationmarkTriangleFillIcon
            fontSize='1.5rem'
            className={classes.delegationCheckInfoIcon}
          />
          <Paragraph data-size='xs'>
            <Trans
              i18nKey={delegationCheckText ?? 'delegation_modal.delegation_check_not_delegable'}
              components={{ b: <strong /> }}
              values={{
                you: t('common.you_uppercase'),
                reporteeorg: fromParty?.name,
              }}
            />
          </Paragraph>
        </div>
      )}
    </>
  );
};
