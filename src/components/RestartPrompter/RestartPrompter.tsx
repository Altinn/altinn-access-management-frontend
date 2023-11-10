import type { AlertProps } from '@digdir/design-system-react';
import { Alert, Heading, Ingress } from '@digdir/design-system-react';
import * as React from 'react';
import cn from 'classnames';

import classes from './RestartPrompter.module.css';

interface RestartPrompterProps extends Pick<AlertProps, 'severity'> {
  /* Sets spacing on the bottom of the component */
  spacingBottom?: boolean;

  /* Optional button that is displayed in the middle of the alert*/
  button?: React.ReactNode;

  /* Title to be displayed */
  title: string;

  /* optional ingress to be displayed */
  ingress?: string;
}

export const RestartPrompter = ({
  spacingBottom = false,
  button,
  title,
  ingress,
  severity = 'danger',
}: RestartPrompterProps) => {
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
      <div className={classes.restartButton}>{button}</div>
    </Alert>
  );
};
