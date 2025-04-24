import * as React from 'react';
import cn from 'classnames';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { DsAlertProps } from '@altinn/altinn-components';
import { DsAlert, DsHeading, DsParagraph, DsButton } from '@altinn/altinn-components';

import classes from './RestartPrompter.module.css';

interface RestartPrompterProps extends DsAlertProps {
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
    <DsAlert
      color={severity}
      className={cn({ [classes.spacing]: spacingBottom })}
    >
      <DsHeading
        data-size='sm'
        level={2}
        className={classes.title}
      >
        {title}
      </DsHeading>
      {ingress && <DsParagraph variant='long'>{ingress}</DsParagraph>}
      {restartPath && (
        <div className={classes.restartButton}>
          <DsButton
            variant='primary'
            data-color='accent'
            data-size='md'
            onClick={() => {
              navigate(restartPath);
            }}
          >
            {t('common.restart')}
          </DsButton>
        </div>
      )}
    </DsAlert>
  );
};
