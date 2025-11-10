import React from 'react';

import { DsDialog, DsHeading, DsParagraph, DsSpinner } from '@altinn/altinn-components';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import { InformationSquareFillIcon } from '@navikt/aksel-icons';

import statusClasses from '../DelegationModal/StatusSection.module.css';
import classes from './RoleInfoModal.module.css';
import { useTranslation } from 'react-i18next';
import { useGetRoleByIdQuery } from '@/rtk/features/roleApi';

interface RoleInfoModal {
  open: boolean;
  onClose: () => void;
  roleId?: string;
}

export const RoleInfoModal = ({ open, onClose, roleId }: RoleInfoModal) => {
  const { t } = useTranslation();
  const { toParty, fromParty } = usePartyRepresentation();

  const getRoleQuery = useGetRoleByIdQuery(roleId ?? '', { skip: !roleId });
  const { data: roleData, isLoading } = getRoleQuery;

  const isExternal = roleData?.urn?.includes('external-role');

  return (
    <DsDialog
      open={open}
      onClose={onClose}
      closedby='any'
    >
      {!roleId || isLoading ? (
        <div className={classes.spinnerContainer}>
          <DsSpinner
            data-size='lg'
            aria-hidden='true'
          />
        </div>
      ) : (
        <div className={classes.modalContent}>
          <DsHeading
            level={2}
            data-size='sm'
            className={classes.heading}
          >
            {roleData?.name}
          </DsHeading>
          {isExternal && (
            <div className={statusClasses.infoLine}>
              <InformationSquareFillIcon
                fontSize='1.5rem'
                className={statusClasses.inheritedInfoIcon}
              />
              <DsParagraph data-size='xs'>{roleData?.provider?.name}</DsParagraph>
            </div>
          )}
          <DsParagraph>{roleData?.description}</DsParagraph>
        </div>
      )}
    </DsDialog>
  );
};
