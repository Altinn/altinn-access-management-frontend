import { Paragraph } from '@digdir/designsystemet-react';
import {
  CheckmarkCircleFillIcon,
  ExclamationmarkTriangleFillIcon,
  InformationSquareFillIcon,
} from '@navikt/aksel-icons';
import { Trans } from 'react-i18next';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';

import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';

import classes from './AccessPackageInfo.module.css';

export const StatusSection = ({
  accessPackage,
  userHasPackage,
  showMissingRightsMessage,
}: {
  accessPackage: AccessPackage;
  userHasPackage: boolean;
  showMissingRightsMessage: boolean;
}) => {
  const { fromParty, toParty } = usePartyRepresentation();

  if (!accessPackage) {
    return null;
  }

  return (
    <>
      {userHasPackage && (
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
      {accessPackage?.inherited && (
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
                org_name: accessPackage.inheritedFrom?.name ?? fromParty?.name,
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
            <Trans i18nKey='delegation_modal.delegation_check_not_delegable' />
          </Paragraph>
        </div>
      )}
    </>
  );
};
