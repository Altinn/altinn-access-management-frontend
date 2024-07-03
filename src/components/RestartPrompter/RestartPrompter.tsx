import type { AlertProps } from '@digdir/designsystemet-react';
import { Alert, Button, Heading, Ingress } from '@digdir/designsystemet-react';
import * as React from 'react';
import cn from 'classnames';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import classes from './RestartPrompter.module.css';

interface RestartPrompterProps extends Pick<AlertProps, 'severity'> {
  /* Sets spacing on the bottom of the component */
  spacingBottom?: boolean;

  /* Title to be displayed */
  title: string;

  /* Optional ingress to be displayed */
  ingress?: string;

  /* The path to where your navigated */
  restartPath?: string;
}

export const RestartPrompter = ({
  spacingBottom = false,
  title,
  ingress,
  severity = 'info',
  restartPath,
}: RestartPrompterProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Alert
      severity={severity}
      className={cn({ [classes.spacing]: spacingBottom })}
    >
      <Heading
        size='small'
        level={2}
      >
        {title}
      </Heading>
      {ingress && <Ingress>{ingress}</Ingress>}
      {restartPath && (
        <div className={classes.restartButton}>
          <Button
            variant='primary'
            color='first'
            size='medium'
            onClick={() => {
              navigate(restartPath);
            }}
          >
            {t('common.restart')}
          </Button>
        </div>
      )}
    </Alert>
  );
};
