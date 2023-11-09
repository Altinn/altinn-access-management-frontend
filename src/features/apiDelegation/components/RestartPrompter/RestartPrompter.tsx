import { Alert, Button, Heading, Ingress } from '@digdir/design-system-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import cn from 'classnames';

import { ApiDelegationPath } from '@/routes/paths';

import classes from './RestartPrompter.module.css';

interface RestartPrompterProps {
  spacingBottom?: boolean;
}

export const RestartPrompter = ({ spacingBottom = false }: RestartPrompterProps) => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  return (
    <Alert
      severity='danger'
      className={cn({ [classes.spacing]: spacingBottom })}
    >
      <Heading
        size='small'
        level={2}
      >
        {t('common.an_error_has_occured')}
      </Heading>
      <Ingress>{t('api_delegation.delegations_not_registered')}</Ingress>
      <div className={classes.restartButton}>
        <Button
          variant='secondary'
          color='first'
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
