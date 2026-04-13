import { Button, DsButton } from '@altinn/altinn-components';
import { CheckmarkIcon, EnvelopeClosedIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';

import type { DialogLookup } from '@/rtk/features/instanceApi';

import { getInboxLinkData } from './instancePresentation';

interface InstanceInboxLinkProps {
  instanceUrn: string;
  dialogLookup?: DialogLookup | null;
  dialogId?: string | null;
  isLarge?: boolean;
}

export const InstanceInboxLink = ({
  instanceUrn,
  dialogLookup,
  dialogId,
  isLarge = false,
}: InstanceInboxLinkProps) => {
  const { t } = useTranslation();
  const { href, isInboxDeepLink, showInboxLink } = getInboxLinkData({
    instanceUrn,
    dialogLookup,
    dialogId,
  });

  if (!showInboxLink) {
    return null;
  }

  const icon = isInboxDeepLink ? <CheckmarkIcon aria-hidden /> : <EnvelopeClosedIcon aria-hidden />;
  const text = isInboxDeepLink ? t('common.finished') : t('instance_detail_page.see_in_inbox');

  if (isLarge) {
    return (
      <DsButton
        asChild
        variant={isInboxDeepLink ? 'primary' : 'secondary'}
      >
        <a href={href}>
          {icon}
          {text}
        </a>
      </DsButton>
    );
  }

  return (
    <Button
      variant='tertiary'
      rounded
      size='xs'
      as='a'
      href={href}
    >
      {icon} {text}
    </Button>
  );
};
