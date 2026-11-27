import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import { DsAlert, DsHeading, DsParagraph } from '@altinn/altinn-components';

import classes from './RolesRemovedAlert.module.css';

export const RolesRemovedAlert = () => {
  const { t } = useTranslation();
  const { search } = useLocation();

  return (
    <DsAlert
      data-color='warning'
      data-testid='roles-removed-alert'
    >
      <DsHeading
        level={2}
        data-size='xs'
      >
        {t('role.roles_removed_heading')}
      </DsHeading>
      <DsParagraph className={classes.rolesRemovedAlertFirstParagraph}>
        <Trans i18nKey='role.roles_removed_content' />
      </DsParagraph>
      <DsParagraph>
        <Trans
          i18nKey='role.roles_removed_content2'
          components={{
            packages: (
              <Link
                to={{ search, hash: '' }}
                replace
              />
            ),
            singleRights: (
              <Link
                to={{ search, hash: '#singleRights' }}
                replace
              />
            ),
          }}
        />
      </DsParagraph>
    </DsAlert>
  );
};
