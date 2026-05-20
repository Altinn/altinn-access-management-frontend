import type { ReactNode } from 'react';
import { DsPopover } from '@altinn/altinn-components';
import { QuestionmarkCircleIcon } from '@navikt/aksel-icons';

import classes from './InfoPopover.module.css';

interface InfoPopoverProps {
  triggerAriaLabel: string;
  children: ReactNode;
}

export const InfoPopover = ({ triggerAriaLabel, children }: InfoPopoverProps) => {
  return (
    <span>
      <DsPopover.TriggerContext>
        <DsPopover.Trigger
          icon
          variant='tertiary'
          data-size='xs'
        >
          <QuestionmarkCircleIcon aria-label={triggerAriaLabel} />
        </DsPopover.Trigger>
        <DsPopover className={classes.popover}>
          <div className={classes.infoBox}>{children}</div>
        </DsPopover>
      </DsPopover.TriggerContext>
    </span>
  );
};
