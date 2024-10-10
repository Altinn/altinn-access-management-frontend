import { ListItem } from '@digdir/designsystemet-react';
import { TrashIcon } from '@navikt/aksel-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { useRevokeRightsMutation } from '@/rtk/features/singleRights/singleRightsApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { DelegationType } from '@/features/apiDelegation/components/DelegationType';
import { Avatar } from '@/features/amUI/common/Avatar/Avatar';

import { ButtonWithConfirmPopup } from '../../common/ButtonWithConfirmPopup/ButtonWithConfirmPopup';
import { useSnackbar } from '../../common/Snackbar';
import { SnackbarDuration, SnackbarMessageVariant } from '../../common/Snackbar/SnackbarProvider';

import classes from './SingleRightsSection.module.css';

interface SingleRightItemProps {
  resource: ServiceResource;
}

const SingleRightItem: React.FC<SingleRightItemProps> = ({ resource }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { openSnackbar } = useSnackbar();

  const [revokeRights, { isLoading }] = useRevokeRightsMutation();

  const handleRevokeRights = async (resourceId: string) => {
    const { data } = await revokeRights({
      type: DelegationType.Offered,
      party: getCookie('AltinnPartyId'),
      userId: id || '',
      resourceId,
    });

    const isSuccessful = data?.isSuccessStatusCode;
    const snackbarData = {
      message: t(
        isSuccessful
          ? 'user_rights_page.delete_singleRight_success_message'
          : 'user_rights_page.delete_singleRight_error_message',
        { servicename: resource.title },
      ),
      variant: isSuccessful ? SnackbarMessageVariant.Success : SnackbarMessageVariant.Error,
      duration: isSuccessful ? SnackbarDuration.normal : SnackbarDuration.infinite,
    };
    openSnackbar(snackbarData);
  };

  return (
    <ListItem className={classes.singleRightItem}>
      <Avatar
        size='md'
        profile='serviceOwner'
        className={classes.icon}
        logoUrl={resource.resourceOwnerLogoUrl}
        name={resource.resourceOwnerName}
      />
      <div className={classes.title}>{resource.title}</div>
      <div className={classes.resourceType}>{t('user_rights_page.resource_type_text')}</div>
      <div className={classes.resourceOwnerName}>{resource.resourceOwnerName}</div>
      <div className={classes.action}>
        <ButtonWithConfirmPopup
          message={t('user_rights_page.delete_ingleRight_confirm_message')}
          triggerButtonProps={{
            disabled: isLoading,
            variant: 'tertiary',
            color: 'danger',
            icon: true,
            size: 'sm',
          }}
          triggerButtonContent={
            <>
              <TrashIcon />
              {t('common.delete')}
            </>
          }
          confirmButtonProps={{
            variant: 'primary',
            color: 'danger',
          }}
          confirmButtonContent={t('common.delete')}
          cancelButtonProps={{ variant: 'tertiary' }}
          cancelButtonContent={t('common.cancel')}
          onConfirm={() => handleRevokeRights(resource.identifier)}
        />
      </div>
    </ListItem>
  );
};

export default SingleRightItem;
