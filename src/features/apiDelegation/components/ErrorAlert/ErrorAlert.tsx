import { Alert, Button, Heading, Ingress } from '@digdir/design-system-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { ApiDelegationPath } from '@/routes/paths';

import classes from './ErrorAlert.module.css';

export const ErrorAlert = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  return (
    <Alert severity='danger'>
      <Heading
        size='small'
        level={2}
      >
        {t('common.an_error_has_occured')}
      </Heading>
      <Ingress>{t('api_delegation.delegations_not_registered')}</Ingress>
      <div className={classes.restartButton}>
        <Button
          variant='outline'
          color='danger'
          onClick={() => {
            navigate(
              '/' + ApiDelegationPath.OfferedApiDelegations + '/' + ApiDelegationPath.ChooseOrg,
            );
          }}
        >
          {t('common.restart')}
        </Button>
      </div>
    </Alert>
  );
};
