import { useTranslation } from 'react-i18next';
import { DsLink, DsParagraph, DsPopover } from '@altinn/altinn-components';
import { QuestionmarkCircleIcon } from '@navikt/aksel-icons';

import classes from './MaskinportenInfoPopover.module.css';

type MaskinportenInfoPopoverProps = {
  triggerAriaLabel: string;
  bodyBefore: string;
  bodyAfter?: string;
};

export const MaskinportenInfoPopover = ({
  triggerAriaLabel,
  bodyBefore,
  bodyAfter,
}: MaskinportenInfoPopoverProps) => {
  const { t } = useTranslation();
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
          <div className={classes.infoBox}>
            <DsParagraph>{bodyBefore}</DsParagraph>
            <DsLink
              href='https://samarbeid.digdir.no/maskinporten/maskinporten/25'
              target='_blank'
              rel='noopener noreferrer'
            >
              {t('maskinporten_page.info_box_link')}
            </DsLink>
            {bodyAfter && <DsParagraph>{bodyAfter}</DsParagraph>}
          </div>
        </DsPopover>
      </DsPopover.TriggerContext>
    </span>
  );
};
