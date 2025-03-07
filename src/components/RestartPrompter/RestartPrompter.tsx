import type { AlertProps } from '@digdir/designsystemet-react';
import { Alert, Button, Heading, Paragraph } from '@digdir/designsystemet-react';
import * as React from 'react';
import cn from 'classnames';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import classes from './RestartPrompter.module.css';

interface RestartPrompterProps extends AlertProps {
  /* Sets spacing on the bottom of the component */
  spacingBottom?: boolean;

  severity?: 'info' | 'success' | 'warning' | 'danger';

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
      color={severity}
      className={cn({ [classes.spacing]: spacingBottom })}
    >
      <Heading
        data-size='sm'
        level={2}
        className={classes.title}
      >
        {title}
      </Heading>
      {ingress && <Paragraph variant='long'>{ingress}</Paragraph>}
      {restartPath && (
        <div className={classes.restartButton}>
          <Button
            variant='primary'
            data-color='accent'
            data-size='md'
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
