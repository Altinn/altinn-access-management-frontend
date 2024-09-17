import { ListItem } from '@digdir/designsystemet-react';
import { FileIcon, TrashIcon } from '@navikt/aksel-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useRevokeRightsMutation } from '@/rtk/features/singleRights/singleRightsApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { DelegationType } from '@/features/apiDelegation/components/DelegationType';

import { ButtonWithConfirmPopup } from '../../common/ButtonWithConfirmPopup/ButtonWithConfirmPopup';

import classes from './SingleRightsSection.module.css';

interface SingleRightItemProps {
  identifier: string;
  title: string;
  resourceOwnerName: string;
}

const SingleRightItem: React.FC<SingleRightItemProps> = ({
  identifier,
  title,
  resourceOwnerName,
}) => {
  const { t } = useTranslation();
  const { id } = useParams();

  const [revokeRights, { isLoading }] = useRevokeRightsMutation();

  const handleRevokeRights = (resourceId: string) => {
    revokeRights({
      type: DelegationType.Offered,
      party: getCookie('AltinnPartyId'),
      userId: id || '',
      resourceId,
    });
  };

  return (
    <ListItem className={classes.singleRightItem}>
      <div className={classes.icon}>
        <FileIcon />
      </div>
      <div className={classes.title}>{title}</div>
      <div className={classes.resourceType}>{t('user_rights_page.resource_type_text')}</div>
      <div className={classes.resourceOwnerName}>{resourceOwnerName}</div>
      <div className={classes.action}>
        <ButtonWithConfirmPopup
          triggerButtonProps={{
            disabled: isLoading,
            variant: 'tertiary',
            color: 'danger',
            icon: true,
            size: 'md',
          }}
          onConfirm={() => handleRevokeRights(identifier)}
          message={'Er du sikker på at du vil slette denne?'}
          confirmButtonProps={{
            variant: 'primary',
            color: 'danger',
          }}
          cancelButtonProps={{ variant: 'secondary' }}
        >
          <TrashIcon />
          {t('common.delete')}
        </ButtonWithConfirmPopup>
      </div>
    </ListItem>
  );
};

export default SingleRightItem;
