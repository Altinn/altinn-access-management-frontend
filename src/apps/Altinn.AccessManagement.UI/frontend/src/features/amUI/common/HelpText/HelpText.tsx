import type { ReactNode } from 'react';
import { DsPopover } from '@altinn/altinn-components';
import { QuestionmarkCircleIcon } from '@navikt/aksel-icons';

interface HelpTextProps {
  'aria-label': string;
  children: ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const HelpText = ({
  'aria-label': ariaLabel,
  children,
  size = 'xs',
  className,
}: HelpTextProps) => {
  return (
    <DsPopover.TriggerContext>
      <DsPopover.Trigger
        icon
        variant='tertiary'
        aria-label={ariaLabel}
        data-size={size}
      >
        <QuestionmarkCircleIcon aria-hidden='true' />
      </DsPopover.Trigger>
      <DsPopover className={className}>{children}</DsPopover>
    </DsPopover.TriggerContext>
  );
};
